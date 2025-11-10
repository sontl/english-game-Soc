import { readFile } from "fs/promises";
import { join } from "path";
import { upsertWordsBulk } from "../repositories/wordsRepository";
import { getConnection } from "../db/knex";

async function seedWords() {
  try {
    console.log("🌱 Starting database seed...");

    // Read the sample words file
    const filePath = join(process.cwd(), "../frontend/public/words.sample.json");
    const fileContent = await readFile(filePath, "utf-8");
    const data = JSON.parse(fileContent);

    console.log(`📖 Found ${data.words.length} words in sample file`);

    // Clean up the data - convert empty strings to undefined for URL fields
    const cleanedWords = data.words.map((word: any) => ({
      ...word,
      audioUrl: word.audioUrl || undefined,
      imageUrl: word.imageUrl || undefined,
      exampleSentence: word.exampleSentence || undefined
    }));

    // Insert words using the bulk upsert
    const result = await upsertWordsBulk({ words: cleanedWords });

    console.log(`✅ Successfully seeded ${result.length} words to the database`);

    // Close the database connection
    await getConnection().destroy();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    await getConnection().destroy();
    process.exit(1);
  }
}

seedWords();
