# Game Integration Guide

This guide shows you how to add player tracking to any game in the app.

## Quick Start (5 minutes per game)

### Step 1: Import the Hook

```typescript
import { useGameTracking } from "../hooks/useGameTracking";
```

### Step 2: Initialize in Your Component

```typescript
const YourGame = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer, trackAudioReplay } = useGameTracking({
    gameId: "your-game-id" // Use the game's route ID
  });
  
  // ... rest of your component
};
```

### Step 3: Track Words When They Appear

```typescript
// Option A: Track when words are loaded
useEffect(() => {
  words.forEach((word) => {
    void trackWordSeen(word.id);
  });
}, [words, trackWordSeen]);

// Option B: Track when a specific word is shown
useEffect(() => {
  if (currentWord) {
    void trackWordSeen(currentWord.id);
  }
}, [currentWord, trackWordSeen]);
```

### Step 4: Track Correct Answers

```typescript
const handleCorrectAnswer = (wordId: string) => {
  // Your existing success logic
  playSuccessTone();
  setScore((prev) => prev + 1);
  
  // Add tracking
  void trackCorrectAnswer(wordId);
};
```

### Step 5: Track Audio Replays

```typescript
const handlePlayAudio = (wordId: string, audioUrl?: string) => {
  playSound(audioUrl);
  
  // Add tracking
  void trackAudioReplay(wordId);
};
```

## Game-Specific Examples

### LittleExplorer (Sentence Building)

```typescript
const LittleExplorer = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer } = useGameTracking({
    gameId: "little-explorer"
  });

  // Track words when sentence is generated
  useEffect(() => {
    if (currentSentence) {
      currentSentence.words.forEach((word) => {
        void trackWordSeen(word.id);
      });
    }
  }, [currentSentence, trackWordSeen]);

  // Track when sentence is completed correctly
  const handleComplete = () => {
    if (isCorrect) {
      currentSentence.words.forEach((word) => {
        void trackCorrectAnswer(word.id);
      });
    }
  };
};
```

### RaceSpell (Letter Collection)

```typescript
const RaceSpell = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer } = useGameTracking({
    gameId: "race-spell"
  });

  // Track word when race starts
  useEffect(() => {
    if (currentWord) {
      void trackWordSeen(currentWord.id);
    }
  }, [currentWord, trackWordSeen]);

  // Track when word is completed
  const handleWordComplete = (wordId: string) => {
    void trackCorrectAnswer(wordId);
    // ... rest of completion logic
  };
};
```

### BubbleBounceBrigade (Letter Popping)

```typescript
const BubbleBounceBrigade = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer } = useGameTracking({
    gameId: "bubble-bounce-brigade"
  });

  // Track word when puzzle starts
  useEffect(() => {
    if (currentPuzzle) {
      void trackWordSeen(currentPuzzle.wordId);
    }
  }, [currentPuzzle, trackWordSeen]);

  // Track correct letter pop
  const handleCorrectPop = (wordId: string) => {
    if (isWordComplete) {
      void trackCorrectAnswer(wordId);
    }
  };
};
```

### LuminousMazeEscape (Maze Navigation)

```typescript
const LuminousMazeEscape = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer } = useGameTracking({
    gameId: "luminous-maze-escape"
  });

  // Track word when maze starts
  useEffect(() => {
    if (currentRound) {
      void trackWordSeen(currentRound.word.id);
    }
  }, [currentRound, trackWordSeen]);

  // Track when all letters collected
  const handleMazeComplete = (wordId: string) => {
    void trackCorrectAnswer(wordId);
    // ... rest of completion logic
  };
};
```

### PrismTrailChase (Lane Switching)

```typescript
const PrismTrailChase = () => {
  const { words } = useAppStore();
  const { trackWordSeen, trackCorrectAnswer } = useGameTracking({
    gameId: "prism-trail-chase"
  });

  // Track word when round starts
  useEffect(() => {
    if (currentRound) {
      void trackWordSeen(currentRound.word.id);
    }
  }, [currentRound, trackWordSeen]);

  // Track when all segments collected
  const handleSegmentCollected = (wordId: string, isComplete: boolean) => {
    if (isComplete) {
      void trackCorrectAnswer(wordId);
    }
  };
};
```

## Common Patterns

### Pattern 1: Single Word Per Round

