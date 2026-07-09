export type PlayerRole = "p1" | "p2";
export type BoardCell = "X" | "O" | "";
export type GameStatus = "waiting" | "playing" | "ended";
export type WinnerState = "p1" | "p2" | "draw" | "";

export interface RoomData {
  id: string;
  status: GameStatus;
  players: {
    p1: string;
    p2: string;
  };
  board: BoardCell[];
  turn: PlayerRole;
  winner: WinnerState;
  rematch: {
    p1: boolean;
    p2: boolean;
  };
}