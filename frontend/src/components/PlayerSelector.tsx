import { motion } from "framer-motion";
import { useAppStore } from "../store/appStore";

const PlayerSelector = () => {
  const { players, activePlayer, setActivePlayer, toggleDyslexiaMode, dyslexiaMode } =
    useAppStore();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Who is playing today?</h2>
        <p className="text-sm text-slate-600">Tap your avatar to start learning.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {players.map((player) => (
          <motion.button
            key={player.id}
            type="button"
            onClick={() => setActivePlayer(player)}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={`flex min-w-[150px] flex-col items-center gap-2 rounded-[26px] border-4 px-5 py-4 text-lg font-bold shadow-lg shadow-slate-200 transition-all ${
              activePlayer?.id === player.id
                ? "border-accent bg-white drop-shadow-bubbly"
                : "border-transparent bg-white/70 hover:bg-white"
            }`}
          >
            <div
              className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-secondary/80 via-white to-primary/70 text-3xl text-primary shadow-inner"
              aria-hidden
            >
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <span className="font-extrabold">{player.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            {player.name}
          </motion.button>
        ))}
      </div>
      <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-lavender/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
        <input type="checkbox" checked={dyslexiaMode} onChange={toggleDyslexiaMode} />
        Dyslexia-friendly font
      </label>
    </div>
  );
};

export default PlayerSelector;
