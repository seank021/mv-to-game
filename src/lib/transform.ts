import { GameData, MemberData, ObjectData, Position, MemberChatData, MapData, ZoneData } from "./types";

// ─── Analyzer JSON types ───

interface AnalyzerObject {
  label: string;
  bbox: number[];
  is_key_object: boolean;
}

interface AnalyzerQuiz {
  question: string;
  type: string;
  options: string[];
  answer: string;
}

interface AnalyzerRoom {
  storyline: string;
  background_pixel_art_url: string;
  background_timestamp: string;
  original_scene_url: string;
  objects: AnalyzerObject[];
  quiz: AnalyzerQuiz;
  chat_persona_prompt: string;
}

interface AnalyzerMember {
  name: string;
  profile_photo_url: string;
  pixel_avatar_url: string;
  room: AnalyzerRoom;
}

interface AnalyzerZone {
  zone_id: string;
  member_name: string;
  background_pixel_art_url: string;
  background_timestamp: string;
  width: number;
  height: number;
  connections: { to_zone: string; edge: string; position_y: number }[];
  member_position: { x: number; y: number };
  object_positions: { label: string; x: number; y: number; is_key_object: boolean }[];
}

export interface AnalyzerOutput {
  mv_id: string;
  title: string;
  artist: string;
  audio_url: string;
  duration_seconds: number;
  bpm: number;
  map: {
    zones: AnalyzerZone[];
    spawn_zone: string;
    player_start_position: { x: number; y: number };
  };
  members: AnalyzerMember[];
}

// ─── Emoji derivation ───

const OBJECT_EMOJI_MAP: Record<string, string> = {
  pearl: "📿", mirror: "🪞", crown: "👑", rose: "🌹",
  flower: "🌸", wing: "🪽", mask: "🎭", dress: "👗",
  sword: "⚔️", key: "🔑", book: "📖", crystal: "💎",
  fire: "🔥", water: "💧", star: "⭐", moon: "🌙",
  snake: "🐍", oar: "🛶", staff: "🪄", liquid: "💧",
  surface: "🪞", portal: "🌀", lever: "🎚️", panel: "🖥️",
  light: "💡", candle: "🕯️", gem: "💎", ring: "💍",
  chain: "⛓️", door: "🚪", box: "📦", skull: "💀",
  eye: "👁️", heart: "❤️", shield: "🛡️",
  scroll: "📜", potion: "🧪", wand: "🪄", hat: "🎩",
  clock: "⏰", bell: "🔔", feather: "🪶", leaf: "🍃",
  stone: "🪨", shell: "🐚", anchor: "⚓", butterfly: "🦋",
  microphone: "🎤", guitar: "🎸", piano: "🎹", drum: "🥁",
  camera: "📷", phone: "📱", photo: "🖼️", painting: "🎨",
  necklace: "📿", bracelet: "💎", headband: "👑", wrap: "🐍",
};

function deriveObjectEmoji(label: string): string {
  const lower = label.toLowerCase();
  for (const [keyword, emoji] of Object.entries(OBJECT_EMOJI_MAP)) {
    if (lower.includes(keyword)) return emoji;
  }
  return "✨";
}

const ROOM_THEMES = [
  { emoji: "🏰", bg: "bg-gradient-to-b from-purple-950 to-gray-900" },
  { emoji: "🌊", bg: "bg-gradient-to-b from-blue-950 to-cyan-900" },
  { emoji: "🌿", bg: "bg-gradient-to-b from-green-950 to-emerald-900" },
  { emoji: "🎤", bg: "bg-gradient-to-b from-pink-950 to-red-900" },
  { emoji: "🔮", bg: "bg-gradient-to-b from-indigo-950 to-violet-900" },
  { emoji: "🌙", bg: "bg-gradient-to-b from-slate-950 to-blue-900" },
];

const MEMBER_EMOJIS = ["👩‍🎤", "🧑‍🎤", "💃", "🎤"];

// ─── Grid position conversion ───
// Analyzer uses pixel coords in 800x600, game uses 10 cols x 8 rows

const ROOM_GRID_COLS = 10;
const ROOM_GRID_ROWS = 8;

function pixelToGrid(x: number, y: number, width: number, height: number): Position {
  return {
    col: Math.min(ROOM_GRID_COLS - 2, Math.max(1, Math.floor((x / width) * ROOM_GRID_COLS))),
    row: Math.min(ROOM_GRID_ROWS - 2, Math.max(1, Math.floor((y / height) * ROOM_GRID_ROWS))),
  };
}

// ─── Chat generation ───

