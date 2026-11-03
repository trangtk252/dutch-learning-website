import "server-only";
import { env } from "../env";

/** One timed line of a transcript. */
export interface Cue {
  startMs: number | null;
  endMs: number | null;
  text: string;
}

export interface ImportedMedia {
  title: string | null;
  durationSec: number | null;
  youtubeId?: string;
  audioUrl?: string;
  cues: Cue[];
  /** Why no transcript could be produced automatically (shown to the learner). */
  note?: string;
}

const UA = "Mozilla/5.0 (compatible; LeerNederlands/1.0)";
const MAX_AUDIO_BYTES = 24 * 1024 * 1024; // OpenAI transcription accepts up to 25 MB

export class ImportError extends Error {}

/** Only plain http(s) links to public hosts: this runs server-side. */
export function parseMediaUrl(raw: string): URL {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new ImportError("That doesn't look like a valid link.");
  }
  const host = url.hostname.toLowerCase();
  const privateHost =
    host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") ||
    /^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$|\[?f[cd])/.test(host);
  if (!/^https?:$/.test(url.protocol) || privateHost) throw new ImportError("Please paste a public http(s) link.");
  return url;
}

export function youtubeIdFrom(url: URL): string | null {
  const host = url.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0] || null;
  if (host === "youtube.com" || host === "music.youtube.com") {
    if (url.pathname === "/watch") return url.searchParams.get("v");
    const m = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/);
    if (m) return m[1];
  }
  return null;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 20_000) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(ms), headers: { "user-agent": UA, ...init.headers } });
}

/* ───────────────────────────── YouTube ───────────────────────────── */

/** Parses YouTube's timedtext XML ("format 3": <p t d><s>word</s>…</p>, or plain <text start dur>). */
export function parseTimedText(xml: string): Cue[] {
  const clean = (raw: string) => decodeEntities(raw.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
  const cues: Cue[] = [];
  for (const m of xml.matchAll(/<p\b([^>]*)>([\s\S]*?)<\/p>/g)) {
    const t = attr(m[1], "t");
    const text = clean(m[2]);
    if (!text || t == null) continue;
    const d = attr(m[1], "d");
    cues.push({ startMs: Number(t), endMs: d ? Number(t) + Number(d) : null, text });
  }
  if (cues.length === 0) {
    for (const m of xml.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
      const start = attr(m[1], "start");
      const text = clean(m[2]);
      if (!text || start == null) continue;
      const dur = attr(m[1], "dur");
      cues.push({ startMs: Math.round(Number(start) * 1000), endMs: dur ? Math.round((Number(start) + Number(dur)) * 1000) : null, text });
    }
  }
  return cues;
}

interface CaptionTrack { baseUrl: string; languageCode: string; kind?: string }

export async function importYoutube(id: string, transcribe = true): Promise<ImportedMedia> {
  const res = await fetchWithTimeout("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
    method: "POST",
    headers: { "content-type": "application/json", "user-agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 14) gzip" },
    body: JSON.stringify({ context: { client: { clientName: "ANDROID", clientVersion: "20.10.38", androidSdkVersion: 34, hl: "nl" } }, videoId: id }),
  });
  if (!res.ok) throw new ImportError("Could not reach YouTube for that video.");
  const data = await res.json();
  if (data.playabilityStatus?.status === "ERROR") throw new ImportError("YouTube says that video doesn't exist or is unavailable.");
  const title: string | null = data.videoDetails?.title ?? null;
  const durationSec = Number(data.videoDetails?.lengthSeconds) || null;
  if (!transcribe) return { title, durationSec, youtubeId: id, cues: [] };
  const tracks: CaptionTrack[] = data.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? [];
  const nl = tracks.filter((t) => t.languageCode === "nl" || t.languageCode.startsWith("nl-"));
  // Prefer human-made Dutch captions over auto-generated ones.
  const track = nl.find((t) => t.kind !== "asr") ?? nl[0];
  if (!track) {
    return { title, durationSec, youtubeId: id, cues: [], note: "This video has no Dutch captions on YouTube, so there is no automatic transcript." };
  }
  const cap = await fetchWithTimeout(track.baseUrl);
  const cues = cap.ok ? parseTimedText(await cap.text()) : [];
  if (cues.length === 0) {
    return { title, durationSec, youtubeId: id, cues: [], note: "YouTube didn't return the captions for this video." };
  }
  return { title, durationSec, youtubeId: id, cues };
}

/* ───────────────────────────── Podcasts ───────────────────────────── */

function tag(xml: string, name: string): string | null {
  const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return null;
  return decodeEntities(m[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "")).trim() || null;
}
const attr = (el: string, name: string) => el.match(new RegExp(`\\b${name}="([^"]*)"`, "i"))?.[1];

function parseDuration(s: string | null): number | null {
  if (!s) return null;
  if (/^\d+$/.test(s)) return Number(s);
  const parts = s.split(":").map(Number);
  if (parts.some(Number.isNaN)) return null;
  return parts.reduce((a, p) => a * 60 + p, 0);
}

