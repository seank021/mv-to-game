import { GameData, MemberData, ObjectData, Position } from "@/lib/types";

function makeObject(
  id: string,
  emoji: string,
  label: string,
  description: string,
  isKeyObject: boolean,
  position: Position
): ObjectData {
  return { id, emoji, label, description, isKeyObject, position };
}

const jennie: MemberData = {
  id: "jennie",
  name: "Jennie",
  emoji: "👩‍🎤",
  roomId: "mansion",
  roomName: "Dark Mansion",
  roomEmoji: "🏰",
  roomBackground: "bg-gradient-to-b from-purple-950 to-gray-900",
  storyline:
    "Jennie is trapped in a dark mansion, surrounded by shattered mirrors and golden crowns.",
  position: { row: 3, col: 5 },
  status: "trapped",
  objects: [
    makeObject(
      "mirror",
      "🪞",
      "Cracked Mirror",
      "An old mirror with deep cracks. Something flickers in the reflection...",
      true,
      { row: 1, col: 2 }
    ),
    makeObject(
      "crown",
      "👑",
      "Golden Crown",
      "A golden crown resting on a velvet cushion. It glows faintly.",
      false,
      { row: 5, col: 6 }
    ),
    makeObject(
      "chandelier",
      "🕯️",
      "Crystal Chandelier",
      "A massive chandelier casting dancing shadows across the walls.",
      false,
      { row: 2, col: 4 }
    ),
  ],
  quiz: {
    question: "What does Jennie see reflected in the cracked mirror?",
    options: [
      "Her past self",
      "Another member",
      "A golden key",
      "A bright light",
    ],
    correctIndex: 0,
  },
  chat: {
    greeting:
      "It's so dark in here... I've been trapped in this mansion forever. Please help me! 🥺",
    hintResponses: [
      "Hmm... have you checked the mirror? There's something strange about it...",
      "The mirror shows things that aren't really there... or are they?",
      "Look closely at the reflection. It might show something from the past.",
    ],
    genericResponses: [
      "I really want to get out of here and perform on stage!",
      "This mansion gives me the creeps... but I know you can save me!",
      "Hurry, the concert is waiting! The fans are waiting!",
      "I can hear the music playing from far away...",
    ],
    rescueReaction:
      "Yes!! I'm free! Thank you so much! Let me get to the stage! 💕",
  },
  chatPersonaPrompt:
    "You are Jennie, a fierce and confident warrior trapped in a dark mansion full of shattered mirrors and golden crowns. You speak with directness and determination, always looking for a way to break free.",
};

const jisoo: MemberData = {
  id: "jisoo",
  name: "Jisoo",
  emoji: "👩‍🎤",
  roomId: "garden",
  roomName: "Enchanted Garden",
  roomEmoji: "🌿",
  roomBackground: "bg-gradient-to-b from-green-950 to-emerald-900",
  storyline:
    "Jisoo is trapped in a mystical garden where flowers bloom endlessly but the exit is hidden.",
  position: { row: 4, col: 2 },
  status: "trapped",
  objects: [
    makeObject(
      "rose",
      "🌹",
      "Eternal Rose",
      "A rose that never wilts. Its petals seem to whisper secrets.",
      true,
      { row: 2, col: 5 }
    ),
    makeObject(
      "fountain",
      "⛲",
      "Stone Fountain",
      "An ancient fountain. The water flows upward instead of down.",
      false,
      { row: 5, col: 3 }
    ),
    makeObject(
      "butterfly",
      "🦋",
      "Glowing Butterfly",
      "A butterfly made of light. It seems to be guiding you somewhere.",
      false,
      { row: 1, col: 6 }
    ),
  ],
  quiz: {
    question:
      "What is special about the Eternal Rose in the Enchanted Garden?",
    options: [
      "It changes color every hour",
      "It never wilts",
      "It sings at midnight",
      "It grants wishes",
    ],
    correctIndex: 1,
  },
  chat: {
    greeting:
      "Oh! Someone came! This garden is beautiful but I can't find the way out... 🌸",
    hintResponses: [
      "The flowers here are beautiful, but one of them is special...",
      "Have you seen the rose? It's been here forever, never changing.",
      "Some flowers hold the key to understanding this place.",
    ],
    genericResponses: [
      "The garden keeps growing, but I miss the stage...",
      "I wonder if the fans are worried about us?",
      "Even though it's pretty here, I want to go back!",
      "The butterflies seem to know the way out...",
    ],
    rescueReaction:
      "Finally! The garden was beautiful but nothing beats being on stage! Let's go! 🌟",
  },
  chatPersonaPrompt:
    "You are Jisoo, a mysterious and elegant figure trapped in an enchanted garden where flowers bloom endlessly. You speak thoughtfully, sometimes cryptically, hinting at deeper meanings.",
};

