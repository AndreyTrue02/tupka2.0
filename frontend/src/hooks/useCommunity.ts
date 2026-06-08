import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { CommunityRoom, CommunityMessage, CommunityMessageCreate } from '../lib/types';

/**
 * Get all community rooms
 */
export function useCommunityRooms() {
  const [rooms, setRooms] = useState<CommunityRoom[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = useCallback(async () => {
    try {
      const response = await api.get<CommunityRoom[]>('/community/rooms');
      setRooms(response);
    } catch (err) {
      console.error('Failed to fetch community rooms:', err);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return { rooms, loading, refetch: fetchRooms };
}

/**
 * Get messages for a community room
 */
export function useCommunityMessages(roomId: number | null, limit: number = 50) {
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await api.get<CommunityMessage[]>(
        `/community/rooms/${roomId}/messages?limit=${limit}`
      );
      setMessages(response);
    } catch (err) {
      console.error('Failed to fetch community messages:', err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [limit, roomId]);

  useEffect(() => {
    if (!roomId) return;
    fetchMessages();
  }, [fetchMessages, roomId]);

  const sendMessage = async (text: string) => {
    if (!roomId || !text.trim()) return;
    try {
      const newMessage = await api.post<CommunityMessage>(
        `/community/rooms/${roomId}/messages`,
        { text: text.trim() } as CommunityMessageCreate
      );
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      console.error('Failed to send community message:', err);
      throw err;
    }
  };

  return { messages, loading, sendMessage, refetch: fetchMessages };
}
