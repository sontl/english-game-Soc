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
          <button
            key={player.id}
            type="button"
            onClick={() => setActivePlayer(player)}
            className={`flex min-w-[140px] flex-col items-center rounded-2xl border-4 px-4 py-3 text-lg font-bold shadow transition-all ${
              activePlayer?.id === player.id
                ? "border-accent bg-white"
                : "border-transparent bg-white/70"
            }`}
          >
            <div className="mb-2 h-20 w-20 rounded-full bg-secondary/70" aria-hidden>
              {player.avatarUrl ? (
                <img
                  src={player.avatarUrl}
                  alt={player.name}
                  className="h-full w-full rounded-full object-cover"
                />
              ) : null}
            </div>
            {player.name}
          </button>
        ))}
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={dyslexiaMode} onChange={toggleDyslexiaMode} />
        Dyslexia-friendly font
      </label>
    </div>
  );
};

export default PlayerSelector;
