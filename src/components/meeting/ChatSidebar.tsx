import { useState } from 'react';
import { X, Send, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import EmojiPicker, { Theme } from 'emoji-picker-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

interface ChatSidebarProps {
  messages: ChatMessage[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
  onClose: () => void;
  isDisabled?: boolean;
}

export function ChatSidebar({
  messages,
  currentUserId,
  onSendMessage,
  onClose,
  isDisabled = false,
}: ChatSidebarProps) {
  const [newMessage, setNewMessage] = useState('');

  const onEmojiClick = (emojiData: any) => {
    setNewMessage((prev) => prev + emojiData.emoji);
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="glass flex h-full w-80 flex-col animate-slide-up">
      <div className="flex items-center justify-between border-b border-border/50 p-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          In-meeting chat
        </h3>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              No messages yet. Start the conversation!
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.senderId === currentUserId ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    {msg.senderId === currentUserId ? 'You' : msg.senderName}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-lg px-3 py-2 ${
                    msg.senderId === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="border-t border-border/50 p-4">
        {isDisabled && (
          <p className="mb-2 text-center text-xs text-destructive font-medium">
            Chat is currently disabled
          </p>
        )}
        <div className="flex gap-2 items-center">
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 shrink-0" 
                disabled={isDisabled}
              >
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-none shadow-2xl" side="top" align="start">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                autoFocusSearch={false}
                theme={Theme.AUTO}
                width={300}
                height={400}
              />
            </PopoverContent>
          </Popover>
          
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isDisabled ? "Chat disabled" : "Send a message..."}
            className="flex-1 bg-secondary/50"
            disabled={isDisabled}
          />
          <Button 
            size="icon" 
            onClick={handleSend} 
            disabled={!newMessage.trim() || isDisabled}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
