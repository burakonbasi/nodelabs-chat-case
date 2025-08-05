import { EventEmitter } from 'events';
import { WebRTCManager, defaultIceServers } from '../lib/webrtc';
import type { User, Call } from '../types';

export interface CallServiceConfig {
  iceServers?: RTCIceServer[];
  signalServer?: string;
  stunServer?: string;
  turnServer?: string;
  turnUsername?: string;
  turnPassword?: string;
}

export interface CallEvent {
  type: 'incoming' | 'outgoing' | 'connected' | 'ended' | 'failed' | 'missed';
  call: Call;
  reason?: string;
}

export interface SignalMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'hang-up' | 'reject' | 'busy';
  from: string;
  to: string;
  data: any;
  callId: string;
}

export class CallService extends EventEmitter {
  private config: CallServiceConfig;
  private webRTCManager: WebRTCManager | null = null;
  private currentCall: Call | null = null;
  private signalSocket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private missedCallTimeout: NodeJS.Timeout | null = null;

  constructor(config: CallServiceConfig = {}) {
    super();
    this.config = {
      iceServers: config.iceServers || defaultIceServers,
      signalServer: config.signalServer || 'wss://signal.example.com',
      ...config
    };
    
    this.initializeWebRTC();
    this.connectSignalServer();
  }

  private initializeWebRTC() {
    const iceServers = [...this.config.iceServers!];
    
    // Add TURN server if configured
    if (this.config.turnServer && this.config.turnUsername && this.config.turnPassword) {
      iceServers.push({
        urls: this.config.turnServer,
        username: this.config.turnUsername,
        credential: this.config.turnPassword
      });
    }

    this.webRTCManager = new WebRTCManager({ iceServers });
    
    // Setup WebRTC event handlers
    this.webRTCManager.on('iceCandidate', (candidate) => {
      if (this.currentCall) {
        this.sendSignal({
          type: 'ice-candidate',
          from: this.currentCall.from,
          to: this.currentCall.to,
          data: candidate,
          callId: this.currentCall.id
        });
      }
    });

    this.webRTCManager.on('callStateChange', (state) => {
      if (this.currentCall) {
        this.currentCall.state = state;
        this.emit('callStateChange', { call: this.currentCall, state });
      }
    });

    this.webRTCManager.on('localStream', (stream) => {
      this.emit('localStream', stream);
    });

    this.webRTCManager.on('remoteStream', (stream) => {
      this.emit('remoteStream', stream);
    });
  }