/** SRT / WebVTT → cues. */
export function parseSubtitles(text: string): Cue[] {
  const ts = (s: string) => {
    const m = s.trim().match(/(?:(\d+):)?(\d+):(\d+)[.,](\d+)/);
    return m ? ((Number(m[1] ?? 0) * 60 + Number(m[2])) * 60 + Number(m[3])) * 1000 + Number(m[4].padEnd(3, "0").slice(0, 3)) : null;
  };
  const cues: Cue[] = [];
  for (const block of text.replace(/\r/g, "").split(/\n{2,}/)) {
    const lines = block.split("\n");
    const i = lines.findIndex((l) => l.includes("-->"));
    if (i < 0) continue;
    const [a, b] = lines[i].split("-->");
    const body = decodeEntities(lines.slice(i + 1).join(" ").replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
    if (body) cues.push({ startMs: ts(a), endMs: ts(b.trim().split(/\s/)[0]), text: body });
  }
  return cues;
}

async function fetchTranscriptFile(url: string, type: string | undefined): Promise<Cue[]> {
  try {
    const res = await fetchWithTimeout(url);
    if (!res.ok) return [];
    const body = await res.text();
    if (/vtt|srt|subrip/i.test(type ?? "") || /^WEBVTT/.test(body) || body.includes("-->")) return parseSubtitles(body);
    if (/json/i.test(type ?? "")) {
      const j = JSON.parse(body);
      const segs: { startTime?: number; endTime?: number; body?: string; text?: string }[] = j.segments ?? [];
      return segs
        .map((s) => ({ startMs: s.startTime != null ? Math.round(s.startTime * 1000) : null, endMs: s.endTime != null ? Math.round(s.endTime * 1000) : null, text: (s.body ?? s.text ?? "").trim() }))
        .filter((c) => c.text);
    }
    return [];
  } catch {
    return [];
  }
}

interface FeedEpisode { title: string | null; audioUrl: string | null; durationSec: number | null; transcript: { url: string; type?: string } | null }

/** The newest episode of an RSS feed. */
export async function latestEpisode(feedXml: string): Promise<FeedEpisode | null> {
  const item = feedXml.match(/<item\b[\s\S]*?<\/item>/i)?.[0];
  if (!item) return null;
  const enclosure = item.match(/<enclosure\b[^>]*>/i)?.[0];
  const tr = item.match(/<podcast:transcript\b[^>]*>/i)?.[0];
  // Prefer a timed format (vtt/srt/json) over html/plain text.
  const trs = [...item.matchAll(/<podcast:transcript\b[^>]*>/gi)].map((m) => m[0]);
  const best = trs.find((t) => /vtt|srt|json/i.test(attr(t, "type") ?? "")) ?? tr;
  return {
    title: tag(item, "title"),
    audioUrl: enclosure ? decodeEntities(attr(enclosure, "url") ?? "") || null : null,
    durationSec: parseDuration(tag(item, "itunes:duration")),
    transcript: best && attr(best, "url") ? { url: decodeEntities(attr(best, "url")!), type: attr(best, "type") } : null,
  };
}

async function importFeed(feedUrl: string, transcribe: boolean): Promise<ImportedMedia> {
  const res = await fetchWithTimeout(feedUrl);
  if (!res.ok) throw new ImportError("Could not read that podcast feed.");
  return importFeedXml(await res.text(), transcribe);
}

async function importApple(url: URL, transcribe: boolean): Promise<ImportedMedia> {
  const showId = url.pathname.match(/\/id(\d+)/)?.[1];
  if (!showId) throw new ImportError("Could not find the podcast in that Apple Podcasts link.");
  const episodeId = url.searchParams.get("i");
  const res = await fetchWithTimeout(`https://itunes.apple.com/lookup?id=${showId}&entity=podcastEpisode&limit=50`);
  if (!res.ok) throw new ImportError("Could not look that podcast up on Apple Podcasts.");
  const { results } = (await res.json()) as { results: { wrapperType: string; feedUrl?: string; trackId: number; trackName: string; collectionName?: string; episodeUrl?: string; trackTimeMillis?: number }[] };
  const show = results.find((r) => r.wrapperType === "track" && r.feedUrl) ?? results[0];
  const episodes = results.filter((r) => r.episodeUrl);
  const ep = (episodeId && episodes.find((e) => String(e.trackId) === episodeId)) || (!episodeId ? episodes[0] : undefined);
  if (ep?.episodeUrl) {
    return withTranscription({
      title: [ep.collectionName ?? show?.collectionName, ep.trackName].filter(Boolean).join(" — ") || null,
      durationSec: ep.trackTimeMillis ? Math.round(ep.trackTimeMillis / 1000) : null,
      audioUrl: ep.episodeUrl,
      cues: [],
    }, transcribe);
  }
  if (show?.feedUrl) return importFeed(show.feedUrl, transcribe);
  throw new ImportError("Could not find that episode on Apple Podcasts.");
}

/* ───────────────────── Speech-to-text (optional) ───────────────────── */

export const transcriptionConfigured = () => env.TRANSCRIPTION_PROVIDER === "openai";

/** Downloads up to ~24 MB of the audio (enough for the first ~25 minutes of a typical episode). */
async function downloadAudio(url: string): Promise<Blob> {
  const res = await fetchWithTimeout(url, { headers: { range: `bytes=0-${MAX_AUDIO_BYTES - 1}` }, redirect: "follow" }, 120_000);
  if (!res.ok || !res.body) throw new ImportError("Could not download the audio file.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
    size += chunk.length;
    if (size >= MAX_AUDIO_BYTES) break;
  }
  return new Blob(chunks as BlobPart[], { type: res.headers.get("content-type")?.split(";")[0] || "audio/mpeg" });
}

async function transcribeAudio(audioUrl: string): Promise<Cue[]> {
  const audio = await downloadAudio(audioUrl);
  const form = new FormData();
  form.append("file", audio, "audio.mp3");
  form.append("model", "whisper-1");
  form.append("language", "nl");
  form.append("response_format", "verbose_json");
  const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { authorization: `Bearer ${env.TRANSCRIPTION_API_KEY}` },
    body: form,
    signal: AbortSignal.timeout(300_000),
  });
  if (!res.ok) {
    console.error(`[transcription] ${res.status} ${await res.text().catch(() => "")}`);
    throw new ImportError("The transcription service failed. You can paste a transcript instead.");
  }
  const j = (await res.json()) as { segments?: { start: number; end: number; text: string }[]; text?: string };
  if (j.segments?.length) {
    return j.segments.map((s) => ({ startMs: Math.round(s.start * 1000), endMs: Math.round(s.end * 1000), text: s.text.trim() })).filter((c) => c.text);
  }
  return j.text ? [{ startMs: null, endMs: null, text: j.text.trim() }] : [];
}

