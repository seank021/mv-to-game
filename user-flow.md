# MV Escape — User Flow

## Overview

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Landing  │───→│ Loading  │───→│  Stage   │◄──→│  Room    │───→│  Result  │
│  Page    │    │ (Cutscene)│    │  Map     │    │  View    │    │  Screen  │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │                               │               │               │
     │                          Stage            ┌────┴────┐          │
     │                          Silhouettes      │ Overlays│          │
     │                          (convert to      ├─────────┤          │
     │                          pixel on rescue) │ Chat    │          │
     │                               │           │ Quiz    │          │
     │                               │           │ Object  │          │
     │                               │           └─────────┘          │
     │                               │                               │
     └───────────────────────────────┴───────────────────────────────┘
                                   Play again
```

---

## Flow 1: Landing → Start Analysis

```
User enters
  │
  ▼
┌─────────────────┐
│  Landing Page   │
│  URL input shown│
└────────┬────────┘
         │
         ▼
    Paste YouTube URL
         │
         ▼
  ┌──────────────┐     ┌──────────────────┐
  │ Valid URL?    │──N──│ Error message     │
  │              │     │ "Please enter a   │
  └──────┬───────┘     │  valid URL"       │
         │Y            └──────┬───────────┘
         ▼                    │
  Start button       ◄───────┘
  activated
         │
         ▼
  Start button clicked
         │
         ▼
  Transition to
  Loading (Cutscene)
```

### URL Validation Rules

| Check | Condition | Error Message |
|-------|-----------|---------------|
| Empty | No input value | "Please enter a YouTube URL" |
| Format | Not youtube.com/watch or youtu.be format | "Please enter a valid YouTube URL" |
| Accessible | Video is private or deleted | "Cannot access this video" |
| Music Video | Not a music video (future) | "Only music video URLs are supported" |

---

## Flow 2: Loading (Cutscene) — Analysis & World Entry

Player = Agency CEO/Manager. An emergency occurs right before the concert.

```
Analysis starts
  │
  ├─────────────────────────────────────┐
  │ (Background: Pipeline execution)    │
  │                                     │
  │  Step 1. Download video/audio       │
  │  Step 2. Search artist/member info  │
  │  Step 3. Scene change detection     │
  │          & background extraction    │
  │  Step 4. Storyline analysis         │
  │          (Vision LLM)               │
  │  Step 5. Object detection           │
  │  Step 6. Room generation            │
  │          (based on member count)    │
  │  Step 7. 2D pixel art conversion    │
  │  Step 8. Auto quiz generation       │
  │  Step 9. Chat prompt generation     │
  │  Step 10. Audio analysis            │
  │           (BPM, duration)           │
  │  Step 11. World map assembly        │
  │                                     │
  ├─────────────────────────────────────┘
  │
  │ (Frontend: Cutscene playback)
  ▼
┌──────────────────────────────────────────────┐
│ Cutscene — dialogue format,                  │
│ displayed sequentially with typing animation │
│                                              │
│ [Pixel concert stage scene, audience cheering]│
│ 1. "Today is finally concert day!"           │
│                                              │
│ [📱 The phone rings]                         │
│ 2. "Boss!! We have a huge problem!!"         │
│ 3. "The concert just started but...          │
│     the members got trapped inside           │
│     the music video?!?!?!"                   │
│                                              │
│ [Member silhouettes disappear one by one]    │
│ 4. "Right now we're just playing the title   │
│     track on stage to buy time..."           │
│ 5. "You need to go into the music video      │
│     yourself and rescue them!!"              │
│ 6. "You have to rescue everyone before       │
│     the song ends to save the concert!!!"    │
│                                              │
│ [Animation of player diving into the screen] │
└──────────┬───────────────────────────────────┘
           │
           ▼
    Check if analysis complete
           │
     ┌─────┴─────┐
     │Y          │N
     ▼           ▼
  Auto-transition  Cutscene loop wait
  to Stage Map     (additional animation or
                    "Almost done!" display)
                     │
                     ▼
                 On analysis complete,
                 transition to Stage Map
