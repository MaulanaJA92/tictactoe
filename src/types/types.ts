export type PlayerRole = "p1" | "p2";
export type BoardCell = "X" | "O" | "";
export type GameStatus = "waiting" |"ready"| "playing" | "ended";
export type WinnerState = "p1" | "p2" | "draw" | "";

export interface RoomData {
  id: string;
  visibility: "private" | "public";
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
  ready: {
  p1: true,
  p2: false,
}
score: {
  p1: number;
  p2: number;
  draw: number;
}
}