  private connectSignalServer() {
    if (!this.config.signalServer) return;

    try {
      this.signalSocket = new WebSocket(this.config.signalServer);
      
      this.signalSocket.onopen = () => {
        console.log('Connected to signal server');
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('signalConnected');
      };

      this.signalSocket.onmessage = (event) => {
        try {
          const message: SignalMessage = JSON.parse(event.data);
          this.handleSignalMessage(message);
        } catch (error) {
          console.error('Failed to parse signal message:', error);
        }
      };

      this.signalSocket.onclose = () => {
        console.log('Disconnected from signal server');
        this.stopHeartbeat();
        this.emit('signalDisconnected');
        this.attemptReconnect();
      };

      this.signalSocket.onerror = (error) => {
        console.error('Signal server error:', error);
        this.emit('signalError', error);
      };
    } catch (error) {
      console.error('Failed to connect to signal server:', error);
      this.attemptReconnect();
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('signalFailed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connectSignalServer();
    }, delay);
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.signalSocket?.readyState === WebSocket.OPEN) {
        this.signalSocket.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private sendSignal(message: SignalMessage) {
    if (this.signalSocket?.readyState === WebSocket.OPEN) {
      this.signalSocket.send(JSON.stringify(message));
    } else {
      console.error('Cannot send signal: WebSocket not connected');
    }
  }

  private async handleSignalMessage(message: SignalMessage) {
    switch (message.type) {
      case 'offer':
        await this.handleIncomingCall(message);
        break;
      
      case 'answer':
        await this.handleCallAnswer(message);
        break;
      
      case 'ice-candidate':
        await this.handleIceCandidate(message);
        break;
      
      case 'hang-up':
        this.handleHangUp(message);
        break;
      
      case 'reject':
        this.handleReject(message);
        break;
      
      case 'busy':
        this.handleBusy(message);
        break;
    }
  }

  private async handleIncomingCall(message: SignalMessage) {
    // Create call object
    const call: Call = {
      id: message.callId,
      from: message.from,
      to: message.to,
      type: message.data.callType || 'audio',
      state: 'ringing',
      startTime: new Date(),
      isIncoming: true
    };

    this.currentCall = call;
    
    // Set missed call timeout (30 seconds)
    this.missedCallTimeout = setTimeout(() => {
      if (this.currentCall?.state === 'ringing') {
        this.handleMissedCall();
      }
    }, 30000);

    // Initialize WebRTC for incoming call
    await this.webRTCManager?.initializeCall({
      audio: true,
      video: call.type === 'video'
    });

    // Store the offer
    this.currentCall.offer = message.data.offer;
    
    // Emit incoming call event
    this.emit('incomingCall', { type: 'incoming', call });
  }

  private async handleCallAnswer(message: SignalMessage) {
    if (!this.currentCall || !this.webRTCManager) return;

    try {
      await this.webRTCManager.setRemoteDescription(message.data.answer);
      this.currentCall.state = 'connected';
      this.emit('callConnected', { type: 'connected', call: this.currentCall });
    } catch (error) {
      console.error('Failed to handle call answer:', error);
      this.endCall('failed');
    }
  }

  private async handleIceCandidate(message: SignalMessage) {
    if (!this.webRTCManager) return;

    try {
      await this.webRTCManager.addIceCandidate(message.data);
    } catch (error) {
      console.error('Failed to add ICE candidate:', error);
    }
  }

  private handleHangUp(message: SignalMessage) {
    this.endCall('ended');
  }

  private handleReject(message: SignalMessage) {
    this.endCall('rejected');
  }

  private handleBusy(message: SignalMessage) {
    this.endCall('busy');
  }

  private handleMissedCall() {
    if (this.currentCall) {
      this.currentCall.state = 'ended';
      this.emit('missedCall', { type: 'missed', call: this.currentCall });
      this.cleanup();
    }
  }

  // Public Methods
  async startCall(
    to: string,
    type: 'audio' | 'video' = 'audio'
  ): Promise<Call> {
    if (this.currentCall) {
      throw new Error('Already in a call');
    }

    // Create call object
    const call: Call = {
      id: this.generateCallId(),
      from: this.getCurrentUserId(),
      to,
      type,
      state: 'calling',
      startTime: new Date(),
      isIncoming: false
    };

    this.currentCall = call;

    try {
      // Initialize WebRTC
      await this.webRTCManager!.initializeCall({
        audio: true,
        video: type === 'video'
      });

      // Create offer
      const offer = await this.webRTCManager!.createOffer();

      // Send offer through signaling
      this.sendSignal({
        type: 'offer',
        from: call.from,
        to: call.to,
        data: { offer, callType: type },
        callId: call.id
      });

      this.emit('outgoingCall', { type: 'outgoing', call });
      return call;
    } catch (error) {
      this.endCall('failed');
      throw error;
    }
  }

  async acceptCall(): Promise<void> {
    if (!this.currentCall || !this.currentCall.isIncoming || !this.webRTCManager) {
      throw new Error('No incoming call to accept');
    }

    // Clear missed call timeout
    if (this.missedCallTimeout) {
      clearTimeout(this.missedCallTimeout);
      this.missedCallTimeout = null;
    }

    try {
      // Create and send answer
      const answer = await this.webRTCManager.createAnswer(this.currentCall.offer!);
      
      this.sendSignal({
        type: 'answer',
        from: this.currentCall.from,
        to: this.currentCall.to,
        data: { answer },
        callId: this.currentCall.id
      });

      this.currentCall.state = 'connected';
      this.currentCall.connectedTime = new Date();
      
      this.emit('callConnected', { type: 'connected', call: this.currentCall });
    } catch (error) {
      console.error('Failed to accept call:', error);
      this.endCall('failed');
      throw error;
    }
  }

  rejectCall(): void {
    if (!this.currentCall || !this.currentCall.isIncoming) {
      throw new Error('No incoming call to reject');
    }

    this.sendSignal({
      type: 'reject',
      from: this.currentCall.from,
      to: this.currentCall.to,
      data: {},
      callId: this.currentCall.id
    });

    this.endCall('rejected');
  }

  endCall(reason: string = 'ended'): void {
    if (!this.currentCall) return;

    // Send hang up signal
    this.sendSignal({
      type: 'hang-up',
      from: this.currentCall.from,
      to: this.currentCall.to,
      data: { reason },
      callId: this.currentCall.id
    });

    // Calculate call duration
    if (this.currentCall.connectedTime) {
      this.currentCall.duration = Math.floor(
        (Date.now() - this.currentCall.connectedTime.getTime()) / 1000
      );
    }

    this.currentCall.state = 'ended';
    this.currentCall.endTime = new Date();
    
    this.emit('callEnded', { 
      type: 'ended', 
      call: this.currentCall,
      reason 
    });

    this.cleanup();
  }

  toggleMute(): boolean {
    if (!this.webRTCManager) return false;
    this.webRTCManager.toggleAudio();
    const isMuted = this.currentCall?.isMuted || false;
    if (this.currentCall) {
      this.currentCall.isMuted = !isMuted;
    }
    return !isMuted;
  }

  toggleVideo(): boolean {
    if (!this.webRTCManager) return false;
    this.webRTCManager.toggleVideo();
    const isVideoEnabled = this.currentCall?.isVideoEnabled || false;
    if (this.currentCall) {
      this.currentCall.isVideoEnabled = !isVideoEnabled;
    }
    return !isVideoEnabled;
  }

  toggleSpeaker(): boolean {
    const isSpeakerOn = this.currentCall?.isSpeakerOn || false;
    if (this.currentCall) {
      this.currentCall.isSpeakerOn = !isSpeakerOn;
    }
    this.emit('speakerToggle', !isSpeakerOn);
    return !isSpeakerOn;
  }

  async shareScreen(): Promise<MediaStream | null> {
    if (!this.webRTCManager || !this.currentCall) return null;
    
    try {
      const stream = await this.webRTCManager.shareScreen();
      this.currentCall.isScreenSharing = true;
      return stream;
    } catch (error) {
      console.error('Failed to share screen:', error);
      return null;
    }
  }

  stopScreenShare(): void {
    if (!this.webRTCManager || !this.currentCall) return;
    
    this.webRTCManager.stopScreenShare();
    this.currentCall.isScreenSharing = false;
  }

  getCurrentCall(): Call | null {
    return this.currentCall;
  }

  getCallStats(): Promise<RTCStatsReport> | undefined {
    return this.webRTCManager?.getStats();
  }

  private cleanup() {
    // Clear timeouts
    if (this.missedCallTimeout) {
      clearTimeout(this.missedCallTimeout);
      this.missedCallTimeout = null;
    }

    // End WebRTC
    this.webRTCManager?.endCall();
    
    // Clear current call
    this.currentCall = null;
  }

  private generateCallId(): string {
    return `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentUserId(): string {
    // This should be implemented to get the actual current user ID
    // For now, returning a placeholder
    return 'current_user_id';
  }

  destroy() {
    this.endCall('service_destroyed');
    this.stopHeartbeat();
    this.signalSocket?.close();
    this.webRTCManager?.removeAllListeners();
    this.removeAllListeners();
  }
}

// Singleton instance
let callService: CallService | null = null;

export function getCallService(config?: CallServiceConfig): CallService {
  if (!callService) {
    callService = new CallService(config);
  }
  return callService;
}

export function destroyCallService() {
  if (callService) {
    callService.destroy();
    callService = null;
  }
}