```

### Loading States

| State | UI Feedback |
|-------|-------------|
| Downloading | "Fetching the video..." |
| Analyzing | "Analyzing the MV..." |
| Generating | "Creating the MV world..." |
| Almost Done | "Almost done! Getting ready..." |
| Error | "An error occurred during analysis" + retry button |

### Error Handling

```
Analysis failed
  │
  ▼
┌──────────────────────┐
│ Determine error type  │
└──────┬───────────────┘
       │
  ┌────┼────────────────┐
  │    │                │
  ▼    ▼                ▼
Download  Analysis     Server
failed    failed       error
  │    │                │
  ▼    ▼                ▼
"Cannot  "This MV is   "Please try
 fetch    difficult     again
 the      to analyze"   later"
 video"
  │    │                │
  └────┴────────────────┘
       │
       ▼
  [ 🔄 Retry ]  [ 🏠 Back to Home ]
```

---

## Flow 3: Game — Stage Map & Room Exploration & Member Rescue

### 3.1 Game Start

```
Cutscene ends
  │
  ▼
┌────────────────────────────────┐
│ Initialization                  │
│ - Start title track BGM         │
│ - Start timer countdown         │
│ - Display Stage Map             │
│ - Place all member silhouettes  │
│   on stage                      │
│ - Begin parallel preloading     │
│   of all room data              │
└──────────┬─────────────────────┘
           │
           ▼
    Begin exploration on Stage Map
```

### 3.2 Stage Map Loop (Main Hub)

```
              ┌──────────────────────────────┐
              │                              │
              ▼                              │
      ┌───────────────┐                      │
      │ Stage Map      │                      │
      │ exploration    │                      │
      │ (free movement │                      │
      │  on map)       │                      │
      └──────┬────────┘                      │
             │                               │
             ▼                               │
      Approach a room node                   │
      (select a 🔒 unsolved room)            │
             │                               │
             ▼                               │
      ┌──────────────┐                       │
      │ Check room    │  ← If preloading     │
      │ data loading  │    already complete,  │
      │ status        │    enter immediately  │
      └──────┬───────┘                       │
             │                               │
             ▼                               │
      ┌──────────────┐                       │
      │ Enter room    │                       │
      │ interior      │                       │
      │ (Room View)   │                       │
      └──────┬───────┘                       │
             │                               │
             ▼                               │
      Room exploration loop                  │
      (see 3.3)                              │
             │                               │
        ┌────┴────┐                          │
        │         │                          │
        ▼         ▼                          │
     Member    Return to map                 │
     rescued   (explore other rooms)         │
        │         │                          │
        ▼         │                          │
   Silhouette→    │                          │
   Pixel          │                          │
   transition     │                          │
   (on stage)     │                          │
        │         │                          │
        └────┬────┘                          │
             │                               │
             ▼                               │
      Check if all rescued                   │
             │                               │
       ┌─────┴─────┐                         │
       │Y          │N                        │
       ▼           └─────────────────────────┘
   CLEAR!
   (Full stage glow
    → Clear sequence)
