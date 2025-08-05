import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, PhoneOff, Mic, MicOff, Video, VideoOff, 
  Volume2, VolumeX, Monitor, Users, MessageSquare,
  Minimize2, Maximize2, Camera, MoreVertical, X
} from 'lucide-react';
import { UserAvatar } from '../user/UserAvatar';
import { formatDuration } from '../../lib/media';
import type { User } from '../../types';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
  callType: 'audio' | 'video';
  isIncoming: boolean;
  participants: User[];
  onAccept?: () => void;
  onDecline?: () => void;
  onEnd: () => void;
}

type CallState = 'ringing' | 'connecting' | 'connected' | 'ended';

export const CallModal: React.FC<CallModalProps> = ({
  isOpen,
  onClose,
  callType,
  isIncoming,
  participants,
  onAccept,
  onDecline,
  onEnd
}) => {
  const [callState, setCallState] = useState<CallState>(isIncoming ? 'ringing' : 'connecting');
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(callType === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showChat, setShowChat] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  // Start call duration timer
  useEffect(() => {
    if (callState === 'connected') {
      durationIntervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      setDuration(0);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [callState]);

  // Auto-hide controls
  useEffect(() => {
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      
      setShowControls(true);
      
      controlsTimeoutRef.current = setTimeout(() => {
        if (callState === 'connected' && !isMinimized) {
          setShowControls(false);
        }
      }, 3000);
    };

    if (callType === 'video') {
      window.addEventListener('mousemove', hideControls);
      hideControls();
    }

    return () => {
      window.removeEventListener('mousemove', hideControls);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [callState, callType, isMinimized]);

  // Simulate call connection
  useEffect(() => {
    if (!isIncoming && callState === 'connecting') {
      const timer = setTimeout(() => {
        setCallState('connected');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isIncoming, callState]);

  const handleAccept = useCallback(() => {
    setCallState('connecting');
    onAccept?.();
    setTimeout(() => {
      setCallState('connected');
    }, 1000);
  }, [onAccept]);

  const handleDecline = useCallback(() => {
    setCallState('ended');
    onDecline?.();
    setTimeout(onClose, 500);
  }, [onDecline, onClose]);

  const handleEnd = useCallback(() => {
    setCallState('ended');
    onEnd();
    setTimeout(onClose, 500);
  }, [onEnd, onClose]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(!isVideoEnabled);
  }, [isVideoEnabled]);

  const toggleSpeaker = useCallback(() => {
    setIsSpeakerOn(!isSpeakerOn);
  }, [isSpeakerOn]);

  const toggleScreenShare = useCallback(() => {
    setIsScreenSharing(!isScreenSharing);
  }, [isScreenSharing]);

  const switchCamera = useCallback(() => {
    // Camera switch logic
    console.log('Switching camera');
  }, []);

  if (!isOpen) return null;

  const isGroup = participants.length > 1;
  const primaryParticipant = participants[0];

  // Minimized view
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 w-80 bg-gray-900 rounded-lg shadow-xl z-50">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-3">
            <UserAvatar user={primaryParticipant} size="sm" />
            <div>
              <p className="font-medium text-white">
                {isGroup ? `Group call (${participants.length})` : primaryParticipant.name}
              </p>
              <p className="text-sm text-gray-400">
                {callState === 'connected' ? formatDuration(duration) : callState}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Maximize2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleEnd}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              <PhoneOff className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Video Background */}
      {callType === 'video' && (
        <div className="absolute inset-0">
          {/* Remote Video */}
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
          />
          
          {/* Local Video */}
          {isVideoEnabled && (
            <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden shadow-lg">
              <video
                ref={localVideoRef}
                className="w-full h-full object-cover mirror"
                autoPlay
                playsInline
                muted
              />
              <button
                onClick={switchCamera}
                className="absolute bottom-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
              >
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Audio Call UI */}
      {callType === 'audio' && (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <UserAvatar user={primaryParticipant} size="2xl" className="mx-auto mb-6" />
            <h2 className="text-2xl font-semibold text-white mb-2">
              {isGroup ? `Group call (${participants.length})` : primaryParticipant.name}
            </h2>
            <p className="text-gray-400">
              {callState === 'ringing' && isIncoming && 'Incoming call...'}
              {callState === 'ringing' && !isIncoming && 'Calling...'}
              {callState === 'connecting' && 'Connecting...'}
              {callState === 'connected' && formatDuration(duration)}
              {callState === 'ended' && 'Call ended'}
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/70 to-transparent p-4 transition-opacity duration-300 ${
        showControls || callType === 'audio' ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {callType === 'video' && (
              <>
                <UserAvatar user={primaryParticipant} size="sm" />
                <div>
                  <p className="font-medium text-white">
                    {isGroup ? `Group call (${participants.length})` : primaryParticipant.name}
                  </p>
                  <p className="text-sm text-gray-300">
                    {callState === 'connected' ? formatDuration(duration) : callState}
                  </p>
                </div>
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minimize2 className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 transition-opacity duration-300 ${
        showControls || callType === 'audio' || callState !== 'connected' ? 'opacity-100' : 'opacity-0'
      }`}>
        {/* Incoming Call Actions */}
        {callState === 'ringing' && isIncoming && (
          <div className="flex items-center justify-center gap-16">
            <button
              onClick={handleDecline}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
            >
              <PhoneOff className="w-8 h-8 text-white" />
            </button>
            <button
              onClick={handleAccept}
              className="p-4 bg-green-600 hover:bg-green-700 rounded-full transition-colors animate-pulse"
            >
              <Phone className="w-8 h-8 text-white" />
            </button>
          </div>
        )}

        {/* Connected Call Controls */}
        {(callState === 'connected' || callState === 'connecting') && (
          <div className="flex items-center justify-center gap-4">
            {/* Main Controls */}
            <button
              onClick={toggleMute}
              className={`p-4 rounded-full transition-colors ${
                isMuted 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <MicOff className="w-6 h-6 text-white" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </button>

            {callType === 'video' && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${
                  !isVideoEnabled 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {isVideoEnabled ? (
                  <Video className="w-6 h-6 text-white" />
                ) : (
                  <VideoOff className="w-6 h-6 text-white" />
                )}
              </button>
            )}

            <button
              onClick={handleEnd}
              className="p-4 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
              title="End call"
            >
              <PhoneOff className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={toggleSpeaker}
              className={`p-4 rounded-full transition-colors ${
                isSpeakerOn 
                  ? 'bg-primary-600 hover:bg-primary-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title={isSpeakerOn ? 'Speaker off' : 'Speaker on'}
            >
              {isSpeakerOn ? (
                <Volume2 className="w-6 h-6 text-white" />
              ) : (
                <VolumeX className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Additional Controls */}
            <div className="ml-8 flex items-center gap-2">
              <button
                onClick={toggleScreenShare}
                className={`p-3 rounded-full transition-colors ${
                  isScreenSharing 
                    ? 'bg-primary-600 hover:bg-primary-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Share screen"
              >
                <Monitor className="w-5 h-5 text-white" />
              </button>

              {isGroup && (
                <button
                  className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                  title="Participants"
                >
                  <Users className="w-5 h-5 text-white" />
                </button>
              )}

              <button
                onClick={() => setShowChat(!showChat)}
                className={`p-3 rounded-full transition-colors ${
                  showChat 
                    ? 'bg-primary-600 hover:bg-primary-700' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
                title="Chat"
              >
                <MessageSquare className="w-5 h-5 text-white" />
              </button>

              <button
                className="p-3 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                title="More options"
              >
                <MoreVertical className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="absolute top-0 right-0 w-80 h-full bg-white dark:bg-gray-800 shadow-xl">
          {/* Chat UI would go here */}
          <div className="p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold">In-call Messages</h3>
          </div>
        </div>
      )}
    </div>
  );
};