async function withTranscription(m: ImportedMedia, transcribe: boolean): Promise<ImportedMedia> {
  if (m.cues.length > 0 || !m.audioUrl || !transcribe) return m;
  if (!transcriptionConfigured()) {
    return { ...m, note: "Automatic transcription of audio needs a speech-to-text key (TRANSCRIPTION_PROVIDER in .env). You can paste a transcript instead." };
  }
  try {
    return { ...m, cues: await transcribeAudio(m.audioUrl) };
  } catch (e) {
    return { ...m, note: e instanceof ImportError ? e.message : "Transcription failed. You can paste a transcript instead." };
  }
}

/* ───────────────────────────── Entry point ───────────────────────────── */

const AUDIO_EXT = /\.(mp3|m4a|aac|ogg|oga|opus|wav)(\?|$)/i;

/**
 * Turns a pasted link into a title + timed transcript where possible.
 * Never throws for "no transcript available": that is reported in `note`.
 */
export async function importFromUrl(raw: string, { transcribe = true } = {}): Promise<ImportedMedia> {
  const url = parseMediaUrl(raw);
  const ytId = youtubeIdFrom(url);
  if (ytId) return importYoutube(ytId, transcribe);
  if (url.hostname.endsWith("podcasts.apple.com")) return importApple(url, transcribe);
  if (AUDIO_EXT.test(url.pathname + url.search)) {
    return withTranscription({ title: null, durationSec: null, audioUrl: url.toString(), cues: [] }, transcribe);
  }
  // Anything else: treat as an RSS feed if it looks like one.
  try {
    const res = await fetchWithTimeout(url.toString());
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && /xml|rss|atom/i.test(type)) {
      const xml = await res.text();
      if (/<rss\b|<feed\b/i.test(xml)) return importFeedXml(xml, transcribe);
    }
  } catch {
    /* fall through to the generic note */
  }
  return {
    title: null,
    durationSec: null,
    cues: [],
    note: "Automatic transcripts work for YouTube links, Apple Podcasts links, podcast RSS feeds and direct audio files. For Spotify, Netflix and similar services, paste the transcript or subtitles yourself.",
  };
}

async function importFeedXml(xml: string, transcribe: boolean): Promise<ImportedMedia> {
  const showTitle = tag(xml.replace(/<item\b[\s\S]*$/i, ""), "title");
  const ep = await latestEpisode(xml);
  if (!ep?.audioUrl) throw new ImportError("That feed has no episodes with audio.");
  const title = [showTitle, ep.title].filter(Boolean).join(" — ") || null;
  const cues = ep.transcript ? await fetchTranscriptFile(ep.transcript.url, ep.transcript.type) : [];
  return cues.length > 0
    ? { title, durationSec: ep.durationSec, audioUrl: ep.audioUrl, cues }
    : withTranscription({ title, durationSec: ep.durationSec, audioUrl: ep.audioUrl, cues: [] }, transcribe);
}
