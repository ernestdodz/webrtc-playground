import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Video, Users } from 'lucide-react';

const Home: React.FC = () => {
  const [roomId, setRoomId] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();

  const createRoom = () => {
    const newRoomId = uuidv4();
    navigate(`/room/${newRoomId}?isCreator=true`);
  };

  const joinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim()) {
      navigate(`/room/${roomId}?isCreator=false`);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="max-w-md w-full bg-slate-800 rounded-xl p-8 shadow-2xl">
        <div className="flex justify-center mb-8">
          <Video className="w-16 h-16 text-blue-500" />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">WebRTC Video Chat</h1>
        
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users size={20} className="text-green-500" />
              Join a Room
            </h2>
            
            <form onSubmit={joinRoom} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter Room ID"
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  required
                />
              </div>
              
              <button
                type="submit"
                className={`w-full p-3 rounded-lg bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition ${
                  isJoining ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isJoining}
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">or</span>
            </div>
          </div>
          
          <button
            onClick={createRoom}
            className="w-full p-3 rounded-lg bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition"
          >
            Create New Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;