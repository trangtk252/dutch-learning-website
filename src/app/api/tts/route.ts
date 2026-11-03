import { env } from "@/lib/env";
import { getSession } from "@/lib/session";

const OPENAI_VOICES = ["nova", "onyx", "shimmer", "echo"];
// ElevenLabs premade multilingual voices (Rachel, Adam).
const ELEVENLABS_VOICES = ["21m00Tcm4TlvDq8ikWAM", "pNInz6obpgDQGcFmaJgB"];

/** Natural-voice text-to-speech proxy. The API key never reaches the browser. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const provider = env.TEXT_TO_SPEECH_PROVIDER;
  const key = env.TEXT_TO_SPEECH_API_KEY;
  if ((provider !== "openai" && provider !== "elevenlabs") || !key) {
    return new Response("Cloud TTS is not configured", { status: 501 });
  }

  const body = (await request.json().catch(() => null)) as { text?: unknown; voiceIndex?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, 1500) : "";
  if (!text) return new Response("Missing text", { status: 400 });
  const index = Number.isInteger(body?.voiceIndex) ? Math.abs(body!.voiceIndex as number) : 0;

  const upstream =
    provider === "openai"
      ? await fetch("https://api.openai.com/v1/audio/speech", {
          method: "POST",
          headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "gpt-4o-mini-tts",
            voice: env.TEXT_TO_SPEECH_VOICE ?? OPENAI_VOICES[index % OPENAI_VOICES.length],
            input: text,
            instructions: "Speak natural, warm Dutch (nl-NL) at a relaxed pace, like a friendly native tutor.",
            response_format: "mp3",
          }),
        })
      : await fetch(
          `https://api.elevenlabs.io/v1/text-to-speech/${
            env.TEXT_TO_SPEECH_VOICE ?? ELEVENLABS_VOICES[index % ELEVENLABS_VOICES.length]
          }?output_format=mp3_44100_128`,
          {
            method: "POST",
            headers: { "xi-api-key": key, "Content-Type": "application/json" },
            body: JSON.stringify({ text, model_id: "eleven_multilingual_v2", language_code: "nl" }),
          },
        );

  if (!upstream.ok) return new Response("TTS provider error", { status: 502 });
  return new Response(upstream.body, { headers: { "Content-Type": "audio/mpeg", "Cache-Control": "private, max-age=3600" } });
}
