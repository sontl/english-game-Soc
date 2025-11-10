import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { PartOfSpeech, Word } from "@english-game/shared";
import { createWord, fetchWords, requestAudio, requestImage } from "../services/api";
import { useAppStore } from "../store/appStore";
import SampleWordsManager from "../components/SampleWordsManager";

const AdminDashboard = () => {
  const { week, setWords } = useAppStore();
  const [form, setForm] = useState({
    text: "",
    transcription: "",
    exampleSentence: "",
    level: week,
    pos: "noun" as PartOfSpeech,
    prompt: ""
  });

  const wordsQuery = useQuery<Word[]>({
    queryKey: ["words", week],
    queryFn: () => fetchWords(week),
    staleTime: 1000 * 60
  });

  useEffect(() => {
    if (wordsQuery.data) {
      setWords(wordsQuery.data);
    }
  }, [wordsQuery.data, setWords]);

  const wordList = wordsQuery.data ?? [];

  const createWordMutation = useMutation({
    mutationFn: createWord,
    onSuccess: () => {
      void wordsQuery.refetch();
      setForm((prev) => ({ ...prev, text: "", transcription: "", exampleSentence: "" }));
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createWordMutation.mutate({
      text: form.text,
      transcription: form.transcription,
      exampleSentence: form.exampleSentence,
      level: form.level,
      pos: form.pos,
      aiGenerated: false
    });
  };

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-10">
      <section className="rounded-[28px] bg-white/80 p-6 shadow-2xl shadow-primary/15 backdrop-blur">
        <h2 className="text-2xl font-bold">Add a new word</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Word
            <input
              required
              value={form.text}
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="apple"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Transcription
            <input
              value={form.transcription}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, transcription: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="ˈæpəl"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Example sentence
            <input
              value={form.exampleSentence}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, exampleSentence: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="I eat an apple."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Part of speech
            <select
              value={form.pos}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, pos: event.target.value as PartOfSpeech }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Week level
            <input
              type="number"
              value={form.level}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, level: Number(event.target.value) }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              min={1}
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-full bg-primary px-4 py-2 font-semibold text-white"
              disabled={createWordMutation.isPending}
            >
              {createWordMutation.isPending ? "Saving..." : "Save word"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] bg-white/80 p-6 shadow-2xl shadow-accent/15 backdrop-blur">
        <h2 className="text-xl font-bold">AI helper</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Prompt
            <input
              value={form.prompt}
              onChange={(event) => setForm((prev) => ({ ...prev, prompt: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="Flat cartoon sticker of a red apple..."
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="button"
              className="rounded-full bg-accent px-4 py-2 font-semibold text-white"
              onClick={() => {
                if (!form.prompt) return;
                void requestImage(form.prompt).then(console.log);
              }}
            >
              Generate image
            </button>
            <button
              type="button"
              className="rounded-full bg-success px-4 py-2 font-semibold text-slate-800"
              onClick={() => {
                if (!form.prompt) return;
                void requestAudio(form.prompt).then(console.log);
              }}
            >
              Generate audio
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Integrate Cloudflare signed URLs here. Responses include placeholder URLs when
          credentials are missing.
        </p>
      </section>

      <section className="rounded-[28px] bg-white/80 p-6 shadow-2xl shadow-secondary/25 backdrop-blur">
        <h2 className="text-xl font-bold">Word list</h2>
        {wordsQuery.isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="mt-3 grid gap-2">
            {wordList.map((word) => (
              <li
                key={word.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
              >
                <div>
                  <p className="font-bold text-primary">{word.text}</p>
                  <p className="text-sm text-slate-600">{word.exampleSentence}</p>
                </div>
                <span className="text-xs uppercase text-slate-500">Week {word.level}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <SampleWordsManager />
    </div>
  );
};

export default AdminDashboard;
