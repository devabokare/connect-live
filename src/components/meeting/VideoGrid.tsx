import { VideoTile } from './VideoTile';
import { cn } from '@/lib/utils';

interface VideoStream {
  peerId: string;
  stream: MediaStream | null;
  displayName: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface VideoGridProps {
  localStream: MediaStream | null;
  localDisplayName: string;
  localIsMuted: boolean;
  localIsVideoOff: boolean;
  remoteStreams: VideoStream[];
}

export function VideoGrid({
  localStream,
  localDisplayName,
  localIsMuted,
  localIsVideoOff,
  remoteStreams,
}: VideoGridProps) {
  const totalParticipants = remoteStreams.length + 1;

  // Determine grid layout based on participant count
  const getGridClass = () => {
    if (totalParticipants === 1) {
      return 'grid-cols-1';
    }
    if (totalParticipants === 2) {
      return 'grid-cols-1 md:grid-cols-2';
    }
    if (totalParticipants <= 4) {
      return 'grid-cols-2';
    }
    if (totalParticipants <= 6) {
      return 'grid-cols-2 md:grid-cols-3';
    }
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <div
      className={cn(
        'grid gap-4 p-4 h-full w-full auto-rows-fr',
        getGridClass()
      )}
    >
      {/* Local video tile */}
      <VideoTile
        stream={localStream}
        displayName={localDisplayName}
        isLocal
        isMuted={localIsMuted}
        isVideoOff={localIsVideoOff}
      />

      {/* Remote video tiles */}
      {remoteStreams.map((remote) => (
        <VideoTile
          key={remote.peerId}
          stream={remote.stream}
          displayName={remote.displayName}
          isMuted={remote.isMuted}
          isVideoOff={remote.isVideoOff}
        />
      ))}
    </div>
  );
}