```

### 3.3 Room Exploration Loop

```
      Enter room
           │
           ▼
    ┌──────────────┐
    │ Free movement  │  ◄────────────────────┐
    │ inside room    │                        │
    │ (WASD/touch)   │                        │
    └──────┬───────┘                        │
           │                                │
      ┌────┼────────┐                       │
      │    │        │                       │
      ▼    ▼        ▼                       │
   Exit  Object   Member                    │
   point nearby   found                     │
      │    │        │                       │
      ▼    ▼        ▼                       │
   Return Interaction Chat panel            │
   to map popup     slides up               │
      │    │        │                       │
      │    │        ▼                       │
      │    │   ┌──────────┐                 │
      │    │   │ Member    │                 │
      │    │   │ Chat (LLM)│                 │
      │    │   └────┬─────┘                 │
      │    │        │                       │
      │    │   ┌────┴────┐                  │
      │    │   │         │                  │
      │    │   ▼         ▼                  │
      │    │  Get hint  Take quiz            │
      │    │   │         │                  │
      │    │   │         ▼                  │
      │    │   │    ┌──────────┐            │
      │    │   │    │ Solve     │            │
      │    │   │    │ Quiz      │            │
      │    │   │    └────┬─────┘            │
      │    │   │         │                  │
      │    │   │    ┌────┴────┐             │
      │    │   │    │         │             │
      │    │   │    ▼         ▼             │
      │    │   │  Correct   Wrong           │
      │    │   │    │         │             │
      │    │   │    ▼         ▼             │
      │    │   │  Member    Try again       │
      │    │   │  rescue    or get hint     │
      │    │   │  sequence    │             │
      │    │   │    │         │             │
      │    │   │    ▼         │             │
      │    │   │  Auto-return │             │
      │    │   │  to map      │             │
      │    │   │  + silhouette│             │
      │    │   │  transition  │             │
      │    │   │    │         │             │
      │    └───┴────┴─────────┘             │
      │         │                           │
      │    (continue exploring) ───────────→│
      │                                     │
      ▼
   Return to Stage Map
```

### 3.4 Silhouette Transition Flow (On Member Rescue)

```
Member quiz answered correctly
  │
  ▼
Room interior: Member rescue effect
(member glows and disappears)
  │
  ▼
Auto-return to Stage Map
  │
  ▼
┌──────────────────────────────┐
│ Camera focuses on the rescued │
│ member's silhouette on stage  │
│                              │
│ Silhouette → Pixel art       │
│ transition sequence:         │
│ 1. Silhouette begins to      │
│    brighten                  │
│ 2. Light spreads and color   │
│    fills in                  │
│ 3. Full-color pixel art      │
│    complete!                 │
│ 4. Particle effect +         │
│    cheering SFX              │
└──────────┬───────────────────┘
           │
           ▼
  Resume free map exploration
  (move to next room)
```

### 3.5 Object Interaction

```
Approach an object
  │
  ▼
Interaction hint displayed
"Press E / Tap to examine"
  │
  ▼
Execute interaction
  │
  ▼
┌──────────────────┐
│ Check object type │
└──────┬───────────┘
       │
  ┌────┴────┐
  │         │
  ▼         ▼
Normal     Key
object     object
  │         │
  ▼         ▼
Show       Show description
description + special effect
popup      + linked to
  │         quiz hint
  ▼         │
Close       ▼
           Close
```

### 3.6 Member Chat Detail

```
Approach member → Conversation starts
  │
  ▼
Chat panel slides up
(room background dimmed)
  │
  ▼
Member's first message auto-displayed
"It's so dark in here... Please save me~"
  │
  ├──────────────────────────┐
  │                          │
  ▼                          ▼
Free chat input          Action button selection
(text input → LLM response) │
  │                     ┌──┴──┐
  │                     │     │
  │                     ▼     ▼
  │                  Ask for  Take
  │                  hint     quiz
  │                     │     │
  │                     ▼     ▼
  │                  LLM     Quiz panel
  │                  provides overlay
  │                  hint    displayed
  │                     │     │
  └─────────┬───────────┘     │
            │                 │
            ▼                 │
     Close chat panel ◄───────┘
     (X button or quiz correct)
```

### Chat Message Types

| Type | From | Description |
|------|------|-------------|
| Greeting | Member | Member's initial greeting on first encounter |
| Free Chat | Player → Member | Free text conversation (LLM response) |
| Hint Response | Member | Provides quiz-related clues when hint is requested |
| Quiz Transition | System | "Shall we try the quiz?" transition message |
| Rescue Reaction | Member | Gratitude/joy reaction on successful rescue |

---

## Flow 4: Game End

### 4.1 Clear (Success)

```
Last member rescued (inside room)
  │
  ▼
Room interior: Member rescue effect
  │
  ▼
Auto-return to Stage Map
  │
  ▼
Last silhouette → pixel art transition
  │
  ▼
