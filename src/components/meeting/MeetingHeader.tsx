import { useState } from 'react';
import { Copy, Check, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface MeetingHeaderProps {
  meetingId: string;
  title: string;
}

export function MeetingHeader({ meetingId, title }: MeetingHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyMeetingLink = async () => {
    const link = `${window.location.origin}/meeting/${meetingId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Meeting link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-dark fixed left-4 top-4 z-40 flex items-center gap-4 rounded-xl px-4 py-2 animate-fade-in">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-success" />
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      
      <div className="h-4 w-px bg-border" />
      
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-muted-foreground">{meetingId}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyMeetingLink}
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? (
            <Check className="h-4 w-4 text-success" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
