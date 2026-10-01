"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClickableText } from "@/components/words/clickable-text";
import { SpeakButton } from "@/components/voice/speak-button";
import { useVoice } from "@/components/voice/voice-context";
import { ERROR_CATEGORY_LABELS, type ErrorCategoryKey } from "@/lib/constants";
import { cn } from "@/lib/cn";
import { useIsClient } from "@/lib/use-is-client";
import { finishConversationAction, sendMessageAction, type ChatMessageDTO } from "../actions";

export function Chat({
  conversationId,
  initial,
  ended,
  knownForms,
}: {
  conversationId: string;
  initial: ChatMessageDTO[];
  ended: boolean;
  knownForms: string[];
}) {
  const router = useRouter();
  const { tts, stt } = useVoice();
  const [messages, setMessages] = useState(initial);
  const [draft, setDraft] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newWords, setNewWords] = useState<{ dutch: string; english: string }[]>([]);
  const [sending, startSending] = useTransition();
  const [finishing, startFinishing] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);
  const spokeFirst = useRef(false);

  const isClient = useIsClient();
  const voiceAvailable = isClient && stt.available;
  useEffect(() => bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages.length, sending]);
  useEffect(() => {
    // Read the tutor's opening line aloud once.
    if (!ended && !spokeFirst.current && messages.length === 1 && autoSpeak) {
      spokeFirst.current = true;
      tts.speak(messages[0].content);
    }
  }, [ended, messages, autoSpeak, tts]);

  function send(text: string, mode: "TEXT" | "VOICE") {
    const clean = text.trim();
    if (!clean || sending) return;
    setError(null);
    setDraft("");
    setInterim("");
    const optimistic: ChatMessageDTO = { id: `tmp-${Date.now()}`, role: "USER", content: clean, english: null, corrections: [] };
    setMessages((m) => [...m, optimistic]);
    startSending(async () => {
      const res = await sendMessageAction({ conversationId, text: clean, inputMode: mode });
      if (!res.ok) {
        setMessages((m) => m.filter((x) => x.id !== optimistic.id));
        setDraft(clean);
        setError(res.error);
        return;
      }
      setMessages((m) => [...m.filter((x) => x.id !== optimistic.id), res.user, res.reply]);
      setNewWords(res.newWords);
      if (autoSpeak) tts.speak(res.reply.content);
    });
  }

  function toggleMic() {
    if (listening) {
      stt.stop();
      return;
    }
    tts.stop();
    setError(null);
    setListening(true);
    stt.start({
      onInterim: setInterim,
      onFinal: (text) => send(text, "VOICE"),
      onError: (msg) => setError(msg),
      onEnd: () => {
        setListening(false);
        setInterim("");
      },
    });
  }

  function finish() {
    startFinishing(async () => {
      const res = await finishConversationAction(conversationId);
      if (!res.ok) setError(res.error ?? "Couldn't finish.");
      else router.refresh();
    });
  }

  const learnerTurns = messages.filter((m) => m.role === "USER").length;

  return (
    <div className="space-y-4">
      <ol className="space-y-4" aria-label="Conversation" aria-live="polite">
        {messages.map((m) =>
          m.role === "ASSISTANT" ? (
            <li key={m.id} className="flex gap-3">
              <span aria-hidden className="mt-1 grid size-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">S</span>
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-surface px-4 py-3">
                <span className="sr-only">Sanne: </span>
                <div className="flex items-start gap-1">
                  <ClickableText as="span" text={m.content} context="SPEAKING" knownForms={knownForms} className="flex-1" />
                  <SpeakButton text={m.content} />
                </div>
                {m.english && (
                  <p className="mt-2 rounded-xl bg-primary-soft px-3 py-2 text-sm text-ink" lang="en">
                    <span className="font-medium">In English: </span>{m.english}
                  </p>
                )}
              </div>
            </li>
          ) : (
            <li key={m.id} className="flex flex-col items-end gap-1.5">
              <div className={cn("max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-ink", m.id.startsWith("tmp-") && "opacity-70")} lang="nl">
                <span className="sr-only">You: </span>
                {m.content}
              </div>
              {m.corrections.map((c, i) => (
                <div key={i} className="max-w-[85%] rounded-xl border border-warning/40 bg-warning-soft px-3 py-2 text-sm">
                  <Badge tone="warning">{ERROR_CATEGORY_LABELS[c.category as ErrorCategoryKey] ?? c.category}</Badge>
                  <p className="mt-1" lang="nl"><span className="line-through decoration-1 opacity-70">{c.original}</span> → <span className="font-medium">{c.corrected}</span></p>
                  <p className="text-muted">{c.explanation}</p>
                </div>
              ))}
            </li>
          ),
        )}
        {sending && (
          <li className="flex gap-3" aria-label="Sanne is typing">
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">S</span>
            <span className="rounded-2xl border border-line bg-surface px-4 py-3 text-muted">…</span>
          </li>
        )}
      </ol>
      <div ref={bottom} />

      {newWords.length > 0 && !ended && (
        <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm">
          <span className="text-muted">New words: </span>
          {newWords.map((w, i) => (
            <span key={w.dutch}>{i > 0 && " · "}<span lang="nl" className="font-medium">{w.dutch}</span> <span className="text-muted">({w.english})</span></span>
          ))}
        </div>
      )}

      {error && <p role="alert" className="rounded-xl bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      {!ended && (
        <div className="sticky bottom-20 space-y-2 rounded-2xl border border-line bg-surface p-3 shadow-sm lg:bottom-4">
          {listening && (
            <p className="text-sm text-muted" aria-live="polite">🎙️ Listening… <span lang="nl" className="text-ink">{interim}</span></p>
          )}
          <form
            className="flex items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft, "TEXT");
            }}
          >
            {voiceAvailable && (
              <Button
                type="button"
                variant={listening ? "danger" : "secondary"}
                onClick={toggleMic}
                aria-pressed={listening}
                aria-label={listening ? "Stop recording" : "Speak (Dutch)"}
                className="size-11 shrink-0 rounded-full px-0"
              >
                {listening ? <MicOff aria-hidden className="size-5" /> : <Mic aria-hidden className="size-5" />}
              </Button>
            )}
            <label htmlFor="chat-input" className="sr-only">Your message in Dutch</label>
            <textarea
              id="chat-input"
              lang="nl"
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(draft, "TEXT");
                }
              }}
              placeholder={voiceAvailable ? "Type or press the mic and speak Dutch…" : "Type your answer in Dutch…"}
              maxLength={1000}
              className="max-h-40 min-h-11 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2.5 focus:border-primary focus:outline-none"
            />
            <Button type="submit" disabled={!draft.trim() || sending} aria-label="Send" className="size-11 shrink-0 px-0">
              <Send aria-hidden className="size-5" />
            </Button>
          </form>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Button type="button" size="sm" variant="ghost" onClick={() => send("Ik begrijp het niet. Can you explain that in English?", "TEXT")} disabled={sending}>
              <HelpCircle aria-hidden className="size-4" /> I don&apos;t understand
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => { setAutoSpeak((a) => !a); tts.stop(); }} aria-pressed={autoSpeak}>
              {autoSpeak ? <Volume2 aria-hidden className="size-4" /> : <VolumeX aria-hidden className="size-4" />}
              Read replies aloud
            </Button>
            <Button type="button" size="sm" variant="secondary" className="ml-auto" onClick={finish} disabled={finishing || sending || learnerTurns === 0}>
              {finishing ? "Writing your report…" : "Finish & get feedback"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
