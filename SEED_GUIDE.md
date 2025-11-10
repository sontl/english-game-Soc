# Database Seeding Guide

This guide explains how to seed your database with the sample words from `frontend/public/words.sample.json`.

## Methods

### Method 1: Using the Admin Dashboard (Frontend)

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Navigate to the Admin Dashboard at `http://localhost:5173/admin`

4. At the top of the page, you'll see a "Database Seed" section

5. Click the "Seed Database" button

6. The system will:
   - Load the words from `words.sample.json`
   - Send them to the backend API
   - Insert/update them in the database using upsert (existing words will be updated)

7. You'll see a success message showing how many words were seeded

### Method 2: Using the CLI Script (Backend)

This method is useful for automated deployments or initial setup.

1. Make sure your database is running and configured in `backend/.env`

2. Run the seed script:
   ```bash
   cd backend
   npm run seed
   ```

3. The script will:
   - Read `frontend/public/words.sample.json`
   - Insert all words into the database
   - Show progress in the terminal

## Sample Data

The `words.sample.json` file contains 100 words organized by:
- **Terms**: 1-4 (representing different learning periods)
- **Weeks**: 2-10 (within each term)
- **Levels**: Calculated as `term * 100 + week` (e.g., 104, 105, 202, etc.)

Each word includes:
- `id`: Unique UUID
- `text`: The word itself
- `pos`: Part of speech (noun, verb, adjective, etc.)
- `transcription`: IPA phonetic transcription
- `exampleSentence`: Usage example
- `level`: Week level
- `imageUrl`: Placeholder image URL
- `audioUrl`: Audio file URL (if available)
- `term` & `week`: Organizational metadata

## API Endpoint

The seeding uses the existing bulk upsert endpoint:

```
POST /api/words/bulk
Content-Type: application/json

{
  "words": [
    {
      "id": "uuid",
      "text": "word",
      "pos": "noun",
      ...
    }
  ]
}
```

This endpoint uses **upsert** logic, meaning:
- New words will be inserted
- Existing words (by ID) will be updated
- Safe to run multiple times

## Data Cleaning

The seed functions automatically clean the data before inserting:
- Empty string `audioUrl` values are converted to `undefined`
- Empty string `imageUrl` values are converted to `undefined`
- Empty string `exampleSentence` values are converted to `undefined`

This ensures compatibility with the Zod schema validation which expects valid URLs or undefined values.

## Troubleshooting

### Frontend seed fails
- Check that the backend is running
- Verify `VITE_API_BASE_URL` in `frontend/.env.local`
- Check browser console for errors

### CLI seed fails
- Verify database connection in `backend/.env`
- Ensure `DATABASE_URL` is correct
- Check that migrations have been run: `npm run knex migrate:latest`

### Words not appearing
- Check the week filter in your app
- Verify words were inserted: Query the `words` table directly
- Check that the `level` field matches your week selection logic

### URL validation errors
If you see errors about invalid URLs, ensure your sample data either:
- Has valid URLs (starting with `http://` or `https://`)
- Has empty strings (which will be converted to `undefined`)
- Has `null` or `undefined` values
