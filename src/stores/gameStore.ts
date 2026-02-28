import { create } from "zustand";
import {
  GamePhase,
  MemberData,
  MemberStatus,
  OverlayType,
  SmoothPosition,
  ChatMessage,
  GameResult,
  TransitionStep,
} from "@/lib/types";
import { MOCK_GAME_DATA } from "@/data/mockData";
import {
  STAGE_START_POSITION,
  ROOM_ENTRY_POSITION,
} from "@/lib/constants";

interface GameState {
  // Phase
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Transition
  transitionStep: TransitionStep;
  pendingPhase: GamePhase | null;
  pendingRoomId: string | null;
  requestEnterRoom: (roomId: string) => void;
  requestExitRoom: () => void;
  commitTransition: () => void;
  finishTransition: () => void;

  // Game data
  title: string;
  artist: string;
  durationSeconds: number;

  // Timer
  timeRemaining: number;
  timerRunning: boolean;
  startTimer: () => void;
  tick: () => void;

  // Members
  members: MemberData[];
  rescueOrder: string[];
  rescueMember: (memberId: string) => void;
  getMember: (memberId: string) => MemberData | undefined;

  // Current room
  currentRoomId: string | null;

  // Player (smooth position in grid units)
  playerPosition: SmoothPosition;
  mapPlayerPosition: SmoothPosition;
  setPlayerPosition: (x: number, y: number) => void;

  // Overlay
  activeOverlay: OverlayType;
  overlayData: { objectId?: string; memberId?: string } | null;
  openOverlay: (
    type: OverlayType,
    data?: { objectId?: string; memberId?: string }
  ) => void;
  closeOverlay: () => void;

  // Chat
  chatMessages: ChatMessage[];
  chatHintIndex: number;
  chatGenericIndex: number;
  addChatMessage: (msg: ChatMessage) => void;
  clearChat: () => void;

  // Quiz
  quizAnswered: boolean;
  quizCorrect: boolean | null;
  answerQuiz: (selectedIndex: number) => void;
  resetQuiz: () => void;

  // All-clear
  triggerAllClear: () => void;

  // Result
  result: GameResult | null;
  setResult: (result: GameResult) => void;

  // Initialize
  initGame: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Phase
  phase: "landing",
  setPhase: (phase) => set({ phase }),

  // Transition
  transitionStep: "none",
  pendingPhase: null,
  pendingRoomId: null,

  requestEnterRoom: (roomId) => {
    const member = get().members.find((m) => m.roomId === roomId);
    if (!member || member.status === "rescued") return;
    set({
      transitionStep: "fading-out",
      pendingPhase: "in-room",
      pendingRoomId: roomId,
    });
  },

  requestExitRoom: () => {
    set({
      transitionStep: "fading-out",
      pendingPhase: "stage-map",
      pendingRoomId: null,
    });
  },

  commitTransition: () => {
    const { pendingPhase, pendingRoomId, playerPosition } = get();

    if (pendingPhase === "in-room" && pendingRoomId) {
      // Save map position, enter room
      set({
        mapPlayerPosition: { ...playerPosition },
        currentRoomId: pendingRoomId,
        phase: "in-room",
        playerPosition: { ...ROOM_ENTRY_POSITION },
        activeOverlay: null,
        chatMessages: [],
        chatHintIndex: 0,
        chatGenericIndex: 0,
        quizAnswered: false,
        quizCorrect: null,
        transitionStep: "fading-in",
      });
    } else if (pendingPhase === "stage-map") {
      // Restore map position
      const { mapPlayerPosition } = get();
      set({
        currentRoomId: null,
        phase: "stage-map",
        playerPosition: { ...mapPlayerPosition },
        activeOverlay: null,
        transitionStep: "fading-in",
      });
    }
  },

  finishTransition: () => {
    set({
      transitionStep: "none",
      pendingPhase: null,
      pendingRoomId: null,
    });
  },

  // Game data
  title: MOCK_GAME_DATA.title,
  artist: MOCK_GAME_DATA.artist,
  durationSeconds: MOCK_GAME_DATA.durationSeconds,

