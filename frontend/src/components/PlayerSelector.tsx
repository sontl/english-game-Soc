import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../store/appStore";

const PlayerSelector = () => {
  const {
    players,
    activePlayer,
    setActivePlayer,
    toggleDyslexiaMode,
    dyslexiaMode,
    addPlayer,
    updatePlayerInfo,
    removePlayer
  } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [editPlayerName, setEditPlayerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addPlayer(newPlayerName.trim());
      setNewPlayerName("");
      setShowAddForm(false);
    } catch (error) {
      alert("Failed to add player. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPlayer = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!editPlayerName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await updatePlayerInfo(id, editPlayerName.trim());
      setEditingId(null);
      setEditPlayerName("");
    } catch (error) {
      alert("Failed to update player. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePlayer = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return;

    try {
      await removePlayer(id);
    } catch (error) {
      alert("Failed to remove player. Please try again.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold">Who is playing today?</h2>
        <p className="text-sm text-slate-600">Tap your avatar to start learning.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        {players.map((player) => (
          <motion.div
            key={player.id}
            className="relative"
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
          >
            {editingId === player.id ? (
              <form
                onSubmit={(e) => handleEditPlayer(e, player.id)}
                className="flex min-w-[150px] flex-col items-center gap-2 rounded-[26px] border-4 border-primary bg-white px-5 py-4"
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
                    <span className="font-extrabold">{editPlayerName.slice(0, 1).toUpperCase() || player.name.slice(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={editPlayerName}
                  onChange={(e) => setEditPlayerName(e.target.value)}
                  placeholder={player.name}
                  autoFocus
                  maxLength={20}
                  className="w-full rounded-lg border-2 border-slate-200 px-3 py-1 text-center text-sm font-bold focus:border-primary focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!editPlayerName.trim() || isSubmitting}
                    className="rounded-full bg-primary px-3 py-1 text-xs font-bold text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setEditPlayerName("");
                    }}
                    className="rounded-full border-2 border-slate-300 px-3 py-1 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setActivePlayer(player)}
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
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingId(player.id);
                    setEditPlayerName(player.name);
                  }}
                  className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-sm text-white shadow-lg hover:bg-blue-600"
                  title={`Edit ${player.name}`}
                >
                  ✎
                </button>
                {players.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlayer(player.id, player.name);
                    }}
                    className="absolute -right-2 top-8 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-rose-500 text-sm text-white shadow-lg hover:bg-rose-600"
                    title={`Remove ${player.name}`}
                  >
                    ×
                  </button>
                )}
              </>
            )}
          </motion.div>
        ))}

        <AnimatePresence>
          {showAddForm ? (
            <motion.form
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onSubmit={handleAddPlayer}
              className="flex min-w-[150px] flex-col items-center gap-2 rounded-[26px] border-4 border-primary/30 bg-white px-5 py-4"
            >
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Name"
                autoFocus
                maxLength={20}
                className="w-full rounded-lg border-2 border-slate-200 px-3 py-2 text-center text-lg font-bold focus:border-primary focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!newPlayerName.trim() || isSubmitting}
                  className="rounded-full bg-primary px-4 py-1 text-sm font-bold text-white disabled:opacity-50"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewPlayerName("");
                  }}
                  className="rounded-full border-2 border-slate-300 px-4 py-1 text-sm font-bold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              type="button"
              onClick={() => setShowAddForm(true)}
              whileHover={{ y: -6, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              className="flex min-w-[150px] flex-col items-center justify-center gap-2 rounded-[26px] border-4 border-dashed border-primary/40 bg-white/50 px-5 py-4 text-lg font-bold text-primary shadow-lg shadow-slate-200 transition-all hover:border-primary hover:bg-white"
            >
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 text-4xl">
                +
              </div>
              Add Player
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <label className="mt-2 flex w-fit cursor-pointer items-center gap-2 rounded-full bg-lavender/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow-sm">
        <input type="checkbox" checked={dyslexiaMode} onChange={toggleDyslexiaMode} />
        Dyslexia-friendly font
      </label>
    </div>
  );
};

export default PlayerSelector;
