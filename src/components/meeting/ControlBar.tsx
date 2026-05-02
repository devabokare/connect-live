import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Users,
  PhoneOff,
  MessageSquare,
  Settings,
  MonitorOff,
  Circle,
  MessageSquareOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface ControlBarProps {
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
  showParticipants: boolean;
  showChat: boolean;
  isRecording?: boolean;
  isChatDisabled?: boolean;
  isHost?: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleScreenShare: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onToggleRecording?: () => void;
  onToggleChatDisabled?: () => void;
  onLeaveMeeting: () => void;
}

export function ControlBar({
  isMuted,
  isVideoOff,
  isScreenSharing,
  showParticipants,
  showChat,
  isRecording = false,
  isChatDisabled = false,
  isHost = false,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onToggleParticipants,
  onToggleChat,
  onToggleRecording,
  onToggleChatDisabled,
  onLeaveMeeting,
}: ControlBarProps) {
  return (
    <div className="control-bar fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-2xl border border-border/50 px-4 py-3 animate-slide-up">
      {/* Audio control */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isMuted ? 'controlDanger' : 'control'}
            size="iconLg"
            onClick={onToggleMute}
          >
            {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isMuted ? 'Unmute' : 'Mute'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Video control */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isVideoOff ? 'controlDanger' : 'control'}
            size="iconLg"
            onClick={onToggleVideo}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isVideoOff ? 'Turn on camera' : 'Turn off camera'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Screen share */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isScreenSharing ? 'controlActive' : 'control'}
            size="iconLg"
            onClick={onToggleScreenShare}
          >
            {isScreenSharing ? (
              <MonitorOff className="h-5 w-5" />
            ) : (
              <Monitor className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isScreenSharing ? 'Stop sharing' : 'Share screen'}</p>
        </TooltipContent>
      </Tooltip>

      {/* Record button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={isRecording ? 'controlActive' : 'control'}
            size="iconLg"
            onClick={onToggleRecording}
            className={isRecording ? 'animate-pulse text-red-500' : ''}
          >
            <Circle className={`h-5 w-5 ${isRecording ? 'fill-red-500' : ''}`} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isRecording ? 'Stop recording' : 'Record meeting'}</p>
        </TooltipContent>
      </Tooltip>

      <div className="mx-2 h-8 w-px bg-border" />

      {/* Participants */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showParticipants ? 'controlActive' : 'control'}
            size="iconLg"
            onClick={onToggleParticipants}
          >
            <Users className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Participants</p>
        </TooltipContent>
      </Tooltip>

      {/* Chat */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={showChat ? 'controlActive' : 'control'}
            size="iconLg"
            onClick={onToggleChat}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Chat</p>
        </TooltipContent>
      </Tooltip>

      {/* Disable Chat (Host only) */}
      {isHost && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isChatDisabled ? 'controlDanger' : 'control'}
              size="iconLg"
              onClick={onToggleChatDisabled}
            >
              {isChatDisabled ? (
                <MessageSquare className="h-5 w-5" />
              ) : (
                <MessageSquareOff className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isChatDisabled ? 'Enable chat for all' : 'Disable chat for participants'}</p>
          </TooltipContent>
        </Tooltip>
      )}

      <div className="mx-2 h-8 w-px bg-border" />

      {/* Leave meeting */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="destructive"
            size="lg"
            onClick={onLeaveMeeting}
            className="gap-2 px-6"
          >
            <PhoneOff className="h-5 w-5" />
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Leave meeting</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
