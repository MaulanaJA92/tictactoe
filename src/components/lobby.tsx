import React, { useState } from "react";
import { get, ref, set } from "firebase/database";
import { db } from "../config/firebase";
import type { RoomData } from "../types/types";

interface LobbyProps {
  playerId: string;
  setRoomId: (id: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ playerId, setRoomId }) => {
  const [inputRoomId, setInputRoomId] = useState<string>("");

  const normalizeRoomId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const withoutPrefix = trimmed.replace(/^room_/i, "").trim();
    return `ROOM_${withoutPrefix.toUpperCase()}`;
  };

  const handleCreateRoom = () => {
    const newRoomId = normalizeRoomId(
      `room_${Math.random().toString(36).substring(2, 7)}`,
    );

    const initialRoomState: RoomData = {
      id: newRoomId,
      status: "waiting",
      players: {
        p1: playerId,
        p2: "",
      },
      board: Array(9).fill("") as RoomData["board"],
      turn: "p1",
      winner: "",
      rematch: {
        p1: false,
        p2: false,
      },
      ready: {
        p1: true,
        p2: false,
      },
    };

    set(ref(db, `rooms/${newRoomId}`), initialRoomState)
      .then(() => {
        localStorage.setItem("roomId", newRoomId);
        setRoomId(newRoomId);
      })
      .catch((err: Error) => alert("Gagal membuat room: " + err.message));
  };

  const handleJoinRoom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const roomId = normalizeRoomId(inputRoomId);
    if (!roomId) return;

    try {
      const roomRef = ref(db, `rooms/${roomId}`);
      const snapshot = await get(roomRef);

      if (!snapshot.exists()) {
        alert("Room tidak ditemukan. Pastikan kode room benar.");
        return;
      }
      localStorage.setItem("roomId", roomId);
      setRoomId(roomId);
    } catch (err) {
      alert("Gagal mengecek room: " + (err as Error).message);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-xl border border-slate-700 w-full max-w-sm text-center">
      <p className="text-sm text-slate-400 mb-4">
        ID Kamu: <span className="text-yellow-400 font-mono">{playerId}</span>
      </p>

      <button
        onClick={handleCreateRoom}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded mb-6 transition"
      >
        Buat Room Baru
      </button>

      <div className="border-t border-slate-700 my-4 pt-4">
        <form onSubmit={handleJoinRoom} className="space-y-3">
          <input
            type="text"
            placeholder="Masukkan Kode Room (cth: AB12C)"
            value={inputRoomId}
            onChange={(e) => setInputRoomId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-center text-xl tracking-wider font-mono uppercase text-white focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded transition"
          >
            Gabung Room
          </button>
        </form>
      </div>
    </div>
  );
};

export default Lobby;
