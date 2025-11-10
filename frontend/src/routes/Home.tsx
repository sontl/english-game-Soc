import { Link } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import GameCard from "../components/GameCard";
import PlayerSelector from "../components/PlayerSelector";
import WeekSelector from "../components/WeekSelector";

const games = [
  {
    id: "flash-garden",
    title: "Flash Garden",
    description: "Match words, sounds, and pictures to grow flowers"
  },
  {
    id: "little-explorer",
    title: "Little Explorer",
    description: "Drag and drop words to build friendly sentences"
  },
  {
    id: "sound-safari",
    title: "Sound Safari",
    description: "Listen carefully and tap the right picture"
  },
  {
    id: "race-spell",
    title: "Race & Spell",
    description: "Collect letters in order to zoom ahead"
  },
  {
    id: "sticker-story",
    title: "Sticker Story",
    description: "Create a scene and record your story"
  }
];

const Home = () => {
  const { words, loading } = useAppStore();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <section className="grid gap-4 rounded-3xl bg-white/90 p-4 shadow-lg md:grid-cols-2">
        <PlayerSelector />
        <WeekSelector />
      </section>

      <section className="rounded-3xl bg-white/90 p-4 shadow-lg">
        <h2 className="text-xl font-bold">This week&apos;s words</h2>
        {loading ? (
          <p>Loading words...</p>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            {words.map((word) => (
              <span
                key={word.id}
                className="rounded-full bg-accent/20 px-4 py-2 text-base font-semibold"
              >
                {word.text}
              </span>
            ))}
            {words.length === 0 && (
              <span className="text-sm text-slate-600">
                Add words in the admin dashboard to start playing.
              </span>
            )}
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <Link key={game.id} to={`/games/${game.id}`}>
            <GameCard title={game.title} description={game.description} />
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Home;
