import { useMemo, useState } from "react";
import { useAppStore } from "../store/appStore";
import { shuffle } from "../utils/random";

interface SentencePrompt {
  id: string;
  sentence: string;
  missing: string;
}

const buildPrompts = (words: { id: string; text: string; exampleSentence?: string }[]) => {
  return words.map((word) => {
    const sentence = word.exampleSentence ?? `I can see a ${word.text}.`;
    return {
      id: word.id,
      sentence,
      missing: word.text
    } satisfies SentencePrompt;
  });
};

const LittleExplorer = () => {
  const { words } = useAppStore();
  const prompts = useMemo(() => shuffle(buildPrompts(words)).slice(0, 3), [words]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activePrompt] = useState(prompts[0]);

  const unusedTiles = prompts
    .map((prompt) => prompt.missing)
    .filter((tile) => !Object.values(answers).includes(tile));

  const handleDrop = (promptId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [promptId]: value }));
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-2xl font-extrabold text-primary">Little Explorer</h2>
        <p className="text-sm text-slate-600">
          Drag the correct word into the glowing space to describe the scene.
        </p>
      </header>
      <div className="rounded-3xl bg-gradient-to-br from-accent/10 via-white to-secondary/20 p-6">
        {prompts.map((prompt) => {
          const tokens = prompt.sentence.split(new RegExp(`(${prompt.missing})`, "i"));
          const current = answers[prompt.id];
          return (
            <div key={prompt.id} className="mb-4 flex flex-col gap-2">
              <div className="rounded-2xl bg-white/80 p-4 text-lg font-semibold shadow">
                {tokens.map((part, index) => {
                  const match = part.toLowerCase() === prompt.missing.toLowerCase();
                  if (!match) {
                    return <span key={`${prompt.id}-${index}`}>{part}</span>;
                  }
                  return (
                    <span
                      key={`${prompt.id}-${index}`}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        const value = event.dataTransfer.getData("text/plain");
                        handleDrop(prompt.id, value);
                      }}
                      className={`inline-flex min-w-[120px] cursor-pointer items-center justify-center rounded-2xl border-4 px-3 py-2 text-primary transition-colors ${
                        current ? "border-success bg-success/20" : "border-dashed border-secondary"
                      }`}
                      role="textbox"
                      aria-label="Drop word here"
                    >
                      {current ?? "_____"}
                    </span>
                  );
                })}
              </div>
              {current && (
                <span className="text-sm text-success">
                  Great! {current} completes the sentence.
                </span>
              )}
            </div>
          );
        })}
      </div>
      <div>
        <h3 className="text-lg font-bold">Word tiles</h3>
        <div className="mt-2 flex flex-wrap gap-3">
          {unusedTiles.map((tile) => (
            <button
              key={tile}
              type="button"
              draggable
              onDragStart={(event) => event.dataTransfer.setData("text/plain", tile)}
              className="rounded-2xl bg-primary px-5 py-3 text-lg font-semibold text-white shadow"
            >
              {tile}
            </button>
          ))}
        </div>
      </div>
      {Object.keys(answers).length === prompts.length && (
        <div className="rounded-2xl bg-success/20 p-4 text-lg font-bold text-slate-700">
          Explorer complete! Ready for a little animation reward.
        </div>
      )}
      <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-600">
        <p>
          Suggested animation hook: trigger scene-specific animation when each sentence is
          solved. Use Three.js or CSS parallax layered backgrounds.
        </p>
        <p className="mt-2">
          Audio prompt placeholder: play voice-over for prompt {activePrompt?.sentence}.
        </p>
      </div>
    </div>
  );
};

export default LittleExplorer;