All rescued check (members.every(rescued))
  │
  ▼
┌──────────────────────────────────┐
│ Stage clear sequence             │
│ (plays on Stage Map)             │
│                                  │
│ 1. Last silhouette → pixel       │
│    transition                    │
│ 2. Full stage glow effect        │
│ 3. All lights turn on at once    │
│ 4. All members strike a pose     │
│    animation                     │
│ 5. Audience cheering effect      │
│    + SFX                         │
│ 6. "CONCERT SAVED!" title        │
│    appears                       │
│ 7. BGM transitions to climax     │
│    section                       │
└──────────┬───────────────────────┘
           │
           ▼ (after 2~3 seconds)
  Result Screen (Success)
  - Result card generated
  - Rescue order displayed
  - Clear time displayed
  - SNS share buttons
```

### 4.2 Game Over (Failure)

```
Timer = 0:00
  │
  ▼
BGM ends (song is over)
  │
  ▼
┌──────────────────────┐
│ Game over sequence     │
│ - Screen dims          │
│ - "TIME OVER" title    │
│ - Show unrescued       │
│   members              │
└──────────┬───────────┘
           │
           ▼
  Result Screen (Failure)
  - Rescued count / total members
  - Try again button
```

### 4.3 Result Screen Actions

```
Result Screen
  │
  ├───────────────┬────────────────┐
  │               │                │
  ▼               ▼                ▼
SNS Share      Try Again        Another MV
  │               │                │
  ▼               ▼                ▼
Generate       Restart same     Go to
share card     MV game          Landing
image +                         Page
auto text
  │
  ├─────┬─────┐
  │     │     │
  ▼     ▼     ▼
  X   Insta  KakaoTalk
share share  share
```

### Share Text Template

```
Rescued all members at the [MV name] concert in [Xm Ys]! 🎵🚪
I saved [first rescued member] first!
Try it yourself → [game link]
```

---

## Flow 5: Timer & BGM Sync

The timer/BGM system runs throughout the entire game.

```
Game starts
  │
  ▼
┌─────────────────────────────────────────┐
│ BGM playback starts (YouTube MV audio)   │
│ Timer starts (duration_seconds countdown)│
└──────────┬──────────────────────────────┘
           │
           ▼
    ┌──────────────┐
    │ Timer > 60s  │ ──→ Normal state (white)
    │ Timer 30~60s │ ──→ Warning state (yellow blink)
    │ Timer < 30s  │ ──→ Critical state (red blink + SFX)
    │ Timer = 0    │ ──→ Game Over trigger
    └──────────────┘
           │
    (Timer continues during chat/quiz)
           │
           ▼
    Timer never pauses
    (maintaining tension is key)
```

---

## Flow 6: Difficulty Variations

Flow differences based on difficulty.

```
┌──────────┬──────────────┬──────────────┬──────────────┐
│ Element  │ Easy         │ Normal       │ Hard         │
├──────────┼──────────────┼──────────────┼──────────────┤
│ Quiz     │ 4-choice     │ Mixed choice │ Free-form    │
│          │ multiple     │ + short      │ text input   │
│          │ choice       │ answer       │              │
│ Hints    │ Freely given │ Moderate     │ Minimal      │
│          │ in chat      │              │              │
│ Objects  │ Highlighted  │ Standard     │ Hidden       │
│          │ (sparkle)    │ display      │ (must explore)│
│ Target   │ Casual fans  │ General      │ Core fans    │
│          │              │ K-pop fans   │              │
└──────────┴──────────────┴──────────────┴──────────────┘
```

---

## State Diagram

### Game State Machine

```
                          ┌─────────┐
                          │  IDLE   │ (Landing Page)
                          └────┬────┘
                               │ URL input + start
                               ▼
                          ┌─────────┐
                          │ LOADING │ (Analysis + Cutscene)
                          └────┬────┘
                               │ Analysis complete
                               ▼
                          ┌─────────┐
                    ┌────→│STAGE_MAP│ (Stage Map — Hub)
                    │     └────┬────┘
                    │          │ Select room
                    │          ▼
                    │     ┌─────────┐
                    │ ┌──→│ IN_ROOM │ (Room exploration)
                    │ │   └────┬────┘
                    │ │        │ Member/object interaction
                    │ │        ▼
                    │ │   ┌─────────┐
                    │ │   │INTERACT │ (Chat/Quiz/Object)
                    │ │   └────┬────┘
                    │ │        │ Close (continue exploring)
                    │ └────────┘
                    │          │ Rescue complete or map return
                    │          ▼
                    │     ┌─────────┐
                    │     │SILHOUET │ (Silhouette → pixel
                    │     │_REVEAL  │  transition sequence)
                    │     └────┬────┘
                    │          │
                    └──────────┘
                               │ All rescued or timer expired
                               ▼
                          ┌─────────┐
                          │STAGE_   │ (Stage clear sequence)
                          │CLEAR    │
                          └────┬────┘
                               │
                               ▼
                          ┌─────────┐
                          │ RESULT  │ (Result screen)
                          └────┬────┘
                               │ Try again / Another MV
                               ▼
                        IDLE or LOADING
