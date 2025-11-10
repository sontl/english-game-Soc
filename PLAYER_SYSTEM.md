# Player System Documentation

## Overview

The player system enables **individual learning progress tracking** for each child using the app. Each player has their own profile, and the system tracks their word mastery, practice sessions, and game interactions.

## What Players Are Used For

### 1. **Progress Tracking**
- Tracks how many times each word was answered correctly per player
- Stored in the `progress` table with `player_id`, `word_id`, and `correct_count`
- Enables adaptive learning by identifying which words need more practice

### 2. **Practice Sessions**
- Records when a player starts and ends a learning session
- Stored in the `sessions` table with `player_id`, `started_at`, and `ended_at`
- Useful for tracking engagement and time spent learning

### 3. **Analytics Events**
- Logs detailed game interactions per player:
  - `word_seen` - when a player encounters a word
  - `played_game` - when a player completes a game
  - `replay_audio` - when a player replays word audio
- Stored in the `analytics_events` table
- Enables detailed analysis of learning patterns

### 4. **Adaptive Learning**
- The backend includes an adaptive scheduler (`adaptiveScheduler.ts`)
- Recommends words based on each player's progress
- Prioritizes words that need more practice

## Current Implementation Status

### ✅ Implemented
- Player CRUD operations (Create, Read, Update, Delete)
- Player selection UI on home page
- Backend API routes for players, progress, sessions, and analytics
- Database schema with proper relationships
- Adaptive scheduler service

### ⚠️ Not Yet Integrated
- Games don't track progress (no API calls to update progress)
- Sessions aren't created when players start/end games
- Analytics events aren't logged during gameplay
- Adaptive word selection isn't used in the frontend

## Managing Players

### Using the UI

On the home page, the "Who is playing today?" section allows you to:

1. **Add a player**: Click "+ Add Player", enter a name, click "Add"
2. **Edit a player**: Click the blue pencil (✎) button, change the name, click "Save"
3. **Select a player**: Click on any player avatar to set them as active
4. **Remove a player**: Click the red × button (requires at least 2 players)

### Using the API

**List Players**
```bash
curl http://localhost:4000/api/players
```

**Create Player**
```bash
curl -X POST http://localhost:4000/api/players \
  -H "Content-Type: application/json" \
  -d '{"name": "Emma", "avatarUrl": "https://example.com/avatar.jpg"}'
```

**Update Player**
```bash
curl -X PATCH http://localhost:4000/api/players/<player-id> \
  -H "Content-Type: application/json" \
  -d '{"name": "Emma Smith"}'
```

**Delete Player**
```bash
curl -X DELETE http://localhost:4000/api/players/<player-id>
```

## How to Integrate Progress Tracking in Games

To make games track player progress, you need to:

### 1. Track Word Interactions

When a player answers a word correctly:

```typescript
import { useAppStore } from "../store/appStore";

const MyGame = () => {
  const { activePlayer } = useAppStore();

  const handleCorrectAnswer = async (wordId: string) => {
    if (!activePlayer) return;

    // Update progress
    await fetch(`${API_BASE}/progress`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        playerId: activePlayer.id,
        wordId: wordId,
        correctCount: 1 // increment by 1
      })
    });
  };
};
```

### 2. Log Analytics Events

When a player sees a word or plays a game:

```typescript
const logEvent = async (type: "word_seen" | "played_game" | "replay_audio", data: any) => {
  if (!activePlayer) return;

  await fetch(`${API_BASE}/analytics`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type,
      playerId: activePlayer.id,
      gameId: "flash-garden", // or whatever game
      wordId: data.wordId,
      timestamp: new Date().toISOString()
    })
  });
};
```

### 3. Create Practice Sessions

When a player starts a game:

```typescript
const startSession = async () => {
  if (!activePlayer) return;

  const response = await fetch(`${API_BASE}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId: activePlayer.id,
      startedAt: new Date().toISOString()
    })
  });

  const { session } = await response.json();
  return session.id; // save this to end the session later
};

const endSession = async (sessionId: string) => {
  await fetch(`${API_BASE}/sessions/${sessionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      endedAt: new Date().toISOString()
    })
  });
};
```

### 4. Use Adaptive Word Selection

Instead of random words, get personalized recommendations:

```typescript
const getAdaptiveWords = async (limit: number = 10) => {
  if (!activePlayer) return [];

  const response = await fetch(`${API_BASE}/progress/schedule`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      playerId: activePlayer.id,
      limit
    })
  });

  const { schedule } = await response.json();
  return schedule; // array of word IDs prioritized by need
};
```

## Database Schema

### Players Table
```sql
CREATE TABLE players (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  parent_id UUID NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Progress Table
```sql
CREATE TABLE progress (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  correct_count INTEGER DEFAULT 0,
  last_seen TIMESTAMP,
  UNIQUE(player_id, word_id)
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  player_id UUID REFERENCES players(id),
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP,
  details JSONB
);
```

### Analytics Events Table
```sql
CREATE TABLE analytics_events (
  event_id UUID PRIMARY KEY,
  player_id UUID NOT NULL,
  game_id VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  word_id UUID,
  timestamp TIMESTAMP NOT NULL,
  metadata JSONB
);
```

## Benefits of Player Tracking

1. **Personalized Learning**: Each child gets words tailored to their level
2. **Progress Monitoring**: Parents can see which words their child has mastered
3. **Engagement Tracking**: See how much time each child spends learning
4. **Data-Driven Insights**: Identify which games are most effective
5. **Multi-Child Support**: Multiple children can use the same app with separate progress

## Next Steps

To fully utilize the player system:

1. Add progress tracking to each game (see integration examples above)
2. Create a parent dashboard showing each player's progress
3. Implement session tracking in games
4. Add analytics event logging
5. Use adaptive word selection instead of random words
6. Add progress visualization (charts, badges, achievements)
