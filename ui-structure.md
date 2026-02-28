# MV Escape — UI Structure

## Screen Map

```
Landing Page ──→ Loading (Cutscene) ──→ Stage Map ◄──→ Room View ──→ Result Screen
                                            │              │
                                       Stage             ┌───┴───┐
                                       Silhouettes       │Overlays│
                                       (convert to       ├────────┤
                                       pixel on rescue)  │ Chat   │
                                            │            │ Quiz   │
                                            └─→ Clear    │ Object │
                                               Sequence  └────────┘
```

5 main screens + 3 overlays in total.

- **Stage Map**: Main hub. Concert stage + member room nodes + silhouette system
- **Room View**: Individual room interiors. Object exploration + member chat + quiz

---

## 1. Landing Page

A simple screen with only a URL input field. No other elements — focus entirely on input.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                                                 │
│                                                 │
│               MV ESCAPE 🎵🚪                     │
│         "Rescue the members trapped              │
│          inside the music video"                 │
│                                                 │
│         ┌─────────────────────────────┐         │
│         │ Paste a YouTube MV URL here  │         │
│         └─────────────────────────────┘         │
│                                                 │
│               [ 🚀 Start ]                       │
│                                                 │
│                                                 │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| Logo & Title | "MV ESCAPE" + tagline |
| URL Input | YouTube URL paste input field (with validation) |
| Start Button | Activates after URL input, triggers analysis on click |

### States

- **Default**: Input field empty, start button disabled
- **URL Entered**: URL pasted, start button enabled
- **Invalid URL**: Error message displayed ("Please enter a valid YouTube URL")
- **Loading**: After start button click → transitions to Loading screen

---

## 2. Loading Screen (Cutscene)

A cutscene that provides detailed worldbuilding while analysis runs in the background. The player is assigned the role of agency CEO/manager, and the urgent situation is conveyed.

```
┌─────────────────────────────────────────────────┐
│                                                 │
│   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒      │
│   ▒                                       ▒    │
│   ▒  🎤 Pixel Concert Stage               ▒    │
│   ▒  The audience is cheering, waiting...  ▒    │
│   ▒  Only silhouettes visible on stage     ▒    │
│   ▒                                       ▒    │
│   ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒      │
│                                                 │
│    ┌─────────────────────────────────────┐       │
│    │ 📱 The phone rings...                │       │
│    │                                     │       │
│    │ "Boss!! We have a huge problem!!"    │       │
│    │ "The concert is about to start but   │       │
│    │  the members are trapped inside      │       │
│    │  the music video?!?!?!"             │       │
│    └─────────────────────────────────────┘       │
│                                                 │
│   ── Analysis Progress ──                        │
│                                                 │
│   ✅ Video download complete                     │
│   ✅ Member info search complete (4 found)       │
│   🔄 Analyzing storyline...                      │
│   ⬜ Background extraction                       │
│   ⬜ Pixel art conversion                        │
│   ⬜ Game assembly                               │
│                                                 │
│   ████████████░░░░░░░░  45%                     │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| Cutscene Area | Pixel art style cutscene animation (concert stage → phone call → members missing → entering the MV world) |
| Story Text | Worldbuilding text displayed sequentially in dialogue format with typing animation |
| Progress Steps | Status of each pipeline step (complete/loading/pending) |
| Progress Bar | Overall progress percentage |

### Story Text Sequence

Player = Agency CEO (or manager). An emergency occurs right before the concert.

1. *[Pixel concert stage scene. Audience cheering]*
2. "Today is finally concert day!"
3. *[📱 The phone rings]*
4. "Boss!! We have a huge problem!!"
5. "The concert just started but... the members got trapped inside the music video?!?!?!"
6. *[Member silhouettes on stage disappear one by one]*
7. "Right now we're just playing the title track on stage to buy time..."
8. "You need to go into the music video yourself and rescue them!!"
9. "You have to rescue everyone before the song ends to save the concert!!!"
10. *[Animation of the player diving into the screen]*
11. → Auto-transitions to Game Screen when analysis is complete

---

## 3. Game Screen (Main)

The game consists of two views: **Stage Map (overview)** + **Room View (individual rooms)**. Select a room from the Stage Map to enter its interior.

### 3.0 Stage Map — Overview Map

The hub screen of the game. Shows a bird's-eye view of the entire map with the concert stage at the center and each member's room connected to it.
Room interior data is loaded in parallel when the user enters a specific room.

```
┌─────────────────────────────────────────────────┐
│ ♪ 3:12 left ████████░░░               [ 🗺 Map ]│  ← Header Widget
├─────────────────────────────────────────────────┤
│                                                 │
│                  🎤 Concert Stage                │
│           ┌─────────────────────┐               │
│           │  ░░  ░░  ░░  ░░     │               │
│           │  Sil- Sil- Pix- Sil-│  ← Member silhouettes/pixel   │
│           │  hou  hou  el   hou │     (silhouette→pixel on rescue)│
│           │  ette ette Art  ette│               │
│           │  Jennie Jisoo Rose Lisa │            │
│           └──┬─────┬────┬────┬──┘               │
│              │     │    │    │                   │
│         ┌────┘  ┌──┘    └──┐ └────┐              │
│         │       │          │      │              │
│    ┌────┴───┐ ┌─┴──────┐ ┌┴────┐ ┌┴────────┐    │
│    │🔒Mansion│ │🔒Garden │ │✅Sea │ │🔒Stage   │    │
│    │(Jennie)│ │(Jisoo) │ │(Rose)│ │(Lisa)   │    │
│    │        │ │        │ │     │ │         │    │
│    └────────┘ └────────┘ └─────┘ └─────────┘    │
│                                                 │
│         🔒 = Unsolved (dimmed)  ✅ = Solved (bright)│
│                                                 │
│              🧑 ← Player (moving on map)         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Stage Map Components

