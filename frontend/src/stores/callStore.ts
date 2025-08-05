import { create } from 'zustand';
import { User } from '../types';

export type CallType = 'voice' | 'video';
export type CallStatus = 'idle' | 'ringing' | 'connecting' | 'connected' | 'ended' | 'failed';
export type CallDirection = 'incoming' | 'outgoing';

export interface CallParticipant {
  user: User;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isSpeaking: boolean;
  isScreenSharing: boolean;
  connectionQuality: 'excellent' | 'good' | 'poor';
  joinedAt: Date;
}

export interface ActiveCall {
  id: string;
  type: CallType;
  status: CallStatus;
  direction: CallDirection;
  participants: CallParticipant[];
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  isGroupCall: boolean;
  conversationId?: string;
}

export interface CallHistory {
  id: string;
  type: CallType;
  direction: CallDirection;
  participants: User[];
  startTime: Date;
  endTime: Date;
  duration: number;
  missed: boolean;
  declined: boolean;
}

export interface CallSettings {
  camera: string | null;
  microphone: string | null;
  speaker: string | null;
  videoQuality: 'auto' | 'high' | 'medium' | 'low';
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  mirrorVideo: boolean;
}

interface CallState {
  // Active call
  activeCall: ActiveCall | null;
  
  // Incoming call
  incomingCall: ActiveCall | null;
  
  // Call history
  callHistory: CallHistory[];
  
  // Local media state
  localStream: MediaStream | null;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isScreenSharing: boolean;
  isSpeakerOn: boolean;
  
  // Remote streams
  remoteStreams: Record<string, MediaStream>;
  
  // Call settings
  settings: CallSettings;
  
  // Device lists
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
  
  // Actions
  startCall: (userId: string, type: CallType, conversationId?: string) => void;
  acceptCall: (callId: string) => void;
  declineCall: (callId: string) => void;
  endCall: () => void;
  
  // Media controls
  toggleVideo: () => void;
  toggleAudio: () => void;
  toggleScreenShare: () => void;
  toggleSpeaker: () => void;
  
  // Settings
  updateCallSettings: (settings: Partial<CallSettings>) => void;
  selectCamera: (deviceId: string) => void;
  selectMicrophone: (deviceId: string) => void;
  selectSpeaker: (deviceId: string) => void;
  
  // Stream management
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (userId: string, stream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  
  // Device management
  updateDevices: () => Promise<void>;
  
  // Call state updates
  updateCallStatus: (status: CallStatus) => void;
  addParticipant: (participant: CallParticipant) => void;
  removeParticipant: (userId: string) => void;
  updateParticipant: (userId: string, updates: Partial<CallParticipant>) => void;
  
  // History
  addToHistory: (call: CallHistory) => void;
  clearHistory: () => void;
  
  // Incoming call
  setIncomingCall: (call: ActiveCall | null) => void;
}

const defaultCallSettings: CallSettings = {
  camera: null,
  microphone: null,
  speaker: null,
  videoQuality: 'auto',
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  mirrorVideo: true,
};

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  incomingCall: null,
  callHistory: [],
  localStream: null,
  isVideoEnabled: true,
  isAudioEnabled: true,
  isScreenSharing: false,
  isSpeakerOn: false,
  remoteStreams: {},
  settings: defaultCallSettings,
  cameras: [],
  microphones: [],
  speakers: [],

  startCall: (userId, type, conversationId) => {
    const callId = `call-${Date.now()}`;
    const newCall: ActiveCall = {
      id: callId,
      type,
      status: 'connecting',
      direction: 'outgoing',
      participants: [],
      isGroupCall: false,
      conversationId,
    };
    
    set({ activeCall: newCall });
  },

  acceptCall: (callId) => {
    const state = get();
    if (state.incomingCall?.id === callId) {
      set({
        activeCall: {
          ...state.incomingCall,
          status: 'connecting',
        },
        incomingCall: null,
      });
    }
  },

  declineCall: (callId) => {
    const state = get();
    if (state.incomingCall?.id === callId) {
      // Add to history as declined
      const declined: CallHistory = {
        ...state.incomingCall,
        endTime: new Date(),
        duration: 0,
        missed: false,
        declined: true,
      };
      
      set({
        incomingCall: null,
        callHistory: [...state.callHistory, declined],
      });
    }
  },

  endCall: () => {
    const state = get();
    const { activeCall } = state;
    
    if (activeCall && activeCall.startTime) {
      const endTime = new Date();
      const duration = Math.floor((endTime.getTime() - activeCall.startTime.getTime()) / 1000);
      
      // Add to history
      const history: CallHistory = {
        id: activeCall.id,
        type: activeCall.type,
        direction: activeCall.direction,
        participants: activeCall.participants.map(p => p.user),
        startTime: activeCall.startTime,
        endTime,
        duration,
        missed: false,
        declined: false,
      };
      
      set({
        activeCall: null,
        callHistory: [...state.callHistory, history],
      });
    } else {
      set({ activeCall: null });
    }
    
    // Clean up streams
    state.localStream?.getTracks().forEach(track => track.stop());
    set({
      localStream: null,
      remoteStreams: {},
      isScreenSharing: false,
    });
  },