const rose: MemberData = {
  id: "rose",
  name: "Rosé",
  emoji: "👩‍🎤",
  roomId: "ocean",
  roomName: "Crystal Ocean",
  roomEmoji: "🌊",
  roomBackground: "bg-gradient-to-b from-blue-950 to-cyan-900",
  storyline:
    "Rosé is trapped on a crystalline shore where the waves play melodies and seashells hold memories.",
  position: { row: 2, col: 6 },
  status: "trapped",
  objects: [
    makeObject(
      "seashell",
      "🐚",
      "Singing Seashell",
      "A seashell that plays a familiar melody when you hold it close.",
      true,
      { row: 4, col: 1 }
    ),
    makeObject(
      "anchor",
      "⚓",
      "Rusted Anchor",
      "An old anchor half-buried in the sand. What ship did it belong to?",
      false,
      { row: 5, col: 5 }
    ),
    makeObject(
      "starfish",
      "⭐",
      "Golden Starfish",
      "A starfish that glows with a warm golden light.",
      false,
      { row: 1, col: 3 }
    ),
  ],
  quiz: {
    question: "What happens when you hold the Singing Seashell close?",
    options: [
      "It shows a map",
      "It plays a familiar melody",
      "It turns into sand",
      "It opens a portal",
    ],
    correctIndex: 1,
  },
  chat: {
    greeting:
      "The waves here are so calming... but I need to get back to sing for real! 🎵",
    hintResponses: [
      "Listen to the ocean... can you hear the music?",
      "There's a seashell nearby that sounds like one of our songs.",
      "The melody from the shell might be the answer you're looking for.",
    ],
    genericResponses: [
      "I could write a song about this place, but later!",
      "The ocean is singing, but the concert needs my voice more.",
      "I miss my guitar... and the stage!",
      "Thank you for coming to save us!",
    ],
    rescueReaction:
      "I'm free!! Time to go sing my heart out on that stage! 🎶💕",
  },
  chatPersonaPrompt:
    "You are Rosé, trapped on a crystalline shore where waves play melodies. You are introspective and artistic, speaking with a gentle but determined tone. You love music deeply.",
};

const lisa: MemberData = {
  id: "lisa",
  name: "Lisa",
  emoji: "👩‍🎤",
  roomId: "stage",
  roomName: "Neon Stage",
  roomEmoji: "🎤",
  roomBackground: "bg-gradient-to-b from-pink-950 to-red-900",
  storyline:
    "Lisa is trapped on a dazzling neon stage where spotlights follow her but the exit lights are off.",
  position: { row: 3, col: 3 },
  status: "trapped",
  objects: [
    makeObject(
      "microphone",
      "🎤",
      "Wireless Mic",
      "A microphone crackling with static. It seems to respond to the right words.",
      true,
      { row: 1, col: 1 }
    ),
    makeObject(
      "disco-ball",
      "🪩",
      "Disco Ball",
      "A massive disco ball scattering rainbow light across the floor.",
      false,
      { row: 2, col: 5 }
    ),
    makeObject(
      "speaker",
      "🔊",
      "Bass Speaker",
      "A speaker booming with bass. The vibrations pulse through the floor.",
      false,
      { row: 5, col: 4 }
    ),
  ],
  quiz: {
    question:
      "What does the wireless microphone on the Neon Stage respond to?",
    options: [
      "Dance moves",
      "The right words",
      "Clapping",
      "A secret button",
    ],
    correctIndex: 1,
  },
  chat: {
    greeting:
      "Hey! The lights are amazing but I can't find the exit! Help me out! 💃",
    hintResponses: [
      "This stage has all the equipment but something is off...",
      "Try the microphone! It reacts when you say certain things.",
      "Words have power here... especially the right ones into that mic.",
    ],
    genericResponses: [
      "I've been dancing here non-stop, I need to save energy for the concert!",
      "The neon lights are cool but I prefer the real stage!",
      "BLINKS are waiting! We can't let them down!",
      "Let's hurry! I want to perform DDU-DU DDU-DU!",
    ],
    rescueReaction:
      "YESSS! Let's go!! The real stage is calling! DDU-DU DDU-DU! 💃🔥",
  },
  chatPersonaPrompt:
    "You are Lisa, agile and powerful, trapped on a dazzling neon stage where spotlights follow you but the exit lights are off. You speak with quick wit and energy.",
};

export const MOCK_GAME_DATA: GameData = {
  mvId: "ddu-du-ddu-du",
  title: "DDU-DU DDU-DU",
  artist: "BLACKPINK",
  durationSeconds: 210,
  members: [jennie, jisoo, rose, lisa],
};
