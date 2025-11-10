import { useAppStore } from "../store/appStore";

const TERMS = [
  { term: 1, label: "Term 1", weeks: [4, 5, 6, 7, 8, 9, 10] },
  { term: 2, label: "Term 2", weeks: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { term: 3, label: "Term 3", weeks: [2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { term: 4, label: "Term 4", weeks: [2, 3, 4, 5, 6, 7, 8, 9, 10] }
];

const WeekSelector = () => {
  const { term, week, setWeek, loading, mode, loadRandomWords } = useAppStore();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-xl font-bold">Choose your week</h2>
        <p className="text-sm text-slate-600">
          Select a term first, then pick the matching week to load its word pack.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => {
            void loadRandomWords();
          }}
          className={`rounded-full px-4 py-2 text-base font-semibold shadow transition-colors ${
            mode === "random" ? "bg-accent text-white" : "bg-white"
          }`}
        >
          Surprise me (10)
        </button>
      </div>
      <div className="flex flex-col gap-4">
        {TERMS.map((group) => (
          <div key={group.term} className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-primary">{group.label}</h3>
            <div className="flex flex-wrap gap-2">
              {group.weeks.map((value) => {
                const isActive = term === group.term && week === value;
                return (
                  <button
                    key={`${group.term}-${value}`}
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      void setWeek(group.term, value);
                    }}
                    className={`rounded-full px-4 py-2 text-base font-semibold shadow transition-colors ${
                      isActive ? "bg-accent text-white" : "bg-white"
                    }`}
                  >
                    Week {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeekSelector;
