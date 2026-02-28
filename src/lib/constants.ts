// ─── Stage Map Layout ───
// 0 = wall, 1 = walkable corridor
// 15 cols x 11 rows — all corridors are 2 cells wide for smooth movement
export const STAGE_MAP_LAYOUT = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // S1(cols 2-3), S3(cols 8-9)
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // paths to corridor
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // top horizontal corridor
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], // left/right verticals + stage
  [1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], // player entry + stage
  [0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1], // left/right verticals + stage
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0], // bottom horizontal corridor
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // paths to corridor
  [0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0], // S2(cols 2-3), S4(cols 8-9)
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];

export const STAGE_COLS = 15;
export const STAGE_ROWS = 11;

// Portal slot positions on stage map (assigned to members dynamically)
export const STAGE_PORTAL_SLOTS = [
  { col: 2, row: 1, label: "S1" },
  { col: 8, row: 1, label: "S2" },
  { col: 2, row: 9, label: "S3" },
  { col: 8, row: 9, label: "S4" },
] as const;

// Stage area (concert stage with silhouettes)
export const STAGE_AREA = { startCol: 12, endCol: 14, startRow: 4, endRow: 6 };

// Player start on map (center of entry cell at row 5, col 0)
export const STAGE_START_POSITION = { x: 0.5, y: 5.5 };

// Player collision radius (grid units)
export const PLAYER_RADIUS = 0.2;

// ─── Room Grid ───
export const ROOM_COLS = 10;
export const ROOM_ROWS = 8;

// Room entrance/exit positions
export const ROOM_ENTRY_POSITION = { x: 1, y: 7 };
export const ROOM_EXIT_POSITION = { col: 0, row: 7 };

// ─── Cell sizes (pixels) ───
export const CELL_SIZE = 32;
export const CELL_SIZE_MOBILE = 24;

// ─── Movement ───
export const MOVE_SPEED = 5; // grid units per second (delta-time based)

// ─── Proximity ───
export const PROXIMITY_RADIUS = 1.3;
export const INTERACT_RADIUS = 1.0;

// ─── Timer ───
export const TIMER_WARNING_THRESHOLD = 60;
export const TIMER_CRITICAL_THRESHOLD = 30;

// ─── Loading / Cutscene ───
export const LOADING_MIN_DURATION_MS = 5000;
export const TYPING_SPEED_MS = 40;
export const TRANSITION_DURATION_MS = 500;

export const CUTSCENE_TEXTS = [
  { type: "narration" as const, text: "Today is finally concert day!" },
  { type: "narration" as const, text: "The phone rings..." },
  { type: "dialogue" as const, text: "Boss!! We have a huge problem!!" },
  {
    type: "dialogue" as const,
    text: "The concert just started but... the members got trapped inside the music video?!?!?!",
  },
  {
    type: "dialogue" as const,
    text: "Right now we're just playing the title track on stage to buy time...",
  },
  {
    type: "dialogue" as const,
    text: "You need to go into the music video yourself and rescue them!!",
  },
  {
    type: "dialogue" as const,
    text: "You have to rescue everyone before the song ends to save the concert!!!",
  },
];
