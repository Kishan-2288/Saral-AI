import Section from "./Section";
import { Icon } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

const STATUS_STYLE: Record<number, React.CSSProperties> = {
  0: { background: "var(--primary-soft)", color: "var(--primary-ink)" },
  1: { background: "var(--primary-soft)", color: "var(--primary-ink)" },
  2: { background: "var(--handoff-soft)", color: "var(--handoff-text)" },
  3: { background: "var(--surface-2)", color: "var(--text-muted)" },
};

/** ILLUSTRATIVE mockup with sample data. It is labelled as such on screen and in the markup. */
export default function Dashboard({ t }: { t: Dictionary["dashboard"] }) {
  return (
    <Section id="dashboard">
      <div className="container-x">
        <h2 id="dashboard-title" className="h2 max-w-2xl" data-reveal>{t.title}</h2>
        <p className="lead mt-6" data-reveal>{t.lead}</p>
        <figure className="m-0 mt-12" data-reveal>
          <div className="card overflow-hidden shadow-[var(--shadow)]" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" /><i className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" /><i className="h-2.5 w-2.5 rounded-full bg-[var(--border)]" /></span>
              <span className="rounded-full bg-[var(--handoff-soft)] px-3 py-1 text-xs font-bold text-[var(--handoff-text)]">{t.badge}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[0.95rem]">
                <caption className="sr-only">{t.badge}</caption>
                <thead>
                  <tr className="muted border-b border-[var(--border)] text-sm">
                    <th scope="col" className="px-6 py-3 font-semibold">{t.columns.time}</th>
                    <th scope="col" className="px-6 py-3 font-semibold">{t.columns.patient}</th>
                    <th scope="col" className="px-6 py-3 font-semibold">{t.columns.doctor}</th>
                    <th scope="col" className="px-6 py-3 font-semibold">{t.columns.status}</th>
                  </tr>
                </thead>
                <tbody>
                  {t.rows.map((r, i) => (
                    <tr key={r.time} className="border-b border-[var(--border)] last:border-0">
                      <td className="px-6 py-4 tabular-nums">{r.time}</td>
                      <td className="px-6 py-4">{r.patient}</td>
                      <td className="px-6 py-4">{r.doctor}</td>
                      <td className="px-6 py-4"><span className="rounded-full px-3 py-1 text-sm font-semibold" style={STATUS_STYLE[i]}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 border-t border-[var(--border)] bg-[var(--handoff-soft)] px-6 py-4 text-sm font-semibold text-[var(--handoff-text)]">
              <Icon name="person" size={18} />{t.handoffRow}
            </div>
          </div>
          <figcaption className="muted mt-4 text-sm">{t.caption}</figcaption>
        </figure>
      </div>
    </Section>
  );
}
