import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";
import GameCard from "../components/GameCard";
import PlayerSelector from "../components/PlayerSelector";
import WeekSelector from "../components/WeekSelector";

const games = [
  {
    id: "flash-garden",
    title: "Flash Garden",
    description: "Match words, sounds, and pictures to grow flowers",
    image: "/assets/games/flash-garden.svg",
    gradient: "from-rose-100 via-rose-50 to-amber-100",
    accentColor: "#ec407a",
    badge: "Grow a bloom"
  },
  {
    id: "little-explorer",
    title: "Little Explorer",
    description: "Drag and drop words to build friendly sentences",
    image: "/assets/games/little-explorer.svg",
    gradient: "from-amber-100 via-sky-100 to-white",
    accentColor: "#f06292",
    badge: "Set off on a quest"
  },
  {
    id: "sound-safari",
    title: "Sound Safari",
    description: "Listen carefully and tap the right picture",
    image: "/assets/games/sound-safari.svg",
    gradient: "from-sky-100 via-white to-indigo-100",
    accentColor: "#536dfe",
    badge: "Follow the beat"
  },
  {
    id: "race-spell",
    title: "Race & Spell",
    description: "Collect letters in order to zoom ahead",
    image: "/assets/games/race-spell.svg",
    gradient: "from-orange-100 via-rose-100 to-white",
    accentColor: "#ff7043",
    badge: "Zoom to the finish"
  },
  {
    id: "sticker-story",
    title: "Sticker Story",
    description: "Create a scene and record your story",
    image: "/assets/games/sticker-story.svg",
    gradient: "from-purple-100 via-lavender to-white",
    accentColor: "#8c9eff",
    badge: "Craft a tale"
  }
];

const Home = () => {
  const { words, loading } = useAppStore();

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 pb-10">
      <motion.section
        className="grid gap-8 rounded-[32px] bg-white/80 p-6 shadow-2xl shadow-primary/20 backdrop-blur md:grid-cols-[1.2fr_1fr] md:p-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="flex flex-col justify-center gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            🌼 Word adventures bloom here
          </span>
          <h2 className="text-3xl font-extrabold text-slate-800 md:text-4xl">
            Playful learning journeys for curious young readers
          </h2>
          <p className="text-base text-slate-600 md:text-lg">
            Choose your explorer, unlock weekly word gardens, and dive into games that sparkle
            with color, music, and imagination.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="#games"
              className="rounded-full bg-primary px-6 py-3 text-base font-bold text-white shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:shadow-primary/40"
            >
              Browse games
            </a>
            <Link
              to="/admin"
              className="rounded-full border-2 border-primary px-6 py-3 text-base font-bold text-primary transition-transform duration-300 hover:-translate-y-1"
            >
              Parent dashboard
            </Link>
          </div>
        </div>
        <div className="relative flex items-center justify-center">
          <motion.img
            src="/assets/games/flash-garden.svg"
            alt="Illustration of a blooming flower"
            className="z-10 w-48 drop-shadow-glow md:w-56"
            initial={{ rotate: -6, scale: 0.9 }}
            animate={{ rotate: 6, scale: 1 }}
            transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.img
            src="/assets/decor/star.svg"
            alt="Decorative star"
            className="absolute left-6 top-6 w-12"
            initial={{ scale: 0.8, opacity: 0.4 }}
            animate={{ scale: 1.1, opacity: 1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
          <motion.img
            src="/assets/decor/cloud-1.svg"
            alt="Soft cloud"
            className="absolute -right-4 bottom-2 w-40"
            initial={{ y: 10 }}
            animate={{ y: -10 }}
            transition={{ duration: 9, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          />
        </div>
      </motion.section>

      <motion.section
        className="grid gap-6 rounded-[32px] bg-white/80 p-6 shadow-2xl shadow-accent/20 backdrop-blur md:grid-cols-2 md:p-10"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
      >
        <PlayerSelector />
        <WeekSelector />
      </motion.section>

      <motion.section
        className="rounded-[32px] bg-white/80 p-6 shadow-2xl shadow-secondary/30 backdrop-blur"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-2xl font-extrabold text-slate-800">This week&apos;s sparkle words</h3>
          <span className="rounded-full bg-accent/15 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
            Week pack ready
          </span>
        </div>
        {loading ? (
          <p className="mt-4 text-base text-slate-600">Loading words...</p>
        ) : (
          <div className="mt-4 flex flex-wrap gap-3">
            {words.map((word) => (
              <motion.span
                key={word.id}
                className="rounded-full bg-gradient-to-r from-lavender/60 via-white to-mint/60 px-4 py-2 text-base font-bold text-slate-700 shadow-inner"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
              >
                {word.text}
              </motion.span>
            ))}
            {words.length === 0 && (
              <span className="text-sm text-slate-600">
                Add words in the admin dashboard to start playing.
              </span>
            )}
          </div>
        )}
      </motion.section>

      <motion.section
        id="games"
        className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
      >
        {games.map((game, index) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <Link to={`/games/${game.id}`} className="block focus:outline-none focus-visible:ring-4 focus-visible:ring-accent/50 focus-visible:ring-offset-4">
              <GameCard
                title={game.title}
                description={game.description}
                image={game.image}
                gradient={game.gradient}
                accentColor={game.accentColor}
                badge={game.badge}
              />
            </Link>
          </motion.div>
        ))}
      </motion.section>
    </div>
  );
};

export default Home;
