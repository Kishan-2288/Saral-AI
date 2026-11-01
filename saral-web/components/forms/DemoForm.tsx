"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { demoFormSchema, type DemoApiResponse, type DemoFormValues } from "@/lib/schemas";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icons";
import type { Dictionary } from "@/content/types";

type Turnstile = {
  render: (el: HTMLElement, o: { sitekey: string; callback: (t: string) => void; "expired-callback": () => void; "error-callback": () => void; theme?: string }) => string;
  reset: (id?: string) => void;
};
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";
const IS_PROD = process.env.NODE_ENV === "production";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "ok"; leadId?: string };

/**
 * Demo request form. Rules: success is shown ONLY after the server confirms; any failure shows a clear error and a retry;
 * nothing is stored in the browser; no patient data is asked for.
 */
export default function DemoForm({ t }: { t: Dictionary["form"] }) {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [token, setToken] = useState("");
  const [captchaErr, setCaptchaErr] = useState(false);
  const widget = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const needsCaptcha = Boolean(SITE_KEY);
  const captchaBroken = !SITE_KEY && IS_PROD;

  const { register, handleSubmit, formState: { errors } } = useForm<DemoFormValues>({
    resolver: zodResolver(demoFormSchema),
    defaultValues: { name: "", email: "", phone: "", organization: "", industry: "", monthlyConversations: "", primaryChallenge: "" },
  });
  const [honeypot, setHoneypot] = useState("");

  const mount = useCallback(() => {
    const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (!ts || !widget.current || widgetId.current !== undefined || !SITE_KEY) return;
    widgetId.current = ts.render(widget.current, { sitekey: SITE_KEY, theme: "auto", callback: (tk) => { setToken(tk); setCaptchaErr(false); }, "expired-callback": () => setToken(""), "error-callback": () => setToken("") });
  }, []);
  useEffect(() => { mount(); }, [mount]);

  const resetCaptcha = () => {
    setToken("");
    const ts = (window as unknown as { turnstile?: Turnstile }).turnstile;
    if (ts && widgetId.current !== undefined) ts.reset(widgetId.current);
  };

  const onSubmit = async (values: DemoFormValues) => {
    if (needsCaptcha && !token) { setCaptchaErr(true); return; }
    setStatus({ kind: "sending" });
    const { consent: _consent, ...payload } = values; void _consent;
    try {
      const res = await fetch("/api/demo-request", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, turnstileToken: token, website: honeypot }),
      });
      let data: DemoApiResponse | null = null;
      try { data = (await res.json()) as DemoApiResponse; } catch { /* non-JSON error page */ }
      if (res.ok && data && data.ok) {
        track("demo_form_submit");
        setStatus({ kind: "ok", leadId: data.leadId });
        return;
      }
      const code = data && !data.ok ? data.error : "unknown";
      setStatus({ kind: "error", message: t.server[code] ?? t.server.unknown });
    } catch {
      setStatus({ kind: "error", message: t.server.network });
    }
    resetCaptcha();
  };

  if (status.kind === "ok") {
    return (
      <div role="status" className="card p-8">
        <span className="text-[var(--primary)]"><Icon name="checkCircle" size={36} /></span>
        <h2 className="h2 mt-4 !text-3xl">{t.successTitle}</h2>
        <p className="muted mt-3">{t.successText}</p>
        {status.leadId && <p className="muted mt-4 text-sm">{t.reference}: <span className="font-mono">{status.leadId}</span></p>}
      </div>
    );
  }

  const sending = status.kind === "sending";
  const err = (k?: string) => (k ? t.errors[k as keyof typeof t.errors] : undefined);
  const field = "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-base text-[var(--text)] placeholder:text-[var(--text-muted)] focus-visible:border-[var(--primary)]";
  const Label = ({ id, children }: { id: string; children: React.ReactNode }) => (<label htmlFor={id} className="mb-2 block text-sm font-semibold">{children}</label>);
  const Err = ({ id, k }: { id: string; k?: string }) => (k ? <p id={`${id}-err`} role="alert" className="mt-2 text-sm text-[var(--handoff-text)]">{err(k)}</p> : null);
  const a11y = (id: string, k?: string) => ({ "aria-invalid": k ? true : undefined, "aria-describedby": k ? `${id}-err` : undefined });

  return (
    <>
      {SITE_KEY && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={mount} />}
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="card grid gap-6 p-6 md:p-8" aria-describedby="privacy-note">
        <p id="privacy-note" className="muted m-0 flex items-start gap-2 text-sm"><Icon name="shield" size={18} />{t.privacyNote}</p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div><Label id="name">{t.labels.name}</Label><input id="name" autoComplete="name" className={field} placeholder={t.placeholders.name} {...register("name")} {...a11y("name", errors.name?.message)} /><Err id="name" k={errors.name?.message} /></div>
          <div><Label id="email">{t.labels.email}</Label><input id="email" type="email" autoComplete="email" className={field} placeholder={t.placeholders.email} {...register("email")} {...a11y("email", errors.email?.message)} /><Err id="email" k={errors.email?.message} /></div>
          <div><Label id="phone">{t.labels.phone}</Label><input id="phone" type="tel" autoComplete="tel" inputMode="tel" className={field} placeholder={t.placeholders.phone} {...register("phone")} {...a11y("phone", errors.phone?.message)} /><Err id="phone" k={errors.phone?.message} /></div>
          <div><Label id="organization">{t.labels.organization}</Label><input id="organization" autoComplete="organization" className={field} placeholder={t.placeholders.organization} {...register("organization")} {...a11y("organization", errors.organization?.message)} /><Err id="organization" k={errors.organization?.message} /></div>
          <div>
            <Label id="industry">{t.labels.industry}</Label>
            <select id="industry" className={field} defaultValue="" {...register("industry")} {...a11y("industry", errors.industry?.message)}>
              <option value="" disabled>—</option>
              {t.industries.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <Err id="industry" k={errors.industry?.message} />
          </div>
          <div>
            <Label id="monthlyConversations">{t.labels.volume}</Label>
            <select id="monthlyConversations" className={field} defaultValue="" {...register("monthlyConversations")} {...a11y("monthlyConversations", errors.monthlyConversations?.message)}>
              <option value="" disabled>—</option>
              {t.volumes.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
            </select>
            <Err id="monthlyConversations" k={errors.monthlyConversations?.message} />
          </div>
        </div>

        <div>
          <Label id="primaryChallenge">{t.labels.challenge}</Label>
          <textarea id="primaryChallenge" rows={4} className={field} placeholder={t.placeholders.challenge} {...register("primaryChallenge")} {...a11y("primaryChallenge", errors.primaryChallenge?.message)} />
          <Err id="primaryChallenge" k={errors.primaryChallenge?.message} />
        </div>

        {/* Honeypot: hidden from people and assistive tech; bots fill it */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} name="website" /></label>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 h-5 w-5 accent-[var(--primary)]" {...register("consent")} {...a11y("consent", errors.consent?.message)} />
            <span>{t.labels.consent}</span>
          </label>
          <Err id="consent" k={errors.consent?.message} />
        </div>

        {needsCaptcha && <div><div ref={widget} /><Err id="captcha" k={captchaErr ? "captcha" : undefined} /></div>}
        {captchaBroken && <p role="alert" className="m-0 text-sm text-[var(--handoff-text)]">{t.captchaMissing}</p>}

        {status.kind === "error" && (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--handoff)] bg-[var(--handoff-soft)] p-4 text-sm">
            <span className="flex items-start gap-2"><Icon name="alert" size={18} />{status.message}</span>
            <button type="button" className="btn btn-secondary !min-h-10 !px-4" onClick={() => { setStatus({ kind: "idle" }); }}>{t.retry}</button>
          </div>
        )}

        <div><button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={sending || captchaBroken}>{sending ? t.submitting : t.submit}</button></div>
      </form>
    </>
  );
}
