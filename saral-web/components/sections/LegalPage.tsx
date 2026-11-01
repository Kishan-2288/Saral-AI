import PageHero from "@/components/ui/PageHero";
import type { LegalSection } from "@/content/legal";

export default function LegalPage({ title, sections, notice }: { title: string; sections: LegalSection[]; notice: string }) {
  return (
    <>
      <PageHero title={title} />
      <section className="section-sm pt-0">
        <div className="container-x max-w-3xl">
          <p className="rounded-2xl border border-[var(--handoff)] bg-[var(--handoff-soft)] p-4 text-sm font-semibold text-[var(--handoff-text)]" role="note">{notice}</p>
          {sections.map((s) => (
            <section key={s.title} className="mt-10">
              <h2 className="h3">{s.title}</h2>
              {s.body.map((p, i) => (<p key={i} className="muted mt-3">{p}</p>))}
            </section>
          ))}
        </div>
      </section>
    </>
  );
}
