import React, { useEffect, useRef, useState } from 'react';
import { Header, Screen } from '../components/layout';
import { EmptyState, MessageSkeleton } from '../components/ui';
import { useCommunityMessages, useCommunityRooms } from '../hooks';
import { Hash, Send, Users } from 'lucide-react';
import { hapticImpact } from '../lib/telegram';

interface CommunityPageProps {
  onRoomSelect?: (roomId: number, roomName: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ onRoomSelect }) => {
  const { rooms, loading } = useCommunityRooms();

  return (
    <Screen withTabBar>
      <Header title="Community" subtitle="Talk gear with other musicians" />
      <div className="mx-auto w-full max-w-5xl px-3 py-4 sm:px-6 sm:py-6">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="surface-card h-24 animate-pulse" />
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState title="No rooms yet" description="Seed data will create category rooms." />
        ) : (
          <div className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onRoomSelect?.(room.id, room.title)}
                className="surface-card p-4 text-left transition-colors hover:border-[var(--border-strong)] active:scale-[0.98]"
              >
                <div className="mb-2 flex items-center gap-2">
                  <Hash className="h-5 w-5 text-accent" />
                  <h3 className="truncate font-semibold">{room.title}</h3>
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs text-secondary">
                  <Users className="h-3 w-3" />
                  <span>{room.members_count} members</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
};

interface CommunityRoomPageProps {
  roomId: number | null;
  roomName?: string;
  onBack: () => void;
}

export const CommunityRoomPage: React.FC<CommunityRoomPageProps> = ({
  roomId,
  roomName = 'Community',
  onBack,
}) => {
  const [message, setMessage] = useState('');
  const { messages, loading, sendMessage } = useCommunityMessages(roomId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    hapticImpact('light');
    await sendMessage(message);
    setMessage('');
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="flex h-full flex-col bg-app">
      <Header title={`#${roomName}`} showBack onBack={onBack} />

      <div className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto px-4 py-4 scrollbar-hide">
        {loading ? (
          <>
            <MessageSkeleton />
            <MessageSkeleton />
            <MessageSkeleton />
          </>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <EmptyState title="Start the discussion" description="Be the first to send a message." />
          </div>
        ) : (
          <>
            {messages.map((item) => (
              <div key={item.id} className="mb-4 flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold">
                  {(item.sender.username || item.sender.first_name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-sm font-semibold">
                      @{item.sender.username || item.sender.first_name || 'user'}
                    </span>
                    <span className="text-xs text-secondary">{formatTime(item.created_at)}</span>
                  </div>
                  <p className="surface-card px-3 py-2 text-sm leading-6">{item.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div
        className="border-t border-separator bg-white/95 p-4 backdrop-blur-xl"
        style={{ paddingBottom: 'calc(var(--safe-area-inset-bottom) + 16px)' }}
      >
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            placeholder="Write a message..."
            className="input-field flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--accent)] text-white disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
