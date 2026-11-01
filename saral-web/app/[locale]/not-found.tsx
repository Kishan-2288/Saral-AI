import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import PageHero from "@/components/ui/PageHero";

export const metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  // The locale isn't available to not-found; the page shows both languages so it is useful either way.
  const en = getDictionary("en").pages.notFound;
  const hi = getDictionary("hi").pages.notFound;
  return (
    <>
      <PageHero title={en.title} lead={en.text}>
        <Link href="/" className="btn btn-primary">{en.back}</Link>
        <Link href="/hi" className="btn btn-secondary" lang="hi">{hi.back}</Link>
      </PageHero>
    </>
  );
}
