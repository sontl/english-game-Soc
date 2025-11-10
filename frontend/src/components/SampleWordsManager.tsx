import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PartOfSpeech, Word } from "@english-game/shared";
import {
  createSampleWord,
  deleteSampleWord,
  fetchSampleWords,
  updateSampleWord,
  uploadSampleWordMedia
} from "../services/api";

type WordFormState = {
  text: string;
  transcription: string;
  exampleSentence: string;
  pos: PartOfSpeech;
  level: number;
  term?: number;
  week?: number;
  aiGenerated: boolean;
};

const emptyForm = (term?: number, week?: number): WordFormState => ({
  text: "",
  transcription: "",
  exampleSentence: "",
  pos: "noun",
  level: term && week ? term * 100 + week : 100,
  term,
  week,
  aiGenerated: false
});

const buildFormFromWord = (word: Word): WordFormState => ({
  text: word.text,
  transcription: word.transcription,
  exampleSentence: word.exampleSentence ?? "",
  pos: word.pos as PartOfSpeech,
  level: word.level,
  term: word.term,
  week: word.week,
  aiGenerated: word.aiGenerated
});

const SampleWordsManager = () => {
  const queryClient = useQueryClient();
  const sampleWordsQuery = useQuery<Word[]>({
    queryKey: ["sample-words"],
    queryFn: fetchSampleWords,
    staleTime: 1000 * 60
  });

  const [filterTerm, setFilterTerm] = useState<number | "all">("all");
  const [filterWeek, setFilterWeek] = useState<number | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formState, setFormState] = useState<WordFormState>(emptyForm());

  const words = sampleWordsQuery.data ?? [];

  const terms = useMemo(() => {
    const unique = new Set<number>();
    words.forEach((word) => {
      if (word.term) {
        unique.add(word.term);
      }
    });
    return Array.from(unique).sort((a, b) => a - b);
  }, [words]);

  const weeksForTerm = useMemo(() => {
    if (filterTerm === "all") return [];
    const unique = new Set<number>();
    words
      .filter((word) => word.term === filterTerm)
      .forEach((word) => {
        if (word.week) {
          unique.add(word.week);
        }
      });
    return Array.from(unique).sort((a, b) => a - b);
  }, [words, filterTerm]);

  const filteredWords = useMemo(() => {
    return words
      .filter((word) => (filterTerm === "all" ? true : word.term === filterTerm))
      .filter((word) => (filterWeek === "all" ? true : word.week === filterWeek))
      .sort((a, b) => a.level - b.level || a.text.localeCompare(b.text));
  }, [words, filterTerm, filterWeek]);

  const buildDefaultForm = () => {
    const termValue = filterTerm === "all" ? undefined : filterTerm;
    const weekValue = filterWeek === "all" ? undefined : filterWeek;
    return emptyForm(termValue, weekValue);
  };

  const resetEditing = () => {
    setEditingId(null);
    setFormState(buildDefaultForm());
  };

  const createMutation = useMutation({
    mutationFn: createSampleWord,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sample-words"] });
      resetEditing();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Word> }) =>
      updateSampleWord(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sample-words"] });
      resetEditing();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSampleWord,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sample-words"] });
      resetEditing();
    }
  });

  const uploadMutation = useMutation({
    mutationFn: ({ id, file, type }: { id: string; file: File; type: "image" | "audio" }) =>
      uploadSampleWordMedia(id, file, type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["sample-words"] });
    }
  });

  const handleEdit = (word: Word) => {
    setEditingId(word.id);
    setFormState(buildFormFromWord(word));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: Partial<Word> = {
      text: formState.text,
      transcription: formState.transcription,
      exampleSentence: formState.exampleSentence,
      pos: formState.pos,
      level: formState.level,
      term: formState.term,
      week: formState.week,
      aiGenerated: formState.aiGenerated
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  useEffect(() => {
    if (editingId) {
      return;
    }
    setFormState((prev) => {
      const termValue = filterTerm === "all" ? undefined : filterTerm;
      const weekValue = filterWeek === "all" ? undefined : filterWeek;
      const nextLevel = termValue && weekValue ? termValue * 100 + weekValue : prev.level;
      return {
        ...prev,
        term: termValue,
        week: weekValue,
        level: nextLevel
      };
    });
  }, [filterTerm, filterWeek, editingId]);

  const handleUpload = (id: string, fileList: FileList | null, type: "image" | "audio") => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    uploadMutation.mutate({ id, file, type });
  };

  return (
    <section className="rounded-[28px] bg-white/80 p-6 shadow-2xl shadow-slate-400/25 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sample word library</h2>
          <p className="text-sm text-slate-600">
            Edit the fallback sample list, update media, or add new entries for demos.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={filterTerm === "all" ? "all" : String(filterTerm)}
            onChange={(event) => {
              const value = event.target.value === "all" ? "all" : Number(event.target.value);
              setFilterTerm(value);
              setFilterWeek("all");
            }}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">All terms</option>
            {terms.map((termValue) => (
              <option key={termValue} value={termValue}>
                Term {termValue}
              </option>
            ))}
          </select>
          <select
            value={filterWeek === "all" ? "all" : String(filterWeek)}
            onChange={(event) => {
              const value = event.target.value === "all" ? "all" : Number(event.target.value);
              setFilterWeek(value);
            }}
            disabled={filterTerm === "all"}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-50"
          >
            <option value="all">All weeks</option>
            {weeksForTerm.map((weekValue) => (
              <option key={weekValue} value={weekValue}>
                Week {weekValue}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => sampleWordsQuery.refetch()}
            className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white"
          >
            Refresh
          </button>
        </div>
      </div>

      <form className="mt-6 grid gap-3 rounded-2xl border border-slate-200 p-4" onSubmit={handleSubmit}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {editingId ? "Edit word" : "Add new word"}
          </h3>
          {editingId && (
            <button
              type="button"
              className="text-sm font-semibold text-primary underline"
              onClick={resetEditing}
            >
              Cancel
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Word
            <input
              required
              value={formState.text}
              onChange={(event) => setFormState((prev) => ({ ...prev, text: event.target.value }))}
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="apple"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Transcription
            <input
              value={formState.transcription}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, transcription: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="ˈæpəl"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold md:col-span-2">
            Example sentence
            <input
              value={formState.exampleSentence}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, exampleSentence: event.target.value }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="I eat an apple."
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Part of speech
            <select
              value={formState.pos}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, pos: event.target.value as PartOfSpeech }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
            >
              <option value="noun">Noun</option>
              <option value="verb">Verb</option>
              <option value="adjective">Adjective</option>
              <option value="adverb">Adverb</option>
              <option value="determiner">Determiner</option>
              <option value="pronoun">Pronoun</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Level (term×100 + week)
            <input
              type="number"
              value={formState.level}
              min={101}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, level: Number(event.target.value) }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Term
            <input
              type="number"
              value={formState.term ?? ""}
              min={1}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  term: event.target.value ? Number(event.target.value) : undefined
                }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. 3"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Week
            <input
              type="number"
              value={formState.week ?? ""}
              min={1}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  week: event.target.value ? Number(event.target.value) : undefined
                }))
              }
              className="rounded-xl border border-slate-200 px-3 py-2"
              placeholder="e.g. 7"
            />
          </label>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-full bg-primary px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {editingId
              ? updateMutation.isPending
                ? "Saving..."
                : "Save changes"
              : createMutation.isPending
                ? "Saving..."
                : "Add word"}
          </button>
        </div>
      </form>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Word</th>
              <th className="px-4 py-2">Example</th>
              <th className="px-4 py-2">Term/Week</th>
              <th className="px-4 py-2">Media</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {sampleWordsQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading sample words...
                </td>
              </tr>
            ) : filteredWords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  No words found for the selected filters.
                </td>
              </tr>
            ) : (
              filteredWords.map((word) => (
                <tr key={word.id} className="align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-primary">{word.text}</div>
                    <div className="text-xs text-slate-500">{word.transcription}</div>
                    <div className="mt-1 text-xs text-slate-500 uppercase">{word.pos}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">{word.exampleSentence}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-slate-700">Level {word.level}</div>
                    <div className="text-xs text-slate-500">
                      Term {word.term ?? "-"} · Week {word.week ?? "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span>Image</span>
                        {word.imageUrl ? (
                          <a
                            href={word.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary underline"
                          >
                            View
                          </a>
                        ) : (
                          <span className="italic text-slate-400">None</span>
                        )}
                        <label className="cursor-pointer rounded-full bg-secondary px-3 py-1 text-white">
                          Upload
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(event) => {
                              handleUpload(word.id, event.target.files, "image");
                              event.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Audio</span>
                        {word.audioUrl ? (
                          <audio controls className="h-8">
                            <source src={word.audioUrl} />
                          </audio>
                        ) : (
                          <span className="italic text-slate-400">None</span>
                        )}
                        <label className="cursor-pointer rounded-full bg-secondary px-3 py-1 text-white">
                          Upload
                          <input
                            type="file"
                            accept="audio/*"
                            className="hidden"
                            onChange={(event) => {
                              handleUpload(word.id, event.target.files, "audio");
                              event.target.value = "";
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(word)}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(word.id)}
                        className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default SampleWordsManager;