function generateChat(name: string, storyline: string, keyObjectLabel: string): MemberChatData {
  const shortStory = storyline.split(".")[0];
  return {
    greeting: `Help me! I'm ${name}... ${shortStory}. Can you save me? 🥺`,
    hintResponses: [
      `Have you found the ${keyObjectLabel}? It might be the key...`,
      `Look around carefully. There's something special in this place.`,
      `I think the answer is connected to the ${keyObjectLabel}...`,
    ],
    genericResponses: [
      `I really need to get back to the stage!`,
      `The fans are waiting for us... please hurry!`,
      `Thank you for trying to help me!`,
      `I can almost hear the music from here...`,
    ],
    rescueReaction: `I'm free!! Thank you so much! Let's get to the stage! 🎵✨`,
  };
}

// ─── Object description generation ───

function generateDescription(label: string, isKey: boolean): string {
  if (isKey) {
    return `${label}. This seems important — it might hold the key to the rescue.`;
  }
  return `${label}. An interesting object from the music video.`;
}

// ─── Main transform ───

function findAvatar(avatarMap: Record<string, string> | undefined, name: string): string | undefined {
  if (!avatarMap) return undefined;
  // Exact match first
  if (avatarMap[name]) return avatarMap[name];
  // Case-insensitive match
  const lower = name.toLowerCase();
  for (const [key, value] of Object.entries(avatarMap)) {
    if (key.toLowerCase() === lower) return value;
  }
  // Partial match (e.g. "Lalisa" contains "Lisa")
  for (const [key, value] of Object.entries(avatarMap)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) return value;
  }
  return undefined;
}

export function transformAnalyzerOutput(data: AnalyzerOutput, avatarMap?: Record<string, string>): GameData {
  const members: MemberData[] = data.members.map((member, index) => {
    const zone = data.map.zones.find((z) => z.member_name === member.name);
    const theme = ROOM_THEMES[index % ROOM_THEMES.length];

    // Convert zone_id to readable room name
    const roomName = (zone?.zone_id ?? `room_${index}`)
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    // Find the key object label for chat generation
    const keyObj = member.room.objects.find((o) => o.is_key_object);
    const keyObjLabel = keyObj?.label ?? "mysterious object";

    // Convert quiz answer string → correctIndex
    const correctIndex = member.room.quiz.options.indexOf(member.room.quiz.answer);

    // Convert pixel positions to grid positions
    const zoneWidth = zone?.width ?? 800;
    const zoneHeight = zone?.height ?? 600;

    const memberPos = zone
      ? pixelToGrid(zone.member_position.x, zone.member_position.y, zoneWidth, zoneHeight)
      : { row: 3, col: 5 };

    // Map objects with positions from zone.object_positions
    const objects: ObjectData[] = member.room.objects.map((obj, objIdx) => {
      // Try to find matching position from zone data
      const zoneObjPos = zone?.object_positions.find(
        (zp) => zp.label.toLowerCase() === obj.label.toLowerCase()
      );
      const pos = zoneObjPos
        ? pixelToGrid(zoneObjPos.x, zoneObjPos.y, zoneWidth, zoneHeight)
        : { row: 1 + objIdx * 2, col: 2 + objIdx * 2 }; // fallback spread

      return {
        id: obj.label.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        emoji: deriveObjectEmoji(obj.label),
        label: obj.label,
        description: generateDescription(obj.label, obj.is_key_object),
        isKeyObject: obj.is_key_object,
        position: pos,
      };
    });

    return {
      id: member.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      name: member.name,
      emoji: MEMBER_EMOJIS[index % MEMBER_EMOJIS.length],
      profileImage: findAvatar(avatarMap, member.name),
      roomId: zone?.zone_id ?? `room_${index}`,
      roomName,
      roomEmoji: theme.emoji,
      roomBackground: theme.bg,
      storyline: member.room.storyline,
      position: memberPos,
      status: "trapped" as const,
      objects,
      quiz: {
        question: member.room.quiz.question,
        options: member.room.quiz.options,
        correctIndex: correctIndex >= 0 ? correctIndex : 0,
      },
      chat: generateChat(member.name, member.room.storyline, keyObjLabel),
    };
  });

  const map: MapData = {
    zones: data.map.zones.map((z): ZoneData => ({
      zoneId: z.zone_id,
      memberName: z.member_name,
      backgroundTimestamp: z.background_timestamp,
      width: z.width,
      height: z.height,
      connections: z.connections.map((c) => ({
        toZone: c.to_zone,
        edge: c.edge as "left" | "right" | "top" | "bottom",
        positionY: c.position_y,
      })),
      memberPosition: { x: z.member_position.x, y: z.member_position.y },
      objectPositions: z.object_positions.map((o) => ({
        label: o.label,
        x: o.x,
        y: o.y,
        isKeyObject: o.is_key_object,
      })),
    })),
    spawnZone: data.map.spawn_zone,
    playerStartPosition: {
      x: data.map.player_start_position.x,
      y: data.map.player_start_position.y,
    },
  };

  return {
    mvId: data.mv_id,
    title: data.title,
    artist: data.artist,
    audioUrl: data.audio_url,
    durationSeconds: data.duration_seconds,
    members,
    map,
  };
}
