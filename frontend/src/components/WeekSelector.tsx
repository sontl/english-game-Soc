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
          <button
            key={value}
            type="button"
            disabled={loading}
            onClick={() => {
              void setWeek(value);
            }}
            className={`rounded-full px-4 py-2 text-base font-semibold shadow transition-colors ${
              value === week ? "bg-accent text-white" : "bg-white"
            }`}
          >
            Week {value}
          </button>
        ))}
      </div>
    </div>
  );
};

export default WeekSelector;
