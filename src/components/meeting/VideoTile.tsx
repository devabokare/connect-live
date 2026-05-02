import { useRef, useEffect } from 'react';
import { Mic, MicOff, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VideoTileProps {
  stream: MediaStream | null;
  displayName: string;
  isLocal?: boolean;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isLarge?: boolean;
}

export function VideoTile({
  stream,
  displayName,
  isLocal = false,
  isMuted = false,
  isVideoOff = false,
  isLarge = false,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className={cn(
        'video-tile animate-scale-in relative flex items-center justify-center overflow-hidden',
        isLarge ? 'aspect-video w-full' : 'aspect-video'
      )}
    >
      {stream && !isVideoOff ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className={cn(
            'h-full w-full object-cover',
            isLocal && 'scale-x-[-1]'
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-secondary">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <User className="h-10 w-10 text-muted-foreground" />
          </div>
        </div>
      )}

      {/* Name badge */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <div className="glass-dark rounded-lg px-3 py-1.5">
          <span className="text-sm font-medium text-foreground">
            {displayName} {isLocal && '(You)'}
          </span>
        </div>
        
        {isMuted && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/80">
            <MicOff className="h-4 w-4 text-destructive-foreground" />
          </div>
        )}
      </div>

      {/* Speaking indicator */}
      {!isMuted && stream && (
        <div className="absolute bottom-3 right-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
            <Mic className="h-4 w-4 text-success" />
          </div>
        </div>
      )}
    </div>
  );
}
