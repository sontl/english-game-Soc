import { motion } from "framer-motion";
import { useMemo } from "react";
import { useAppStore } from "../store/appStore";

const WeekSelector = () => {
  const { week, setWeek, loading } = useAppStore();

  const weeks = useMemo(() => Array.from({ length: 20 }, (_v, i) => i + 1), []);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-bold">Choose your week</h2>
        <p className="text-sm text-slate-600">
          Each week has a themed word pack and background.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {weeks.map((value) => (
          <motion.button
            key={value}
            type="button"
            disabled={loading}
            onClick={() => {
              void setWeek(value);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className={`rounded-full px-4 py-2 text-base font-semibold shadow transition-all ${
              value === week
                ? "bg-accent text-white shadow-lg shadow-accent/30"
                : "bg-white/80 text-slate-700 hover:bg-white"
            }`}
          >
            Week {value}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default WeekSelector;
