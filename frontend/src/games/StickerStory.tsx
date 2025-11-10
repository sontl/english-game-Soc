import { useEffect, useRef, useState, type DragEvent } from "react";
import { useAppStore } from "../store/appStore";

interface Sticker {
  id: string;
  x: number;
  y: number;
  label: string;
  imageUrl?: string;
}

const StickerStory = () => {
  const { words } = useAppStore();
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder>();
  const chunksRef = useRef<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string>();

  useEffect(() => {
    if (!isRecording) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setIsRecording(false);
      return;
    }

    const setup = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
      };
      mediaRecorder.start();
    };

    void setup();

    return () => {
      mediaRecorderRef.current?.stop();
    };
  }, [isRecording]);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    const data = event.dataTransfer.getData("application/json");
    if (!data) return;
    const word = JSON.parse(data) as { id: string; text: string; imageUrl?: string };
    const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
    setStickers((prev) => [
      ...prev,
      {
        id: `${word.id}-${Date.now()}`,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        label: word.text,
        imageUrl: word.imageUrl
      }
    ]);
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-primary">Sticker Story</h2>
          <p className="text-sm text-slate-600">
            Drag stickers onto the scene and record your sentence.
          </p>
        </div>
        <button
          type="button"
          className={`rounded-full px-4 py-2 text-white ${
            isRecording ? "bg-red-500" : "bg-primary"
          }`}
          onClick={() => {
            if (isRecording) {
              mediaRecorderRef.current?.stop();
              setIsRecording(false);
            } else {
              setRecordingUrl(undefined);
              setIsRecording(true);
            }
          }}
        >
          {isRecording ? "Stop recording" : "Record sentence"}
        </button>
      </header>
      <div className="flex flex-wrap gap-3">
        {words.map((word) => (
          <button
            key={word.id}
            type="button"
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData(
                "application/json",
                JSON.stringify({ id: word.id, text: word.text, imageUrl: word.imageUrl })
              )
            }
            className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2 text-base font-semibold text-primary shadow"
          >
            {word.imageUrl ? (
              <img src={word.imageUrl} alt={word.text} className="h-10 w-10 rounded-full" />
            ) : (
              <span>🧸</span>
            )}
            {word.text}
          </button>
        ))}
      </div>
      <div
        className="relative h-96 w-full overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/30 via-white to-accent/30"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        role="application"
        aria-label="Sticker canvas"
      >
        {stickers.map((sticker) => (
          <div
            key={sticker.id}
            className="absolute flex flex-col items-center"
            style={{ left: sticker.x - 40, top: sticker.y - 40 }}
          >
            {sticker.imageUrl ? (
              <img
                src={sticker.imageUrl}
                alt={sticker.label}
                className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-xl font-bold text-primary shadow-lg">
                {sticker.label}
              </div>
            )}
            <span className="mt-1 rounded-full bg-white/80 px-2 text-xs font-semibold text-slate-700">
              {sticker.label}
            </span>
          </div>
        ))}
      </div>
      {recordingUrl ? (
        <audio controls src={recordingUrl} className="w-full" />
      ) : (
        <p className="text-sm text-slate-600">
          After recording, playback appears here. Upload to Cloudflare R2 using backend endpoint.
        </p>
      )}
    </div>
  );
};

export default StickerStory;
