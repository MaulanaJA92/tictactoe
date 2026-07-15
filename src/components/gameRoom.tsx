import React, { useState, useEffect } from "react";
import { ref, onValue, update, remove } from "firebase/database";
import { db } from "../config/firebase";
import type {
  RoomData,
  BoardCell,
  WinnerState,
  PlayerRole,
} from "../types/types";

interface GameRoomProps {
  roomId: string;
  playerId: string;
  leaveRoom: () => void;
}

const WINNING_COMBINATIONS: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const GameRoom: React.FC<GameRoomProps> = ({ roomId, playerId, leaveRoom }) => {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const roomRef = ref(db, `rooms/${roomId}`);

    const unsubscribe = onValue(roomRef, (snapshot) => {
      const data = snapshot.val() as RoomData;

      if (!data) {
        alert("Room dibubarkan!");
        leaveRoom();
        return;
      }

      if (
        data.players.p1 !== playerId &&
        !data.players.p2 &&
        data.status === "waiting"
      ) {
        update(ref(db, `rooms/${roomId}`), {
          "players/p2": playerId,
          status: "playing",
        });
      }

      if (data.rematch?.p1 && data.rematch?.p2 && data.players.p1 === playerId) {
        const resetState: Partial<RoomData> = {
          board: Array(9).fill("") as BoardCell[],
          turn: "p1",
          status: "playing",
          winner: "",
          rematch: { p1: false, p2: false },
        };
        update(ref(db, `rooms/${roomId}`), resetState);
        return;
      }

      setRoomData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId, playerId, leaveRoom]);

  if (loading || !roomData) return <p className="text-xl">Memuat Room...</p>;

  const { board, players, turn, status, winner,rematch} = roomData;

  const myRole: PlayerRole | null =
    players.p1 === playerId ? "p1" : players.p2 === playerId ? "p2" : null;
  const mySign: BoardCell = myRole === "p1" ? "X" : myRole === "p2" ? "O" : "";

  const checkWinner = (newBoard: BoardCell[]): WinnerState => {
    for (let combo of WINNING_COMBINATIONS) {
      const [a, b, c] = combo;
      if (
        newBoard[a] &&
        newBoard[a] === newBoard[b] &&
        newBoard[a] === newBoard[c]
      ) {
        return newBoard[a] === "X" ? "p1" : "p2";
      }
    }
    if (newBoard.every((cell) => cell !== "")) return "draw";
    return "";
  };

  const handleCellClick = (index: number) => {
    if (status !== "playing") return;
    if (turn !== myRole) return;
    if (board[index] !== "") return;

    const newBoard = [...board];
    newBoard[index] = mySign;

    const gameWinner = checkWinner(newBoard);

    const updates: Partial<RoomData> = {
      board: newBoard,
      turn: turn === "p1" ? "p2" : "p1",
    };

    if (gameWinner) {
      updates.status = "ended";
      updates.winner = gameWinner;
    }

    update(ref(db, `rooms/${roomId}`), updates);
  };

  const handleLeave = async ()=>{
    localStorage.removeItem("roomId");
    await remove(ref(db,`rooms/${roomId}`));
    leaveRoom();
  }

  const handleRematchRequest = () => {
    if (!myRole) return;

    update(ref(db, `rooms/${roomId}`), {
      [`rematch/${myRole}`]: true,
    });
  };

  return (
    <div className="flex flex-col items-center bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 w-full max-w-md">
      <div className="flex justify-between w-full text-sm text-slate-400 mb-4">
        <p>
          Room: <span className="font-mono text-white font-bold">{roomId}</span>
        </p>
        <button onClick={handleLeave} className="text-red-400 hover:underline">
          Keluar Lobi
        </button>
      </div>

      <div className="text-center mb-6 h-8">
        {status === "waiting" && (
          <p className="text-yellow-400 animate-pulse">
            Menunggu Lawan Bergabung...
          </p>
        )}
        {status === "playing" && (
          <p
            className={
              turn === myRole ? "text-emerald-400 font-bold" : "text-slate-300"
            }
          >
            {turn === myRole
              ? " Giliran Kamu ( " + mySign + " )"
              : "Menunggu giliran lawan..."}
          </p>
        )}
        {status === "ended" && (
          <p className="text-2xl font-bold text-yellow-400">
            {winner === "draw"
              ? "Game Seri!"
              : winner === myRole
                ? "Kamu Menang!"
                : "Kamu Kalah!"}
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 w-64 h-64 mb-6">
        {board.map((cell, index) => (
          <button
            key={index}
            onClick={() => handleCellClick(index)}
            disabled={status !== "playing" || turn !== myRole || cell !== ""}
            className={`w-full h-full text-4xl font-bold rounded flex items-center justify-center transition-all
              ${cell === "" && status === "playing" && turn === myRole ? "bg-slate-700 hover:bg-slate-600 border border-blue-500/30" : "bg-slate-900"}
              ${cell === "X" ? "text-blue-400" : "text-rose-400"}
            `}
          >
            {cell}
          </button>
        ))}
      </div>

      {status === "ended" && (
        <div className="w-full text-center space-y-2">
          <button
            onClick={handleRematchRequest}
            disabled={myRole ? rematch[myRole] : true}
            className={`w-full font-semibold py-2 px-4 rounded transition
              ${myRole && rematch[myRole] ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}
            `}
          >
            {myRole && rematch[myRole]
              ? "Menunggu Persetujuan Lawan..."
              : "Main Lagi (New Game)"}
          </button>

          {myRole && rematch[myRole === "p1" ? "p2" : "p1"] && (
            <p className="text-xs text-emerald-400 animate-bounce">
              Lawan sudah menantangmu untuk main lagi!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameRoom;
