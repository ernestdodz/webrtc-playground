import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Copy, ArrowLeft, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import usePeer from '../hooks/usePeer';
import useMediaStream from '../hooks/useMediaStream';
import VideoPlayer from '../components/VideoPlayer';

const Room: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const isCreator = searchParams.get('isCreator') === 'true';
  const navigate = useNavigate();
  
  const [isCopied, setIsCopied] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [status, setStatus] = useState<string>('Initializing...');
  
  const { localStream, toggleVideo, toggleAudio } = useMediaStream();
  const { remoteStream, initializePeer, destroyPeer } = usePeer({
    roomId: roomId || '',
    isCreator,
    localStream,
    onStatusChange: setStatus
  });

  useEffect(() => {
    if (roomId && localStream) {
      initializePeer();
    }
    
    return () => {
      destroyPeer();
    };
  }, [roomId, localStream, initializePeer, destroyPeer]);

  const copyRoomLink = () => {
    const url = window.location.origin + `/room/${roomId}?isCreator=false`;
    navigator.clipboard.writeText(url);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleVideoToggle = () => {
    toggleVideo();
    setIsVideoEnabled(!isVideoEnabled);
  };

  const handleAudioToggle = () => {
    toggleAudio();
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="min-h-screen bg-slate-900 p-4 flex flex-col">
      <div className="container mx-auto max-w-6xl flex-grow flex flex-col">
        <header className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          
          <h1 className="text-xl md:text-2xl font-bold text-center flex-grow">
            Video Chat Room
          </h1>
          
          {isCreator && (
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
            >
              <Copy size={16} />
              <span>{isCopied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          )}
        </header>

        <div className="mb-4 text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-slate-800 text-sm">
            {status}
          </span>
        </div>

        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
            <VideoPlayer stream={localStream} muted />
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-900 bg-opacity-70 rounded-lg text-sm">
              You ({isCreator ? 'Creator' : 'Joiner'})
            </div>
          </div>
          
          <div className="relative bg-slate-800 rounded-xl overflow-hidden aspect-video">
            {remoteStream ? (
              <VideoPlayer stream={remoteStream} />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <Video size={48} className="mb-3" />
                <p>Waiting for peer to connect...</p>
              </div>
            )}
            {remoteStream && (
              <div className="absolute bottom-4 left-4 px-3 py-1 bg-slate-900 bg-opacity-70 rounded-lg text-sm">
                Peer ({isCreator ? 'Joiner' : 'Creator'})
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-4 py-4">
          <button
            onClick={handleVideoToggle}
            className={`p-4 rounded-full ${isVideoEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} transition`}
          >
            {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
          </button>
          
          <button
            onClick={handleAudioToggle}
            className={`p-4 rounded-full ${isAudioEnabled ? 'bg-slate-700 hover:bg-slate-600' : 'bg-red-600 hover:bg-red-700'} transition`}
          >
            {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Room;