| Element | Description |
|---------|-------------|
| Concert Stage | Concert stage at top center of the map. Displays member silhouettes/pixel art |
| Member Silhouettes | Member slots on stage. Initially black silhouettes, converts to pixel art on rescue |
| Room Nodes | Nodes representing each member's room. 🔒Unsolved (dimmed) / ✅Solved (bright) |
| Connection Lines | Paths connecting the stage to each room |
| Player Icon | Player icon that moves on the map and can enter rooms |
| Room Thumbnails | Pixel art preview of each room (atmosphere hint) |

### Stage Silhouette System

The stage has one silhouette per member. Each time a member is rescued, their silhouette transforms into pixel art, showing they have "returned to the stage."

```
[Initial State]
  ░░    ░░    ░░    ░░       ← All silhouettes (black shadows)
  Jennie Jisoo Rose  Lisa

[After rescuing Rose]
  ░░    ░░    🧍    ░░       ← Only Rose converted to pixel art + glow effect
  Jennie Jisoo Rose✨ Lisa

[All rescued]
  🧍    🧍    🧍    🧍       ← All pixel art!
  Jennie✨Jisoo✨Rose✨Lisa✨
  ────────────────────
  🌟 Entire stage glows 🌟   ← Transitions to clear sequence
```

| State | Visual |
|-------|--------|
| TRAPPED | Black silhouette, dark tone, slight trembling animation |
| RESCUED | Full-color pixel art, glowing particles, reveal animation (silhouette → color transition) |
| ALL CLEAR | Full stage glow effect, lights ON, audience cheering effect → transitions to clear screen |

### Room Loading Strategy

Room interior data (background pixel art, objects, quizzes, etc.) is loaded in parallel with the map.

| Timing | Loading |
|--------|---------|
| On map entry | Basic info for all rooms (name, status, thumbnail) displayed immediately |
| Background | Detailed data for each room begins preloading in parallel |
| On room entry | If already loaded, enter immediately; if not, brief loading then enter |

---

### 3.1 Room View

Transitions to a room interior when a room is selected from the Stage Map.

```
┌─────────────────────────────────────────────────┐
│ ♪ 3:12 left ████████░░░  [ ← Map ]    [ 🗺 Map ]│  ← Header + Map return button
├─────────────────────────────────────────────────┤
│                                                 │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│    ░░  2D Pixel Room Interior          ░░       │
│    ░░                                  ░░       │
│    ░░   🏰 Mansion Background          ░░       │
│    ░░      (Jennie's Room)             ░░       │
│    ░░         👑 ← Object              ░░       │  ← Room Interior
│    ░░                                  ░░       │
│    ░░              🧑 ← Player         ░░       │
│    ░░                                  ░░       │
│    ░░   💎          🔒Jennie   🪞       ░░       │
│    ░░                                  ░░       │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░       │
│                                                 │
│                                                 │
│              [ Press E to interact ]             │  ← Interaction Hint
│                                                 │
└─────────────────────────────────────────────────┘
```

### 3.2 Header Widget (Always visible)

```
┌─────────────────────────────────────────────────┐
│  ♪ 3:12   ██████████░░░░     [ ← Map ] [ 🗺 ]   │
│  Time left  Progress bar      Back to   Map     │
│                               map       toggle  │
└─────────────────────────────────────────────────┘
```

