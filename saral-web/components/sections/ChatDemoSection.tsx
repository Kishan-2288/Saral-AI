import Section from "./Section";
import ChatDemo from "@/components/chat-demo/ChatDemo";
import type { Dictionary } from "@/content/types";

export default function ChatDemoSection({ t }: { t: Dictionary["chat"] }) {
  return (
    <Section id="chat">
      <div className="container-x grid items-center gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <h2 id="chat-title" className="h2" data-reveal>{t.title}</h2>
          <p className="lead mt-6" data-reveal>{t.lead}</p>
        </div>
        <div className="md:col-span-7 md:justify-self-end"><ChatDemo t={t} /></div>
      </div>
    </Section>
  );
}