  // Timer
  timeRemaining: MOCK_GAME_DATA.durationSeconds,
  timerRunning: false,
  startTimer: () => set({ timerRunning: true }),
  tick: () => {
    const state = get();
    if (!state.timerRunning) return;
    const next = state.timeRemaining - 1;
    if (next <= 0) {
      set({ timeRemaining: 0, timerRunning: false });
      set({
        phase: "result",
        activeOverlay: null,
        transitionStep: "none",
        result: {
          isCleared: false,
          totalTimeSeconds: state.durationSeconds,
          remainingSeconds: 0,
          rescueOrder: state.rescueOrder,
          rescuedCount: state.members.filter((m) => m.status === "rescued").length,
          totalMembers: state.members.length,
        },
      });
    } else {
      set({ timeRemaining: next });
    }
  },

  // Members
  members: MOCK_GAME_DATA.members.map((m) => ({ ...m, status: "trapped" as MemberStatus })),
  rescueOrder: [],
  rescueMember: (memberId) => {
    const state = get();
    const updatedMembers = state.members.map((m) =>
      m.id === memberId ? { ...m, status: "rescued" as MemberStatus } : m
    );
    const newOrder = [...state.rescueOrder, memberId];
    set({ members: updatedMembers, rescueOrder: newOrder });
  },
  getMember: (memberId) => get().members.find((m) => m.id === memberId),

  // Current room
  currentRoomId: null,

  // Player
  playerPosition: { ...STAGE_START_POSITION },
  mapPlayerPosition: { ...STAGE_START_POSITION },
  setPlayerPosition: (x, y) => set({ playerPosition: { x, y } }),

  // Overlay
  activeOverlay: null,
  overlayData: null,
  openOverlay: (type, data) =>
    set({ activeOverlay: type, overlayData: data ?? null }),
  closeOverlay: () => set({ activeOverlay: null, overlayData: null }),

  // Chat
  chatMessages: [],
  chatHintIndex: 0,
  chatGenericIndex: 0,
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  clearChat: () =>
    set({ chatMessages: [], chatHintIndex: 0, chatGenericIndex: 0 }),

  // Quiz
  quizAnswered: false,
  quizCorrect: null,
  answerQuiz: (selectedIndex) => {
    const state = get();
    const member = state.members.find((m) => m.roomId === state.currentRoomId);
    if (!member) return;
    const correct = selectedIndex === member.quiz.correctIndex;
    set({ quizAnswered: true, quizCorrect: correct });
    if (correct) {
      state.rescueMember(member.id);
    }
  },
  resetQuiz: () => set({ quizAnswered: false, quizCorrect: null }),

  // All-clear
  triggerAllClear: () => {
    const s = get();
    set({
      phase: "result",
      activeOverlay: null,
      currentRoomId: null,
      transitionStep: "none",
      timerRunning: false,
      result: {
        isCleared: true,
        totalTimeSeconds: s.durationSeconds,
        remainingSeconds: s.timeRemaining,
        rescueOrder: s.rescueOrder,
        rescuedCount: s.members.length,
        totalMembers: s.members.length,
      },
    });
  },

  // Result
  result: null,
  setResult: (result) => set({ result }),

  // Initialize
  initGame: () => {
    set({
      phase: "stage-map",
      timeRemaining: MOCK_GAME_DATA.durationSeconds,
      timerRunning: true,
      members: MOCK_GAME_DATA.members.map((m) => ({
        ...m,
        status: "trapped" as MemberStatus,
      })),
      rescueOrder: [],
      currentRoomId: null,
      playerPosition: { ...STAGE_START_POSITION },
      mapPlayerPosition: { ...STAGE_START_POSITION },
      activeOverlay: null,
      overlayData: null,
      chatMessages: [],
      chatHintIndex: 0,
      chatGenericIndex: 0,
      quizAnswered: false,
      quizCorrect: null,
      result: null,
      transitionStep: "none",
      pendingPhase: null,
      pendingRoomId: null,
    });
  },
  resetGame: () => {
    set({
      phase: "landing",
      timeRemaining: MOCK_GAME_DATA.durationSeconds,
      timerRunning: false,
      members: MOCK_GAME_DATA.members.map((m) => ({
        ...m,
        status: "trapped" as MemberStatus,
      })),
      rescueOrder: [],
      currentRoomId: null,
      playerPosition: { ...STAGE_START_POSITION },
      mapPlayerPosition: { ...STAGE_START_POSITION },
      activeOverlay: null,
      overlayData: null,
      chatMessages: [],
      chatHintIndex: 0,
      chatGenericIndex: 0,
      quizAnswered: false,
      quizCorrect: null,
      result: null,
      transitionStep: "none",
      pendingPhase: null,
      pendingRoomId: null,
    });
  },
}));