```

### Member State

```
  TRAPPED ──(quiz correct)──→ RESCUED ──→ ON_STAGE
    🔒                          ✅          🧍✨
  (trapped in room)         (freed from   (silhouette→pixel,
                             room)         returned to stage)
```

### Silhouette State

```
  SILHOUETTE ──(member rescued)──→ PIXEL_ART ──(all rescued)──→ STAGE_GLOW
    (black shadow)                  (full color + particles)     (entire stage glows)
```

### Timer State

```
  RUNNING ──(>60s)──→ NORMAL
          ──(30~60s)──→ WARNING
          ──(<30s)──→ CRITICAL
          ──(=0)──→ EXPIRED → Game Over
```

---

## Data Flow

### Pipeline → Game Engine

```
YouTube URL
    │
    ▼
[Backend Pipeline]
    │
    ▼
GameData JSON ─────────────────────────────────┐
  │                                             │
  ├── mv_id, title, artist                      │
  ├── audio_url, duration_seconds, bpm          │
  ├── map                                       │
  │    ├── zones[]                              │
  │    │    ├── zone_id, member_name            │
  │    │    ├── background_pixel_art_url        │
  │    │    ├── width, height                   │
  │    │    ├── connections[]                    │
  │    │    ├── member_position {x, y}          │
  │    │    └── object_positions[]              │
  │    ├── spawn_zone                           │
  │    └── player_start_position {x, y}         │
  └── members[]                                │
       ├── name, pixel_avatar_url              │
       └── room                                │
            ├── storyline                      │
            ├── background_pixel_art_url       │
            ├── objects[]                      │
            ├── quiz {question, options, answer}│
            └── chat_persona_prompt            │
                                               │
    [Game Engine] ◄────────────────────────────┘
```

### Game Engine → Result

```
[Game Engine]
    │
    ▼
GameResult JSON
  ├── game_id
  ├── mv_id
  └── result
       ├── is_cleared (bool)
       ├── total_time_seconds
       ├── remaining_seconds
       ├── rescue_order[] (member name array)
       └── per_room_stats[]
            ├── member
            ├── time_seconds
            ├── chat_messages
            └── hints_used
```

---

## Edge Cases

| Scenario | Handling |
|----------|----------|
| Very short song (<2 min) | Auto-reduce room count / quiz difficulty |
| Very long song (>5 min) | Auto-increase room count / quiz difficulty |
| Solo artist (1 member) | 1 room, 2~3 quizzes |
| Large group (>7 members) | Cap at 6 rooms, group members together |
| Network disconnection | Provide offline hints on chat failure, game continues |
| Browser tab switch | Timer continues (syncs on page return) |
| Mobile phone call | Timer continues |
| Chat API delay | Show typing indicator, fallback to default response on timeout |
| MV analysis failure | Fallback to default template + notify user |
| Member search failure | Provide manual user input fallback |
