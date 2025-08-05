import { EventEmitter } from 'events';

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  mediaConstraints?: MediaStreamConstraints;
}

export interface CallOptions {
  audio?: boolean;
  video?: boolean;
  screen?: boolean;
}

export type CallState = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended' | 'failed';

export class WebRTCManager extends EventEmitter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private config: WebRTCConfig;
  private callState: CallState = 'idle';

  constructor(config: WebRTCConfig) {
    super();
    this.config = config;
  }

  async initializeCall(options: CallOptions = { audio: true, video: true }) {
    try {
      // Get user media
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: options.audio,
        video: options.video ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        } : false
      });

      // Create peer connection
      this.peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers
      });

      // Add local stream tracks to peer connection
      this.localStream.getTracks().forEach(track => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream);
        }
      });

      // Setup event handlers
      this.setupPeerConnectionHandlers();

      // Create data channel for messages
      this.dataChannel = this.peerConnection.createDataChannel('messages', {
        ordered: true
      });
      this.setupDataChannelHandlers();

      this.emit('localStream', this.localStream);
      this.updateCallState('calling');

      return this.localStream;
    } catch (error) {
      this.updateCallState('failed');
      throw error;
    }
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    const offer = await this.peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });

    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');

    await this.peerConnection.setRemoteDescription(offer);
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    return answer;
  }

  async setRemoteDescription(description: RTCSessionDescriptionInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(candidate: RTCIceCandidateInit) {
    if (!this.peerConnection) throw new Error('Peer connection not initialized');
    await this.peerConnection.addIceCandidate(candidate);
  }

  toggleAudio(enabled?: boolean) {
    if (!this.localStream) return;

    const audioTracks = this.localStream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    this.emit('audioToggled', audioTracks[0]?.enabled || false);
  }

  toggleVideo(enabled?: boolean) {
    if (!this.localStream) return;

    const videoTracks = this.localStream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = enabled !== undefined ? enabled : !track.enabled;
    });

    this.emit('videoToggled', videoTracks[0]?.enabled || false);
  }

  async switchCamera() {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (!videoTrack) return;

    const constraints = videoTrack.getConstraints();
    const currentFacingMode = constraints.facingMode || 'user';
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

    const newStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: newFacingMode },
      audio: false
    });

    const newVideoTrack = newStream.getVideoTracks()[0];
    const sender = this.peerConnection
      ?.getSenders()
      .find(s => s.track?.kind === 'video');

    if (sender) {
      await sender.replaceTrack(newVideoTrack);
    }

    // Replace in local stream
    this.localStream.removeTrack(videoTrack);
    this.localStream.addTrack(newVideoTrack);
    videoTrack.stop();

    this.emit('cameraSwitch', newFacingMode);
  }

  async shareScreen() {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection
        ?.getSenders()
        .find(s => s.track?.kind === 'video');

      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      screenTrack.onended = () => {
        this.stopScreenShare();
      };

      this.emit('screenShare', true);
      return screenStream;
    } catch (error) {
      console.error('Error sharing screen:', error);
      throw error;
    }
  }

  async stopScreenShare() {
    if (!this.localStream) return;

    const videoTrack = this.localStream.getVideoTracks()[0];
    const sender = this.peerConnection
      ?.getSenders()
      .find(s => s.track?.kind === 'video');

    if (sender && videoTrack) {
      await sender.replaceTrack(videoTrack);
    }

    this.emit('screenShare', false);
  }

  sendMessage(message: string) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(message);
    }
  }

  endCall() {
    // Stop all tracks
    this.localStream?.getTracks().forEach(track => track.stop());
    this.remoteStream?.getTracks().forEach(track => track.stop());

    // Close connections
    this.dataChannel?.close();
    this.peerConnection?.close();

    // Reset state
    this.localStream = null;
    this.remoteStream = null;
    this.dataChannel = null;
    this.peerConnection = null;

    this.updateCallState('ended');
    this.emit('callEnded');
  }

  getCallState(): CallState {
    return this.callState;
  }

  getStats(): Promise<RTCStatsReport> | undefined {
    return this.peerConnection?.getStats();
  }

  private setupPeerConnectionHandlers() {
    if (!this.peerConnection) return;

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.emit('iceCandidate', event.candidate);
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        this.emit('remoteStream', this.remoteStream);
      }
      this.remoteStream.addTrack(event.track);
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      this.emit('connectionStateChange', state);

      if (state === 'connected') {
        this.updateCallState('connected');
      } else if (state === 'failed' || state === 'disconnected') {
        this.updateCallState('failed');
      }
    };

    this.peerConnection.ondatachannel = (event) => {
      const channel = event.channel;
      channel.onmessage = (messageEvent) => {
        this.emit('message', messageEvent.data);
      };
    };
  }

  private setupDataChannelHandlers() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      this.emit('dataChannelOpen');
    };

    this.dataChannel.onclose = () => {
      this.emit('dataChannelClose');
    };

    this.dataChannel.onerror = (error) => {
      this.emit('dataChannelError', error);
    };
  }

  private updateCallState(state: CallState) {
    this.callState = state;
    this.emit('callStateChange', state);
  }
}

// Singleton instance
let webRTCManager: WebRTCManager | null = null;

export function getWebRTCManager(config?: WebRTCConfig): WebRTCManager {
  if (!webRTCManager && config) {
    webRTCManager = new WebRTCManager(config);
  }
  if (!webRTCManager) {
    throw new Error('WebRTC Manager not initialized');
  }
  return webRTCManager;
}

// Default ICE servers
export const defaultIceServers: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' }
];