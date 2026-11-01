"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { m } from "framer-motion";
import { Icon } from "@/components/ui/Icons";
import { track } from "@/lib/analytics";
import type { ChatMsg, Dictionary } from "@/content/types";

type Item = { id: number } & ({ kind: "msg"; msg: ChatMsg } | { kind: "handoff" } | { kind: "typing" });

/**
 * Scripted WhatsApp-style demo. Everything runs in the browser: no network calls, no data collected.
 * No medical advice is ever given: clinical and emergency prompts end in a human handoff.
 */
export default function ChatDemo({ t }: { t: Dictionary["chat"] }) {
  const intro = useCallback((id: number): Item => ({ id, kind: "msg", msg: { from: "bot", text: t.intro } }), [t.intro]);
  const nextId = useRef(2);
  const timers = useRef<number[]>([]);
  const started = useRef(false);
  const log = useRef<HTMLDivElement>(null);
  const [flowIdx, setFlowIdx] = useState(0);
  const [turn, setTurn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Item[]>(() => [intro(1)]);
  const [reduce, setReduce] = useState(false);

  const flow = t.flows[flowIdx];
  const current = flow.turns[turn];

  useEffect(() => { setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches); }, []);
  useEffect(() => () => timers.current.forEach(window.clearTimeout), []);
  useEffect(() => {
    log.current?.scrollTo({ top: log.current.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [items, reduce]);

  const later = (ms: number, fn: () => void) => { timers.current.push(window.setTimeout(fn, ms)); };
  const clearTimers = () => { timers.current.forEach(window.clearTimeout); timers.current = []; };

  const choose = (i: number) => {
    clearTimers();
    setFlowIdx(i); setTurn(0); setBusy(false);
    setItems([intro(nextId.current++)]);
  };

  const send = () => {
    if (busy || !current) return;
    if (!started.current) { started.current = true; track("chat_demo_started"); }
    setBusy(true);
    setItems((prev) => [...prev, { id: nextId.current++, kind: "msg", msg: current.patient }]);
    const typingMs = reduce ? 150 : 800;
    let at = reduce ? 100 : 350;
    for (const rep of current.replies) {
      if ("event" in rep) {
        later(at, () => setItems((p) => [...p, { id: nextId.current++, kind: "handoff" }]));
        at += reduce ? 100 : 700;
      } else {
        later(at, () => setItems((p) => [...p, { id: nextId.current++, kind: "typing" }]));
        at += typingMs;
        later(at, () => setItems((p) => [...p.filter((x) => x.kind !== "typing"), { id: nextId.current++, kind: "msg", msg: rep }]));
        at += 250;
      }
    }
    later(at + 50, () => {
      setBusy(false);
      setTurn((n) => n + 1);
      if (turn + 1 >= flow.turns.length) track("chat_demo_completed", { flow: flow.id });
    });
  };

  const done = turn >= flow.turns.length;

  return (
    <div className="w-full max-w-[420px]">
      <div role="group" aria-label={t.flowsLabel} className="mb-4 flex flex-wrap gap-2">
        {t.flows.map((f, i) => (
          <button key={f.id} type="button" aria-pressed={i === flowIdx} onClick={() => choose(i)}
            className="rounded-full border px-4 py-2 text-sm font-semibold transition-colors"
            style={i === flowIdx
              ? { background: "var(--primary-soft)", borderColor: "var(--primary)", color: "var(--primary-ink)" }
              : { borderColor: "var(--border)", color: "var(--text-muted)" }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden shadow-[var(--shadow)]" style={{ borderRadius: 32 }}>
        <div className="flex items-center gap-3 border-b border-[var(--border)] bg-[var(--surface)] px-5 py-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--on-primary)]"><Icon name="message" size={20} /></span>
          <div className="min-w-0 flex-1">
            <p className="m-0 font-[family-name:var(--font-display)] text-[0.95rem] font-semibold leading-tight">{t.clinicName}</p>
            <p className="muted m-0 text-xs">{t.online}</p>
          </div>
          <span className="rounded-full bg-[var(--handoff-soft)] px-3 py-1 text-xs font-semibold text-[var(--handoff-text)]">{t.sampleData}</span>
        </div>

        <div ref={log} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0} aria-label={t.title} data-lenis-prevent
          className="flex h-[420px] flex-col gap-3 overflow-y-auto bg-[var(--surface-2)] px-4 py-5">
          {items.map((it) => {
            if (it.kind === "typing") {
              return (
                <m.div key={it.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex w-fit items-center gap-1.5 rounded-2xl rounded-bl-md border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <span className="dot" /><span className="dot" /><span className="dot" /><span className="sr-only">{t.typing}</span>
                </m.div>
              );
            }
            if (it.kind === "handoff") {
              return (
                <m.div key={it.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                  className="mx-auto inline-flex items-center gap-2 rounded-full bg-[var(--handoff-soft)] px-4 py-1.5 text-sm font-semibold text-[var(--handoff-text)]">
                  <Icon name="person" size={16} />{t.handoffBadge}
                </m.div>
              );
            }
            const { msg } = it;
            const mine = msg.from === "patient";
            const staff = msg.from === "staff";
            const alert = msg.kind === "alert";
            return (
              <m.div key={it.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className={`flex max-w-[86%] flex-col ${mine ? "items-end self-end" : "items-start self-start"}`}>
                <span className="sr-only">{mine ? "Patient: " : staff ? `${t.clinicName}: ` : `${t.assistantName}: `}</span>
                <div className={`rounded-2xl px-4 py-3 text-[0.95rem] leading-snug ${mine ? "rounded-br-md" : "rounded-bl-md"}`}
                  style={mine
                    ? { background: "var(--primary)", color: "var(--on-primary)" }
                    : alert
                      ? { background: "var(--handoff-soft)", border: "1px solid var(--handoff)", color: "var(--text)" }
                      : staff
                        ? { background: "var(--handoff-soft)", color: "var(--text)" }
                        : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>
                  {alert && <span className="mb-1 flex items-center gap-1.5 text-xs font-bold text-[var(--handoff-text)]"><Icon name="alert" size={14} />{t.alertLabel}</span>}
                  {staff && <span className="mb-1 block text-xs font-bold text-[var(--handoff-text)]">{t.clinicName}</span>}
                  {msg.kind === "voice" ? (
                    <span className="flex items-center gap-3">
                      <Icon name="play" size={18} />
                      <span aria-hidden="true" className="flex h-5 items-center gap-[3px]">
                        {[8, 14, 10, 18, 12, 20, 9, 16, 11, 15, 7, 13].map((h, i) => (<span key={i} className="w-[3px] rounded-full bg-current opacity-80" style={{ height: h }} />))}
                      </span>
                      <span className="text-sm tabular-nums">{msg.voiceLength}</span>
                    </span>
                  ) : msg.text}
                  {msg.buttons && (
                    <span className="mt-3 flex flex-wrap gap-2" aria-hidden="true">
                      {msg.buttons.map((b) => (<span key={b} className="rounded-full border border-[var(--border)] px-3 py-1 text-sm font-semibold text-[var(--primary)]">{b}</span>))}
                    </span>
                  )}
                </div>
                {msg.kind === "voice" && <span className="muted mt-1 max-w-[18rem] text-xs italic">“{msg.text}”</span>}
              </m.div>
            );
          })}
        </div>

        <div className="border-t border-[var(--border)] bg-[var(--surface)] p-4">
          {done ? (
            <button type="button" className="btn btn-secondary w-full" onClick={() => choose(flowIdx)}>{t.replay}</button>
          ) : (
            <button type="button" disabled={busy} onClick={send}
              className="flex w-full items-center justify-between gap-3 rounded-full border border-[var(--primary)] bg-[var(--primary-soft)] px-5 py-3 text-left text-[0.95rem] font-semibold text-[var(--text)] transition-colors hover:bg-[var(--surface-2)] disabled:opacity-50">
              <span>{current.prompt}</span>
              <span className="shrink-0 text-xs font-bold text-[var(--primary-ink)]">{t.tapToSend}</span>
            </button>
          )}
        </div>
      </div>
      <p className="muted mt-4 text-sm">{t.notice}</p>
    </div>
  );
}
