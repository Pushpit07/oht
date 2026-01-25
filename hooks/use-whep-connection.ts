'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebRTCConfig } from '@/lib/webrtc-config';

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'failed';

interface UseWHEPConnectionOptions {
  url: string;
  enabled?: boolean;
  reconnectOnDisconnect?: boolean;
  reconnectInterval?: number;
}

interface UseWHEPConnectionResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  connectionState: ConnectionState;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => void;
}

async function waitIceComplete(pc: RTCPeerConnection): Promise<void> {
  if (pc.iceGatheringState === 'complete') return;
  await new Promise<void>((resolve) => {
    pc.addEventListener('icegatheringstatechange', () => {
      if (pc.iceGatheringState === 'complete') resolve();
    });
  });
}

export function useWHEPConnection({
  url,
  enabled = true,
  reconnectOnDisconnect = true,
  reconnectInterval,
}: UseWHEPConnectionOptions): UseWHEPConnectionResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [error, setError] = useState<Error | null>(null);

  const config = getWebRTCConfig();
  const actualReconnectInterval = reconnectInterval ?? config.reconnectInterval;

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  const connect = useCallback(async () => {
    if (!url || !enabled) return;

    cleanup();
    setConnectionState('connecting');
    setError(null);

    try {
      const pc = new RTCPeerConnection({ iceServers: [] });
      peerConnectionRef.current = pc;

      pc.addTransceiver('video', { direction: 'recvonly' });

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'failed') {
          setConnectionState('failed');
          setError(new Error('ICE connection failed'));
        } else if (pc.iceConnectionState === 'disconnected') {
          setConnectionState('disconnected');
        }
      };

      pc.onconnectionstatechange = () => {
        if (pc.connectionState === 'connected') {
          setConnectionState('connected');
        } else if (pc.connectionState === 'failed') {
          setConnectionState('failed');
        } else if (pc.connectionState === 'disconnected') {
          setConnectionState('disconnected');
        }
      };

      pc.ontrack = (ev) => {
        if (videoRef.current && ev.streams[0]) {
          videoRef.current.srcObject = ev.streams[0];
        }
      };

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await waitIceComplete(pc);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), config.connectionTimeout);

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/sdp' },
          body: pc.localDescription?.sdp,
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`WHEP request failed: ${res.status} ${res.statusText} - ${errorText}`);
        }

        const answer = await res.text();
        await pc.setRemoteDescription({ type: 'answer', sdp: answer });
      } catch (e) {
        clearTimeout(timeout);
        if (e instanceof DOMException && e.name === 'AbortError') {
          throw new Error('Connection timed out');
        }
        throw e;
      }
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      setConnectionState('failed');
      cleanup();
    }
  }, [url, enabled, cleanup, config.connectionTimeout]);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionState('idle');
    setError(null);
  }, [cleanup]);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [disconnect, connect]);

  // Auto-connect when enabled
  useEffect(() => {
    if (enabled && url) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      cleanup();
    };
  }, [enabled, url, connect, disconnect, cleanup]);

  // Auto-reconnect on disconnect/failure
  useEffect(() => {
    if (!reconnectOnDisconnect || !enabled) return;

    if (connectionState === 'disconnected' || connectionState === 'failed') {
      reconnectTimerRef.current = setTimeout(() => {
        connect();
      }, actualReconnectInterval);
    }

    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [connectionState, reconnectOnDisconnect, enabled, actualReconnectInterval, connect]);

  return {
    videoRef,
    connectionState,
    error,
    connect,
    disconnect,
    reconnect,
  };
}
