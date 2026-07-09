import React, { useState, useEffect } from "react";
import Lobby from "./components/lobby";
import GameRoom from "./components/gameRoom";

const App: React.FC = () => {
  const [playerId, setPlayerId] = useState<string>("");
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

  useEffect(() => {
    const id = "player_" + Math.random().toString(36).substring(2, 9);
    setPlayerId(id);
  }, []);

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black text-white flex flex-col items-center justify-center p-4 sm:p-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>

     
      <div className="text-center mb-10 relative z-10">
        <div className="flex items-center justify-center gap-3 sm:gap-4 mb-2">
          <span className="text-4xl sm:text-6xl font-black text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] animate-pulse">
            X
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 tracking-tight drop-shadow-sm">
            TIC TAC TOE
          </h1>
          <span className="text-4xl sm:text-6xl font-black text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.6)] animate-pulse">
            O
          </span>
        </div>
        <p className="text-slate-400 font-medium tracking-widest uppercase text-xs sm:text-sm shadow-black drop-shadow-md">
          Real-Time Multiplayer Arena
        </p>
      </div>

      <div className="relative z-10 w-full flex justify-center items-center">
        {!currentRoomId ? (
          <Lobby playerId={playerId} setRoomId={setCurrentRoomId} />
        ) : (
          <GameRoom
            roomId={currentRoomId}
            playerId={playerId}
            leaveRoom={() => setCurrentRoomId(null)}
          />
        )}
      </div>

  
      
    </div>
  );
};

export default App;
