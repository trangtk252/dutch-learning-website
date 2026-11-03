import { describe, expect, it, vi } from "vitest";

vi.mock("../env", () => ({ env: { TRANSCRIPTION_PROVIDER: "none" } }));

import { groupCues } from "../dutch/text";
import { ImportError, latestEpisode, parseMediaUrl, parseSubtitles, parseTimedText, youtubeIdFrom } from "./media-import";

describe("parseMediaUrl", () => {
  it("accepts public http(s) links", () => {
    expect(parseMediaUrl("https://example.com/feed.xml").hostname).toBe("example.com");
  });
  it.each(["not a url", "ftp://example.com/a", "http://localhost:3000", "http://127.0.0.1/x", "http://192.168.1.5/x", "http://169.254.169.254/"])("rejects %s", (u) => {
    expect(() => parseMediaUrl(u)).toThrow(ImportError);
  });
});

describe("youtubeIdFrom", () => {
  it.each([
    ["https://www.youtube.com/watch?v=NC45Tott-NY&t=3s", "NC45Tott-NY"],
    ["https://youtu.be/NC45Tott-NY", "NC45Tott-NY"],
    ["https://www.youtube.com/shorts/NC45Tott-NY", "NC45Tott-NY"],
    ["https://m.youtube.com/watch?v=NC45Tott-NY", "NC45Tott-NY"],
  ])("%s", (u, id) => expect(youtubeIdFrom(new URL(u))).toBe(id));
  it("is null for other hosts", () => expect(youtubeIdFrom(new URL("https://example.com/watch?v=abc"))).toBeNull());
});

describe("parseTimedText", () => {
  it("reads format-3 captions with word spans and entities", () => {
    const xml = `<timedtext format="3"><body><p t="1800" d="4320" w="1"><s ac="0">Bij</s><s t="200"> deze</s></p><p t="6000" d="2000">Het &amp; zo</p></body></timedtext>`;
    expect(parseTimedText(xml)).toEqual([
      { startMs: 1800, endMs: 6120, text: "Bij deze" },
      { startMs: 6000, endMs: 8000, text: "Het & zo" },
    ]);
  });
  it("reads the older <text start dur> format", () => {
    expect(parseTimedText(`<transcript><text start="1.5" dur="2">Hallo &#39;wereld&#39;</text></transcript>`)).toEqual([{ startMs: 1500, endMs: 3500, text: "Hallo 'wereld'" }]);
  });
});

describe("parseSubtitles", () => {
  it("parses SRT and VTT", () => {
    const srt = "1\n00:00:01,000 --> 00:00:03,500\nGoedemorgen.\n\n2\n00:01:02.000 --> 00:01:04.000\n<i>Hoe gaat het?</i>\n";
    expect(parseSubtitles(srt)).toEqual([
      { startMs: 1000, endMs: 3500, text: "Goedemorgen." },
      { startMs: 62000, endMs: 64000, text: "Hoe gaat het?" },
    ]);
    expect(parseSubtitles("WEBVTT\n\n00:00:01.000 --> 00:00:02.000 align:start\nHoi")).toHaveLength(1);
  });
});

describe("latestEpisode", () => {
  it("takes the first item with its audio, duration and best transcript", async () => {
    const feed = `<rss><channel><title>Show</title><item><title><![CDATA[Aflevering 2]]></title><itunes:duration>12:30</itunes:duration>
      <enclosure url="https://cdn.example.com/a.mp3?x=1&amp;y=2" type="audio/mpeg"/>
      <podcast:transcript url="https://x/t.html" type="text/html"/><podcast:transcript url="https://x/t.vtt" type="text/vtt"/></item><item><title>Old</title></item></channel></rss>`;
    expect(await latestEpisode(feed)).toEqual({
      title: "Aflevering 2",
      audioUrl: "https://cdn.example.com/a.mp3?x=1&y=2",
      durationSec: 750,
      transcript: { url: "https://x/t.vtt", type: "text/vtt" },
    });
  });
});

describe("groupCues", () => {
  it("merges short caption lines into segments, keeping the first start time", () => {
    const cues = Array.from({ length: 40 }, (_, i) => ({ startMs: i * 1000, endMs: i * 1000 + 900, text: i === 12 ? "dat was het." : "een stukje tekst" }));
    const g = groupCues(cues);
    expect(g.length).toBeGreaterThan(1);
    expect(g[0].startMs).toBe(0);
    expect(g.map((s) => s.text).join(" ").split(" ").length).toBe(cues.map((c) => c.text).join(" ").split(" ").length);
  });
});
