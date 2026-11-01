import type { ReactNode } from "react";

export default function PageHero({ title, lead, children }: { title: string; lead?: string; children?: ReactNode }) {
  return (
    <section className="section-sm pt-[calc(4rem+clamp(48px,8vw,112px))]">
      <div className="container-x">
        <h1 className="display max-w-4xl">{title}</h1>
        {lead && <p className="lead mt-6">{lead}</p>}
        {children && <div className="mt-10 flex flex-wrap gap-4">{children}</div>}
      </div>
    </section>
  );
}