  toggleVideo: () => {
    const state = get();
    const { localStream, isVideoEnabled } = state;
    
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoEnabled;
      });
    }
    
    set({ isVideoEnabled: !isVideoEnabled });
    
    // Update participant status
    if (state.activeCall) {
      const currentUser = state.activeCall.participants.find(p => p.user.id === 'current-user-id');
      if (currentUser) {
        state.updateParticipant(currentUser.user.id, { isVideoEnabled: !isVideoEnabled });
      }
    }
  },

  toggleAudio: () => {
    const state = get();
    const { localStream, isAudioEnabled } = state;
    
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isAudioEnabled;
      });
    }
    
    set({ isAudioEnabled: !isAudioEnabled });
    
    // Update participant status
    if (state.activeCall) {
      const currentUser = state.activeCall.participants.find(p => p.user.id === 'current-user-id');
      if (currentUser) {
        state.updateParticipant(currentUser.user.id, { isAudioEnabled: !isAudioEnabled });
      }
    }
  },

  toggleScreenShare: async () => {
    const state = get();
    
    if (state.isScreenSharing) {
      // Stop screen sharing
      state.localStream?.getVideoTracks().forEach(track => {
        if (track.label.includes('screen')) {
          track.stop();
        }
      });
      set({ isScreenSharing: false });
    } else {
      try {
        // Start screen sharing
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
        
        // Replace video track
        if (state.localStream) {
          const videoTrack = screenStream.getVideoTracks()[0];
          const sender = (window as any).peerConnection
            ?.getSenders()
            .find((s: RTCRtpSender) => s.track?.kind === 'video');
          
          if (sender) {
            sender.replaceTrack(videoTrack);
          }
          
          videoTrack.onended = () => {
            set({ isScreenSharing: false });
          };
        }
        
        set({ isScreenSharing: true });
      } catch (error) {
        console.error('Failed to share screen:', error);
      }
    }
  },

  toggleSpeaker: () => set((state) => ({ isSpeakerOn: !state.isSpeakerOn })),

  updateCallSettings: (settings) =>
    set((state) => ({
      settings: { ...state.settings, ...settings },
    })),

  selectCamera: (deviceId) =>
    set((state) => ({
      settings: { ...state.settings, camera: deviceId },
    })),

  selectMicrophone: (deviceId) =>
    set((state) => ({
      settings: { ...state.settings, microphone: deviceId },
    })),

  selectSpeaker: (deviceId) =>
    set((state) => ({
      settings: { ...state.settings, speaker: deviceId },
    })),

  setLocalStream: (stream) => set({ localStream: stream }),

  addRemoteStream: (userId, stream) =>
    set((state) => ({
      remoteStreams: { ...state.remoteStreams, [userId]: stream },
    })),

  removeRemoteStream: (userId) =>
    set((state) => {
      const newStreams = { ...state.remoteStreams };
      delete newStreams[userId];
      return { remoteStreams: newStreams };
    }),

  updateDevices: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = devices.filter(d => d.kind === 'videoinput');
      const microphones = devices.filter(d => d.kind === 'audioinput');
      const speakers = devices.filter(d => d.kind === 'audiooutput');
      
      set({ cameras, microphones, speakers });
    } catch (error) {
      console.error('Failed to enumerate devices:', error);
    }
  },

  updateCallStatus: (status) =>
    set((state) => {
      if (!state.activeCall) return state;
      
      const updatedCall = { ...state.activeCall, status };
      
      if (status === 'connected' && !updatedCall.startTime) {
        updatedCall.startTime = new Date();
      } else if (status === 'ended' || status === 'failed') {
        updatedCall.endTime = new Date();
      }
      
      return { activeCall: updatedCall };
    }),

  addParticipant: (participant) =>
    set((state) => {
      if (!state.activeCall) return state;
      
      return {
        activeCall: {
          ...state.activeCall,
          participants: [...state.activeCall.participants, participant],
        },
      };
    }),

  removeParticipant: (userId) =>
    set((state) => {
      if (!state.activeCall) return state;
      
      return {
        activeCall: {
          ...state.activeCall,
          participants: state.activeCall.participants.filter(p => p.user.id !== userId),
        },
      };
    }),

  updateParticipant: (userId, updates) =>
    set((state) => {
      if (!state.activeCall) return state;
      
      return {
        activeCall: {
          ...state.activeCall,
          participants: state.activeCall.participants.map(p =>
            p.user.id === userId ? { ...p, ...updates } : p
          ),
        },
      };
    }),

  addToHistory: (call) =>
    set((state) => ({
      callHistory: [...state.callHistory, call],
    })),

  clearHistory: () => set({ callHistory: [] }),

  setIncomingCall: (call) => set({ incomingCall: call }),
}));

// Selectors
export const useActiveCall = () => useCallStore((state) => state.activeCall);
export const useIncomingCall = () => useCallStore((state) => state.incomingCall);
export const useCallHistory = () => useCallStore((state) => state.callHistory);
export const useCallSettings = () => useCallStore((state) => state.settings);