# Quick Start Guide

## First Time Setup

### 1. Start the Backend

```bash
npm run dev --workspace @english-game/backend
```

The backend will start on `http://localhost:4000`

### 2. Start the Frontend

```bash
npm run dev --workspace @english-game/frontend
```

The frontend will start on `http://localhost:5173`

### 3. Create Your First Player

1. Open `http://localhost:5173` in your browser
2. On the home page, find "Who is playing today?" section
3. Click the **"+ Add Player"** button
4. Enter your child's name (e.g., "Emma")
5. Click **"Add"**

**Important**: The default players (Mai and Liam) are placeholders and don't exist in the database. Create your own players to save progress!

### 4. Add Some Words

1. Click **"Parent dashboard"** in the top navigation
2. Scroll to "Add a new word" section
3. Fill in:
   - **Text**: The word (e.g., "cat")
   - **Transcription**: Pronunciation (e.g., "/kæt/")
   - **Example**: A sentence (e.g., "The cat is sleeping")
   - **Level**: Week number (default: 104)
   - **Part of Speech**: Select from dropdown
4. Click **"Add word"**

Or use the **Sample Words Manager** at the bottom to quickly add pre-made words.

### 5. Play a Game

1. Go back to the home page
2. Select your player
3. Scroll down to "Browse games"
4. Click on **"Flash Garden"** or **"Sound Safari"** (these have tracking enabled)
5. Play the game!

### 6. View Progress

1. Go to **"Parent dashboard"**
2. Scroll to **"Player Progress"** section
3. See which words your child has practiced and mastered

## Understanding Default Players

The app comes with two default players (Mai and Liam) for demonstration purposes. These are **placeholder profiles** that:

- ✅ Can be selected to play games
- ✅ Allow you to test the app immediately
- ❌ Cannot be edited or deleted
- ❌ Do not save progress to the database

**To save progress**, create your own players using the "+ Add Player" button!

## Troubleshooting

### "Failed to update player" Error

This happens when trying to edit default players (Mai or Liam). Solution:
1. Create a new player with the "+ Add Player" button
2. Use your custom player instead

### No Words Available

If games show "Add words to start playing":
1. Go to Parent Dashboard
2. Add words manually or use Sample Words Manager
3. Return to home page and play

### Progress Not Showing

Make sure you:
1. Created your own player (not using Mai or Liam)
2. Played Flash Garden or Sound Safari (other games don't have tracking yet)
3. Answered questions correctly
4. Refreshed the Admin Dashboard

### Backend Connection Error

If you see "Failed to fetch" errors:
1. Make sure backend is running: `npm run dev --workspace @english-game/backend`
2. Check backend is on `http://localhost:4000`
3. Check frontend `.env.local` has: `VITE_API_BASE_URL=http://localhost:4000/api`

## Next Steps

- **Add more games**: Follow [GAME_INTEGRATION_GUIDE.md](GAME_INTEGRATION_GUIDE.md) to add tracking to other games
- **Customize words**: Add your own word lists in the Admin Dashboard
- **Multiple children**: Create a player profile for each child
- **View analytics**: Check the Player Progress section to see learning patterns

## Database Setup (First Time Only)

If you haven't run migrations yet:

```bash
npm run knex --workspace @english-game/backend migrate:latest
```

This creates all the necessary database tables.

## Environment Variables

### Backend (`.env` or `backend/.env`)

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/english_game
```

### Frontend (`frontend/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

## Need Help?

- **System Architecture**: See [PLAYER_SYSTEM.md](PLAYER_SYSTEM.md)
- **Integration Details**: See [INTEGRATION_SUMMARY.md](INTEGRATION_SUMMARY.md)
- **Game Integration**: See [GAME_INTEGRATION_GUIDE.md](GAME_INTEGRATION_GUIDE.md)
- **Full Documentation**: See [README.md](README.md)
