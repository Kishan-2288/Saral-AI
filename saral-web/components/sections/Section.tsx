import type { ReactNode } from "react";

/** Every scroll scene is one of these: an anchor, a scene marker for the 3D rig, and a labelled landmark. */
export default function Section({ id, scene = true, className = "", children, tall }: { id: string; scene?: boolean; className?: string; children: ReactNode; tall?: boolean }) {
  return (
    <section id={id} data-scene={scene ? "" : undefined} aria-labelledby={`${id}-title`} className={`section ${tall ? "stage-tall" : ""} ${className}`}>
      {children}
    </section>
  );
}
