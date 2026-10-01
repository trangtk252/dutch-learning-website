"use client";

import { Fragment, useCallback, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { normalizeWord, tokenize } from "@/lib/dutch/text";
import { cn } from "@/lib/cn";
import { WordPopover, type PopoverTarget, type SaveContext } from "./word-popover";

function sentenceAround(text: string, offset: number) {
  const start = Math.max(text.lastIndexOf(". ", offset), text.lastIndexOf("? ", offset), text.lastIndexOf("! ", offset), text.lastIndexOf("\n", offset));
  const ends = [". ", "? ", "! ", "\n"].map((p) => text.indexOf(p, offset)).filter((i) => i >= 0);
  const end = ends.length ? Math.min(...ends) + 1 : text.length;
  return text.slice(start < 0 ? 0 : start + 1, end).trim();
}

/**
 * Renders Dutch text where every word can be tapped to look it up and save it.
 * Keyboard: Tab into the text, arrow keys move between words, Enter opens the
 * word. Words already in the learner's vocabulary are subtly underlined.
 */
export function ClickableText({
  text,
  context,
  knownForms = [],
  className,
  as: Tag = "p",
}: {
  text: string;
  context: SaveContext;
  /** Normalised forms (lower-case) that are already in the learner's deck. */
  knownForms?: string[];
  className?: string;
  as?: "p" | "span" | "div";
}) {
  const [target, setTarget] = useState<PopoverTarget | null>(null);
  const [known, setKnown] = useState(() => new Set(knownForms));
  const [active, setActive] = useState(0);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const tokens = useMemo(() => {
    let offset = 0;
    let wordIndex = 0;
    return tokenize(text).map((t) => {
      const tok = { ...t, offset, wordIndex: t.isWord ? wordIndex++ : -1 };
      offset += t.text.length;
      return tok;
    });
  }, [text]);
  const wordCount = tokens.filter((t) => t.isWord).length;

  const open = useCallback(
    (word: string, offset: number, el: HTMLElement) => {
      setTarget({ word, sentence: sentenceAround(text, offset), rect: el.getBoundingClientRect(), returnFocus: el });
    },
    [text],
  );

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (e.key === "ArrowRight") next = Math.min(wordCount - 1, index + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, index - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = wordCount - 1;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <>
      <Tag className={cn("whitespace-pre-line", className)} lang="nl">
        {tokens.map((t, i) =>
          t.isWord ? (
            <button
              key={i}
              ref={(el) => { refs.current[t.wordIndex] = el; }}
              type="button"
              tabIndex={t.wordIndex === active ? 0 : -1}
              onClick={(e) => { setActive(t.wordIndex); setOpenIndex(t.wordIndex); open(t.text, t.offset, e.currentTarget); }}
              onKeyDown={(e) => onKeyDown(e, t.wordIndex)}
              className={cn(
                "inline cursor-pointer rounded-sm px-0 text-inherit hover:bg-primary-soft focus-visible:bg-primary-soft",
                known.has(normalizeWord(t.text)) && "underline decoration-primary/40 decoration-dotted underline-offset-4",
                target && openIndex === t.wordIndex && "bg-primary-soft",
              )}
            >
              {t.text}
            </button>
          ) : (
            <Fragment key={i}>{t.text}</Fragment>
          ),
        )}
      </Tag>
      {target && (
        <WordPopover
          key={`${target.word}-${target.rect.top}`}
          target={target}
          context={context}
          onClose={() => setTarget(null)}
          onSaved={(form) => setKnown((s) => new Set(s).add(normalizeWord(form)))}
        />
      )}
    </>
  );
}
