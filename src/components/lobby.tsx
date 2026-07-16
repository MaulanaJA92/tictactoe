import React, { useEffect, useState } from "react";
import { get, onValue, ref, set } from "firebase/database";
import { db } from "../config/firebase";
import type { RoomData } from "../types/types";

interface LobbyProps {
  playerId: string;
  setRoomId: (id: string) => void;
}

const Lobby: React.FC<LobbyProps> = ({ playerId, setRoomId }) => {
  const [inputRoomId, setInputRoomId] = useState<string>("");
  const [visibility, setVisibility] = useState<"private" | "public">("private");
  const [publicRooms, setPublicRooms] = useState<RoomData[]>([]);
  useEffect(() => {
    const roomsRef = ref(db, "rooms");

    const unsubscribe = onValue(roomsRef, (snapshot) => {
      const data = snapshot.val();

      if (!data) {
        setPublicRooms([]);
        return;
      }

      const rooms = Object.values(data).filter((room: any) => {
        return (
          room.visibility === "public" &&
          !room.players.p2 &&
          (room.status === "waiting" || room.status === "ready")
        );
      }) as RoomData[];

      setPublicRooms(rooms);
    });

    return () => unsubscribe();
  }, []);
  const normalizeRoomId = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "";

    const withoutPrefix = trimmed.replace(/^room_/i, "").trim();
    return `ROOM_${withoutPrefix.toUpperCase()}`;
  };

  const joinRoom = (roomId: string) => {
    localStorage.setItem("roomId", roomId);
    setRoomId(roomId);
  };

  const handleCreateRoom = () => {
    const newRoomId = normalizeRoomId(
      `room_${Math.random().toString(36).substring(2, 7)}`,
    );

    const initialRoomState: RoomData = {
      id: newRoomId,
      visibility: visibility,
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
      score: {
        p1: 0,
        p2: 0,
        draw: 0,
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
      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="visibility"
          value="private"
          checked={visibility === "private"}
          onChange={() => setVisibility("private")}
        />
        Private Room
      </label>

      <label className="flex items-center gap-2">
        <input
          type="radio"
          name="visibility"
          value="public"
          checked={visibility === "public"}
          onChange={() => setVisibility("public")}
        />
        Public Room
      </label>

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
        <div className="border-t border-slate-700 mt-6 pt-4">
          <h3 className="text-lg font-semibold mb-3">Public Rooms</h3>

          {publicRooms.length === 0 ? (
            <p className="text-slate-400 text-sm">Belum ada room publik.</p>
          ) : (
            <div className="space-y-2">
              {publicRooms.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between bg-slate-900 p-3 rounded"
                >
                  <div>
                    <p className="font-mono">{room.id}</p>
                    <p className="text-xs text-slate-400">
                      {room.players.p2 ? "2 / 2" : "1 / 2"} Player
                    </p>
                  </div>

                  <button
                    onClick={() => joinRoom(room.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded"
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lobby;