| Element | Description |
|---------|-------------|
| Timer | Remaining time (mm:ss) + music note icon |
| Progress Bar | Song progress visualization (remaining time vs total length) |
| Map Button | Button to return to Stage Map (only visible inside a room) |

### Timer States

- **Normal** (>60s): White/default color
- **Warning** (30~60s): Yellow blinking
- **Critical** (<30s): Red rapid blinking + heartbeat sound effect

### 3.3 Room Interior

| Element | Description |
|---------|-------------|
| Background | Pixel art converted from MV background frame (different per room) |
| Player Character | Controllable 2D pixel character (arrow keys/WASD/touch movement) |
| Objects | Interactable objects (sparkle effect when nearby) |
| Trapped Member | Trapped member's pixel character (specific position within the room) |
| Exit Point | Exit to return to the map (door/portal style) |

### 3.4 Interaction Hint

Displayed when the player is near an object or member.

```
┌───────────────────────────┐
│  Press E / Tap to examine  │   ← Near an object
└───────────────────────────┘

┌───────────────────────────┐
│  Press E / Tap to talk     │   ← Near a member
└───────────────────────────┘
```

---

## 4. Overlay: Chat Panel

LLM-based chat with a member. Slides up from the bottom when a member is found.

```
┌─────────────────────────────────────────────────┐
│  (Room background dimmed)                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │  Jennie 🔒                     [ ✕ ]   │    │
│  │  ────────────────────────────────────   │    │
│  │                                         │    │
│  │  [Jennie] "It's so dark in here...      │    │
│  │           Please save me~ 🥺"           │    │
│  │                                         │    │
│  │              [Me] "How can I help?"   │    │
│  │                                         │    │
│  │  [Jennie] "Hmm... I think the key       │    │
│  │           thing here is that mirror..." │    │
│  │                                         │    │
│  │  ────────────────────────────────────   │    │
│  │  ┌─────────────────────────┐ [Send]    │    │
│  │  │ Type a message...        │            │    │
│  │  └─────────────────────────┘            │    │
│  │                                         │    │
│  │  [ 💡 Ask for hint ]  [ 🧩 Take quiz ]  │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| Member Header | Member name + pixel avatar + status + close button |
| Chat Messages | Speech bubble style message list (LLM streaming response) |
| Input Field | Text input field + send button |
| Action Buttons | "Ask for hint" / "Take quiz" shortcut buttons |

---

## 5. Overlay: Quiz Panel

Displayed on top of the chat panel when "Take quiz" is selected.

```
┌─────────────────────────────────────────────────┐
│  (Room background dimmed)                        │
│                                                 │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │           🧩 Jennie's Quiz              │    │
│  │                                         │    │
│  │    "What did Jennie see in the mirror?"  │    │
│  │                                         │    │
│  │    ┌─────────────────────────────┐      │    │
│  │    │  A. Her past self            │      │    │
│  │    └─────────────────────────────┘      │    │
│  │    ┌─────────────────────────────┐      │    │
│  │    │  B. Another member           │      │    │
│  │    └─────────────────────────────┘      │    │
│  │    ┌─────────────────────────────┐      │    │
│  │    │  C. A key                    │      │    │
│  │    └─────────────────────────────┘      │    │
│  │    ┌─────────────────────────────┐      │    │
│  │    │  D. A light                  │      │    │
│  │    └─────────────────────────────┘      │    │
│  │                                         │    │
│  │           [ ← Back to chat ]            │    │
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### Quiz Types by Difficulty

| Difficulty | Format | Hint Level |
|------------|--------|------------|
| Easy | 4-choice multiple choice | Hints freely given in chat, objects highlighted |
| Normal | Mixed multiple choice + short answer | Moderate hints in chat |
| Hard | Free-form text input | Minimal hints in chat, objects hidden |

### Quiz Result States

- **Correct**: Correct answer effect → member rescue animation → header widget update
- **Wrong**: Wrong answer display + "Try again" or "Get a hint (back to chat)"

---

## 6. Overlay: Object Interaction

A small popup when examining an object.

```
┌────────────────────────────────┐
│  🪞 Mirror                      │
│  "An old mirror with cracks.     │
│   Something seems to be          │
│   reflected in it..."            │
│                                  │
│     [ Examine closer ]           │
└────────────────────────────────┘
```

---

## 7. Result Screen

Displayed after game ends.

### 7a. Clear (Success)

The stage clear animation plays on the Stage Map first, then transitions to the result card.

