import { useState } from "react";
import { seedWordsFromSample } from "../services/api";

export const SeedDatabase = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await seedWordsFromSample();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed database");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <h3 className="text-lg font-semibold mb-2">Database Seed</h3>
      <p className="text-sm text-gray-600 mb-4">
        Import words from words.sample.json into the database
      </p>

      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? "Seeding..." : "Seed Database"}
      </button>

      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <p className="text-green-800">
            ✓ Successfully seeded {result.count} words to the database
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-red-800">✗ {error}</p>
        </div>
      )}
    </div>
  );
};
