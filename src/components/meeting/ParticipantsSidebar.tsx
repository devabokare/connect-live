import { X, Crown, UserMinus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LocalParticipant } from '@/lib/meeting';

interface ParticipantsSidebarProps {
  participants: LocalParticipant[];
  currentVisitorId: string;
  isHost: boolean;
  onClose: () => void;
  onRemoveParticipant?: (participantId: string) => void;
}

export function ParticipantsSidebar({
  participants,
  currentVisitorId,
  isHost,
  onClose,
  onRemoveParticipant,
}: ParticipantsSidebarProps) {
  return (
    <div className="glass flex h-full w-80 flex-col animate-slide-up">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          Participants ({participants.length})
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center justify-between rounded-lg bg-secondary/50 p-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                  <span className="text-sm font-medium text-primary">
                    {participant.displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">
                      {participant.displayName}
                    </span>
                    {participant.visitorId === currentVisitorId && (
                      <span className="text-xs text-muted-foreground">(You)</span>
                    )}
                    {participant.isHost && (
                      <Crown className="h-4 w-4 text-warning" />
                    )}
                  </div>
                </div>
              </div>

              {isHost && participant.visitorId !== currentVisitorId && (
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveParticipant?.(participant.id)}
                    className="text-destructive hover:bg-destructive/20 hover:text-destructive"
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