```typescript
// Track when round changes
useEffect(() => {
  if (currentWord) {
    void trackWordSeen(currentWord.id);
  }
}, [currentWord, trackWordSeen]);

// Track on correct answer
const handleCorrect = () => {
  void trackCorrectAnswer(currentWord.id);
};
```

### Pattern 2: Multiple Words Visible

```typescript
// Track all visible words
useEffect(() => {
  visibleWords.forEach((word) => {
    void trackWordSeen(word.id);
  });
}, [visibleWords, trackWordSeen]);

// Track each correct answer individually
const handleCorrect = (wordId: string) => {
  void trackCorrectAnswer(wordId);
};
```

### Pattern 3: Word with Audio

```typescript
// Track audio replay
const handlePlaySound = (word: Word) => {
  playSound(word.audioUrl, word.text);
  void trackAudioReplay(word.id);
};
```

### Pattern 4: Progressive Word Building

```typescript
// Track word when first letter appears
useEffect(() => {
  if (targetWord && !hasTracked) {
    void trackWordSeen(targetWord.id);
    setHasTracked(true);
  }
}, [targetWord, hasTracked, trackWordSeen]);

// Track only when fully completed
const handleLetterCollected = (wordId: string, progress: number, total: number) => {
  if (progress === total) {
    void trackCorrectAnswer(wordId);
  }
};
```

## Best Practices

### ✅ DO

- Track words as soon as they appear to the player
- Track correct answers only when the player successfully completes the task
- Use `void` keyword to explicitly ignore promise results
- Track audio replays when the player actively clicks to hear the word
- Keep tracking logic separate from game logic

### ❌ DON'T

- Don't track the same word multiple times in the same session (hook handles this)
- Don't track incorrect answers (only successes update progress)
- Don't block game logic waiting for tracking to complete
- Don't track words that are just decorative or not part of learning

## Testing Your Integration

### 1. Visual Test

1. Start the game
2. Play through one round
3. Go to Admin Dashboard → Player Progress
4. Verify the word appears in "Words Practiced"
5. Play again and answer correctly
6. Verify the correct count increases

### 2. Console Test

Open browser console and check for:
- No tracking errors
- Session started message
- Word seen events
- Correct answer events

### 3. Database Test

```bash
# Check progress table
psql -d english_game -c "SELECT * FROM progress WHERE player_id = '<player-id>';"

# Check sessions table
psql -d english_game -c "SELECT * FROM sessions WHERE player_id = '<player-id>' ORDER BY started_at DESC LIMIT 5;"

# Check analytics events
psql -d english_game -c "SELECT * FROM analytics_events WHERE player_id = '<player-id>' ORDER BY timestamp DESC LIMIT 10;"
```

## Troubleshooting

### Tracking Not Working

1. **Check if player is selected**: Tracking only works when `activePlayer` is set
2. **Check console for errors**: Look for API errors or network issues
3. **Verify backend is running**: Make sure the API server is accessible
4. **Check database connection**: Ensure migrations have been run

### Duplicate Tracking

The hook automatically prevents duplicate `word_seen` events for the same word in the same session. If you're seeing duplicates:

1. Make sure you're not calling `trackWordSeen` multiple times unnecessarily
2. Check that you're using the same `wordId` consistently

### Progress Not Updating

1. Verify `trackCorrectAnswer` is being called
2. Check that the `wordId` matches the word in the database
3. Look for API errors in the console
4. Verify the progress API endpoint is working: `GET /api/progress/:playerId`

## Game ID Reference

Use these exact IDs for the `gameId` parameter:

- `flash-garden` - Flash Garden
- `little-explorer` - Little Explorer
- `sound-safari` - Sound Safari
- `race-spell` - Race & Spell
- `sticker-story` - Sticker Story
- `giggle-goo-kitchen` - Giggle Goo Kitchen
- `bubble-bounce-brigade` - Bubble Bounce Brigade
- `balloon-band-jam` - Balloon Band Jam
- `mystery-picnic-parade` - Mystery Picnic Parade
- `rocket-rescue-relay` - Rocket Rescue Relay
- `luminous-maze-escape` - Luminous Maze Escape
- `prism-trail-chase` - Prism Trail Chase

## Need Help?

See [PLAYER_SYSTEM.md](PLAYER_SYSTEM.md) for system architecture and [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md) for implementation details.
