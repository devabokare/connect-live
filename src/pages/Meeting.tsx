import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WebRTCManager } from '@/lib/webrtc';
import {
  getMeeting,
  createMeeting,
  joinMeeting,
  leaveMeeting,
  getParticipants,
  removeParticipant,
  endMeeting,
  generateVisitorId,
  type LocalMeeting,
  type LocalParticipant,
} from '@/lib/meeting';
import { VideoGrid } from '@/components/meeting/VideoGrid';
import { ControlBar } from '@/components/meeting/ControlBar';
import { MeetingHeader } from '@/components/meeting/MeetingHeader';
import { ParticipantsSidebar } from '@/components/meeting/ParticipantsSidebar';
import { ChatSidebar } from '@/components/meeting/ChatSidebar';
import { toast } from 'sonner';

interface RemoteStream {
  peerId: string;
  stream: MediaStream | null;
  displayName: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export default function MeetingPage() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<LocalMeeting | null>(null);
  const [participant, setParticipant] = useState<LocalParticipant | null>(null);
  const [participants, setParticipants] = useState<LocalParticipant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<RemoteStream[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [isChatDisabled, setIsChatDisabled] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const webrtcRef = useRef<WebRTCManager | null>(null);
  const visitorIdRef = useRef<string>('');
  const initializedRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const displayName = localStorage.getItem('displayName') || 'Guest';

  // Handle remote stream updates
  const handleRemoteStream = useCallback((peerId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const existing = prev.find((s) => s.peerId === peerId);
      if (existing) {
        return prev.map((s) => (s.peerId === peerId ? { ...s, stream } : s));
      }
      return [...prev, { peerId, stream, displayName: 'Participant' }];
    });
  }, []);

  // Handle peer disconnection
  const handlePeerDisconnected = useCallback((peerId: string) => {
    setRemoteStreams((prev) => prev.filter((s) => s.peerId !== peerId));
  }, []);

  // Initialize meeting - run only once
  useEffect(() => {
    if (!meetingId || initializedRef.current) {
      if (!meetingId) navigate('/');
      return;
    }

    initializedRef.current = true;

    const initMeeting = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get or create visitor ID
        let visitorId = localStorage.getItem('visitorId');
        if (!visitorId) {
          visitorId = generateVisitorId();
          localStorage.setItem('visitorId', visitorId);
        }
        visitorIdRef.current = visitorId;

        // Get or create meeting
        let meetingData = getMeeting(meetingId);
        const isHost = !meetingData;
        
        if (!meetingData) {
          // Create meeting if it doesn't exist (joining via direct link)
          meetingData = createMeeting(visitorId, 'Video Meeting');
          // Update the meeting ID to match the URL
          meetingData.meetingId = meetingId;
        }
        setMeeting(meetingData);

        // Join meeting
        const currentParticipant = joinMeeting(
          meetingId,
          visitorId,
          displayName,
          isHost
        );
        setParticipant(currentParticipant);

        // Get existing participants
        const existingParticipants = getParticipants(meetingId);
        setParticipants(existingParticipants.filter(p => p.visitorId !== visitorId));

        // Initialize WebRTC
        const webrtc = new WebRTCManager(
          meetingId,
          visitorId,
          handleRemoteStream,
          handlePeerDisconnected
        );
        webrtcRef.current = webrtc;

        // Get local media
        const stream = await webrtc.initializeMedia(true, true);
        setLocalStream(stream);

        toast.success('Joined meeting');
      } catch (err) {
        console.error('Error initializing meeting:', err);
        setError('Failed to join meeting. Please check your camera and microphone permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    initMeeting();

    return () => {
      if (webrtcRef.current) {
        webrtcRef.current.disconnect();
      }
      if (meetingId && visitorIdRef.current) {
        leaveMeeting(meetingId, visitorIdRef.current);
      }
    };
  }, [meetingId, navigate, displayName, handleRemoteStream, handlePeerDisconnected]);

  // Handle leaving meeting
  const handleLeaveMeeting = () => {
    if (webrtcRef.current) {
      webrtcRef.current.disconnect();
    }

    if (meetingId && visitorIdRef.current) {
      leaveMeeting(meetingId, visitorIdRef.current);
    }

    // If host and no other participants, end meeting
    if (meeting && meeting.hostId === visitorIdRef.current) {
      const remainingParticipants = participants.filter((p) => p.visitorId !== visitorIdRef.current);
      if (remainingParticipants.length === 0) {
        endMeeting(meetingId!);
      }
    }

    navigate('/');
    toast.info('You left the meeting');
  };

  // Control handlers
  const handleToggleMute = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleAudio(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleToggleVideo = () => {
    if (webrtcRef.current) {
      webrtcRef.current.toggleVideo(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleToggleScreenShare = async () => {
    if (!webrtcRef.current) return;

    try {
      if (isScreenSharing) {
        await webrtcRef.current.stopScreenShare();
        setIsScreenSharing(false);
        setLocalStream(webrtcRef.current.getLocalStream());
      } else {
        const screenStream = await webrtcRef.current.startScreenShare();
        setIsScreenSharing(true);
        setLocalStream(screenStream);
      }
    } catch (error) {
      console.error('Screen share error:', error);
      toast.error('Failed to share screen');
    }
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!meetingId) return;
    removeParticipant(meetingId, participantId);
    setParticipants(prev => prev.filter(p => p.id !== participantId));
    toast.success('Participant removed');
  };

  const handleSendChatMessage = (message: string) => {
    if (isChatDisabled && meeting?.hostId !== visitorIdRef.current) {
      toast.error('Chat is currently disabled by the host');
      return;
    }
    
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      senderId: visitorIdRef.current,
      senderName: displayName,
      message,
      timestamp: new Date(),
    };
    setChatMessages((prev) => [...prev, newMessage]);
  };

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        setIsRecording(false);
        toast.success('Recording saved to downloads');
      }
    } else {
      if (!localStream) {
        toast.error('No video stream available to record');
        return;
      }

      try {
        recordedChunksRef.current = [];
        const options = { mimeType: 'video/webm;codecs=vp9,opus' };
        
        // Fallback to default if vp9 isn't supported
        const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType) 
          ? new MediaRecorder(localStream, options)
          : new MediaRecorder(localStream);
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `meeting-record-${new Date().toISOString()}.webm`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
        };
        
        mediaRecorder.start(1000); // Collect data every second
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
        toast.success('Recording started');
      } catch (err) {
        console.error('Error starting recording:', err);
        toast.error('Failed to start recording');
      }
    }
  }, [isRecording, localStream]);

  const handleToggleChatDisabled = () => {
    setIsChatDisabled(!isChatDisabled);
    toast.info(`Chat ${!isChatDisabled ? 'disabled' : 'enabled'} for participants`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Joining meeting...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <div className="glass max-w-md rounded-2xl p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">
            Unable to Join Meeting
          </h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  const allParticipants = participant ? [participant, ...participants] : participants;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Main video area */}
      <div className="flex-1 relative">
        {meeting && (
          <MeetingHeader meetingId={meeting.meetingId} title={meeting.title} />
        )}

        <div className="h-full pt-16 pb-24">
          <VideoGrid
            localStream={localStream}
            localDisplayName={displayName}
            localIsMuted={isMuted}
            localIsVideoOff={isVideoOff}
            remoteStreams={remoteStreams}
          />
        </div>

        <ControlBar
          isMuted={isMuted}
          isVideoOff={isVideoOff}
          isScreenSharing={isScreenSharing}
          showParticipants={showParticipants}
          showChat={showChat}
          isRecording={isRecording}
          isChatDisabled={isChatDisabled}
          isHost={meeting?.hostId === visitorIdRef.current}
          onToggleMute={handleToggleMute}
          onToggleVideo={handleToggleVideo}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleRecording={handleToggleRecording}
          onToggleChatDisabled={handleToggleChatDisabled}
          onToggleParticipants={() => {
            setShowParticipants(!showParticipants);
            if (showChat) setShowChat(false);
          }}
          onToggleChat={() => {
            setShowChat(!showChat);
            if (showParticipants) setShowParticipants(false);
          }}
          onLeaveMeeting={handleLeaveMeeting}
        />
      </div>

      {/* Sidebars */}
      {showParticipants && (
        <ParticipantsSidebar
          participants={allParticipants}
          currentVisitorId={visitorIdRef.current}
          isHost={meeting?.hostId === visitorIdRef.current}
          onClose={() => setShowParticipants(false)}
          onRemoveParticipant={handleRemoveParticipant}
        />
      )}

      {showChat && (
        <ChatSidebar
          messages={chatMessages}
          currentUserId={visitorIdRef.current}
          onSendMessage={handleSendChatMessage}
          onClose={() => setShowChat(false)}
          isDisabled={isChatDisabled && meeting?.hostId !== visitorIdRef.current}
        />
      )}
    </div>
  );
}
