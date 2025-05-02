import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';

interface UsePeerProps {
  roomId: string;
  isCreator: boolean;
  localStream: MediaStream | null;
  onStatusChange: (status: string) => void;
}

const usePeer = ({ roomId, isCreator, localStream, onStatusChange }: UsePeerProps) => {
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const peerRef = useRef<Peer | null>(null);
  const connectionRef = useRef<DataConnection | null>(null);

  // Create unique peer IDs for creator and joiner
  const peerId = isCreator ? roomId : `${roomId}-joiner`;
  const remotePeerId = isCreator ? `${roomId}-joiner` : roomId;

  const destroyPeer = useCallback(() => {
    if (connectionRef.current) {
      connectionRef.current.close();
      connectionRef.current = null;
    }
    
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    
    setRemoteStream(null);
  }, []);

  const initializePeer = useCallback(() => {
    if (!localStream) {
      onStatusChange('Waiting for camera access...');
      return;
    }

    if (peerRef.current) {
      destroyPeer();
    }

    onStatusChange('Initializing connection...');

    // Create new peer with STUN servers
    const peer = new Peer(peerId, {
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' }
        ]
      },
      debug: 2
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('My peer ID is:', id);
      onStatusChange(isCreator ? 'Room created, waiting for someone to join...' : 'Joining room...');
      
      if (!isCreator) {
        // If joiner, initiate connection to creator
        connectToPeer();
      }
    });

    peer.on('call', (call) => {
      console.log('Receiving call...');
      onStatusChange('Incoming call, connecting...');
      
      call.answer(localStream);
      
      call.on('stream', (stream) => {
        console.log('Received remote stream');
        setRemoteStream(stream);
        onStatusChange('Connected');
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        setError('Call error: ' + err.message);
        onStatusChange('Call failed');
      });
    });

    peer.on('connection', (conn) => {
      connectionRef.current = conn;
      console.log('Data connection established');
      
      conn.on('open', () => {
        console.log('Data channel opened');
      });
      
      conn.on('data', (data) => {
        console.log('Received data:', data);
      });
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
      setError('Connection error: ' + err.message);
      onStatusChange('Connection failed');
    });

    peer.on('disconnected', () => {
      console.log('Peer disconnected');
      onStatusChange('Disconnected');
    });

    peer.on('close', () => {
      console.log('Peer connection closed');
      onStatusChange('Connection closed');
    });
  }, [localStream, peerId, isCreator, remotePeerId, onStatusChange, destroyPeer]);

  const connectToPeer = useCallback(() => {
    if (!peerRef.current || !localStream) return;

    console.log('Connecting to peer:', remotePeerId);
    onStatusChange('Connecting to peer...');

    // Establish data connection first
    const conn = peerRef.current.connect(remotePeerId);
    connectionRef.current = conn;
    
    conn.on('open', () => {
      console.log('Data connection opened');
      
      // Now make the media call
      const call = peerRef.current!.call(remotePeerId, localStream);
      
      call.on('stream', (stream) => {
        console.log('Received remote stream');
        setRemoteStream(stream);
        onStatusChange('Connected');
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        setError('Call error: ' + err.message);
        onStatusChange('Call failed');
      });
    });
    
    conn.on('error', (err) => {
      console.error('Data connection error:', err);
      setError('Data connection error: ' + err.message);
      onStatusChange('Connection failed');
    });
  }, [localStream, remotePeerId, onStatusChange]);

  useEffect(() => {
    return () => {
      destroyPeer();
    };
  }, [destroyPeer]);

  return {
    remoteStream,
    error,
    initializePeer,
    destroyPeer
  };
};

export default usePeer;