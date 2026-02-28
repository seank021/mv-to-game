export type GamePhase =
  | "landing"
  | "loading"
  | "stage-map"
  | "in-room"
  | "result";

export type MemberStatus = "trapped" | "rescued";

export type TimerState = "normal" | "warning" | "critical" | "expired";

export type OverlayType = "chat" | "quiz" | "object" | "rescue" | null;

export type TransitionStep = "none" | "fading-out" | "fading-in";

/** Grid position for objects/members (integer cells) */
export interface Position {
  row: number;
  col: number;
}

/** Smooth position for player (float grid units) */
export interface SmoothPosition {
  x: number; // column (float)
  y: number; // row (float)
}

export interface ObjectData {
  id: string;
  emoji: string;
  label: string;
  description: string;
  isKeyObject: boolean;
  position: Position;
}

export interface QuizData {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface ChatMessage {
  id: string;
  from: "member" | "player" | "system";
  text: string;
}

export interface MemberChatData {
  greeting: string;
  hintResponses: string[];
  genericResponses: string[];
  rescueReaction: string;
}

export interface MemberData {
  id: string;
  name: string;
  emoji: string;
  profileImage?: string;
  roomId: string;
  roomName: string;
  roomEmoji: string;
  roomBackground: string;
  storyline: string;
  position: Position;
  status: MemberStatus;
  objects: ObjectData[];
  quiz: QuizData;
  chat: MemberChatData;
  chatPersonaPrompt?: string;
}

export interface RoomData {
  id: string;
  name: string;
  emoji: string;
  memberId: string;
  background: string;
  gridCells: CellData[][];
}

export interface CellData {
  type: "floor" | "wall" | "object" | "member" | "exit";
  objectId?: string;
  memberId?: string;
  background?: string;
}

export interface GameResult {
  isCleared: boolean;
  totalTimeSeconds: number;
  remainingSeconds: number;
  rescueOrder: string[];
  rescuedCount: number;
  totalMembers: number;
}

export interface ZoneConnection {
  toZone: string;
  edge: "left" | "right" | "top" | "bottom";
  positionY: number;
}

export interface ZoneData {
  zoneId: string;
  memberName: string;
  backgroundTimestamp: string;
  width: number;
  height: number;
  connections: ZoneConnection[];
  memberPosition: SmoothPosition;
  objectPositions: { label: string; x: number; y: number; isKeyObject: boolean }[];
}

export interface MapData {
  zones: ZoneData[];
  spawnZone: string;
  playerStartPosition: SmoothPosition;
}

export interface GameData {
  mvId: string;
  title: string;
  artist: string;
  audioUrl: string;
  durationSeconds: number;
  members: MemberData[];
  map: MapData;
}