**Step 1: Stage Clear Animation (plays on Stage Map)**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│                🌟 CONCERT SAVED! 🌟              │
│                                                 │
│           ┌─────────────────────┐               │
│           │  ✨✨✨✨✨✨✨✨✨✨✨  │               │
│           │                     │               │
│           │  🧍   🧍   🧍   🧍  │  ← All pixel │
│           │ Jennie Jisoo Rose Lisa│   art complete!│
│           │                     │               │
│           │  🎵 Lights ON 🎵    │               │
│           │  🎆 Crowd cheering 🎆│               │
│           └─────────────────────┘               │
│                                                 │
│          The stage glows and the concert begins! │
│                                                 │
└─────────────────────────────────────────────────┘
```

- Last silhouette → pixel art transition animation
- Full stage glow effect (light spreading outward)
- Lights turn on, audience cheering effect
- Members striking poses in pixel animation
- Transitions to result card after 2~3 seconds

**Step 2: Result Card**

```
┌─────────────────────────────────────────────────┐
│                                                 │
│             🎉 CONCERT SAVED! 🎉                │
│                                                 │
│          "All members rescued!"                  │
│                                                 │
│   ┌─────────────────────────────────────┐       │
│   │         Result Card (for sharing)    │       │
│   │                                     │       │
│   │   [MV Thumbnail] "DDU-DU DDU-DU"   │       │
│   │   BLACKPINK                         │       │
│   │                                     │       │
│   │   Rescue Order:                     │       │
│   │   1st Rose ⭐  2nd Lisa             │       │
│   │   3rd Jisoo     4th Jennie           │       │
│   │                                     │       │
│   │   Clear Time: 3m 05s               │       │
│   │   Time Remaining: 25s              │       │
│   └─────────────────────────────────────┘       │
│                                                 │
│   [ 🐦 Share on X ] [ 📸 Instagram ] [ 💬 KakaoTalk ]│
│                                                 │
│   [ 🔄 Try Again ]     [ 🏠 Play Another MV ]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 7b. Game Over (Failure)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              💔 TIME OVER 💔                     │
│                                                 │
│          "The song ended... The members          │
│           are still trapped in the MV!"          │
│                                                 │
│          Rescued: 2/4                            │
│          ✅ Rose  ✅ Lisa  🔒 Jisoo  🔒 Jennie   │
│                                                 │
│   [ 🔄 Try Again ]     [ 🏠 Play Another MV ]   │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Components

| Component | Description |
|-----------|-------------|
| Result Title | Success/failure message + effects |
| Result Card | Shareable image card (MV thumbnail + rescue order + time) |
| Share Buttons | X, Instagram, KakaoTalk share |
| Action Buttons | "Try Again" / "Play Another MV" |

---

## 8. Responsive Layout (Mobile First)

Mobile-first design (considering high smartphone usage among teens).

### Mobile (< 768px)

```
┌──────────────────────┐
│ ♪ 3:12  🔒🔒✅🔒     │  ← Compact Header
├──────────────────────┤
│                      │
│   2D Pixel World     │  ← Touch joystick controls
│   (Fullscreen)       │
│                      │
│         🧑            │
│                      │
│                      │
├──────────────────────┤
│  🕹️ Virtual Joystick  │  ← Touch Controls
│        [E]           │
└──────────────────────┘
```

### Desktop (>= 768px)

```
┌─────────────────────────────────────────────────┐
│ ♪ 3:12 ████░░░  [🔒Jennie][🔒Jisoo][✅Rose][🔒Lisa]│
├─────────────────────────────────────────────────┤
│                                                 │
│              2D Pixel World                      │
│              (Keyboard WASD controls)            │
│                                                 │
│                    🧑                             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Input Methods

| Platform | Movement | Interaction |
|----------|----------|-------------|
| Desktop | WASD / Arrow keys | E key / Click |
| Mobile | Virtual joystick (bottom-left) | Action button (bottom-right) / Tap |

---

## 9. Design Tokens

| Token | Value | Usage |
|-------|-------|-------|
| Font (UI) | `"Press Start 2P"`, `"DungGeunMo"` | Pixel font (titles, buttons) |
| Font (Chat) | `"Pretendard"`, `sans-serif` | Chat message readability |
| Color - Primary | `#FF6B9D` | Main pink (K-pop aesthetic) |
| Color - Background | `#0D0D2B` | Dark navy (game background) |
| Color - Success | `#4ECDC4` | Rescue success |
| Color - Danger | `#FF6B6B` | Timer danger, game over |
| Color - Warning | `#FFE66D` | Timer warning |
| Pixel Scale | 4x | Pixel art rendering scale |
| Animation | `framer-motion` | Overlay slides, transition effects |
