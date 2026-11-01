"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icons";

// Uses the public booking-link contract: GET /api/v1/booking/{token}, then payment endpoints.
type BookingSessionData = {
  booking_token: string;
  hospital: { name: string } | null;
  doctor: { name: string; specialization?: string | null } | null;
  department?: { name: string } | null;
  slot: { date: string; time: string } | null;
  patient: { name: string | null; phone: string | null; email?: string | null };
  amount: number | null;
  currency: string;
  status: string;
  expires_at: string;
};
type RazorpayResponse = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayCtor = new (o: {
  key: string; amount: number; currency: string; name: string; description: string; order_id: string;
  handler: (r: RazorpayResponse) => void | Promise<void>; modal?: { ondismiss?: () => void };
}) => { open: () => void };

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--border)]">
        <div className="container-x flex h-16 items-center">
          <Link href="/" className="inline-flex items-center" aria-label="Saral AI">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-light" src="/brand/saral-logo-light.svg" alt="" height={28} style={{ height: 28 }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="logo-dark" src="/brand/saral-logo-dark.svg" alt="" height={28} style={{ height: 28 }} />
          </Link>
        </div>
      </header>
      <main id="main" className="container-x py-14 md:py-20">{children}</main>
    </div>
  );
}

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="card p-5"><p className="muted m-0 text-sm">{label}</p><p className="m-0 mt-1 font-semibold">{value}</p></div>
);

export default function BookingSession({ token }: { token: string }) {
  const [session, setSession] = useState<BookingSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/v1/booking/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || "Unable to load booking session.");
        setSession(data);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  const pay = async () => {
    if (!session) return;
    setPaying(true);
    setError("");
    try {
      const orderResponse = await fetch("/api/v1/payments/create-order", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_token: token }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.detail || "Unable to create payment order.");

      const Razorpay = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
      if (!Razorpay) throw new Error("Payment checkout is unavailable. Please reload and try again.");

      new Razorpay({
        key: order.key_id, amount: order.amount, currency: order.currency,
        name: session.hospital?.name || "Saral AI", description: "Appointment consultation", order_id: order.order_id,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch("/api/v1/payments/verify", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ booking_token: token, ...response }),
            });
            const result = await verifyResponse.json();
            if (!verifyResponse.ok) throw new Error(result.detail || "Payment verification failed.");
            setConfirmed(true);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Payment verification failed.");
            setPaying(false);
          }
        },
        modal: { ondismiss: () => setPaying(false) },
      }).open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed.");
      setPaying(false);
    }
  };

  if (loading) return <Shell><p role="status" className="muted flex items-center justify-center gap-3"><Icon name="loader" className="animate-spin" />Loading</p></Shell>;
  if (error && !session) return <Shell><div role="alert" className="mx-auto max-w-xl card p-8 text-center"><span className="text-[var(--handoff-text)]"><Icon name="alert" size={32} /></span><h1 className="h3 mt-4">Booking link unavailable</h1><p className="muted mt-2">{error}</p></div></Shell>;
  if (!session) return null;

  if (confirmed) {
    return (
      <Shell>
        <div role="status" className="card mx-auto max-w-xl p-8 text-center">
          <span className="text-[var(--primary)]"><Icon name="checkCircle" size={48} /></span>
          <h1 className="h2 mt-5 !text-3xl">Appointment confirmed</h1>
          <p className="muted mt-3">Your payment was verified and your appointment is confirmed.</p>
          <p className="mt-6 font-semibold">{session.hospital?.name} · {session.doctor?.name}</p>
          <p className="muted mt-1">{session.slot?.date} · {session.slot?.time}</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="mx-auto max-w-3xl">
        <p className="muted m-0 text-sm font-semibold">Saral Booking</p>
        <h1 className="display mt-3 !text-4xl md:!text-5xl">Confirm your appointment</h1>
        <p className="lead mt-4">Review the details collected through WhatsApp before completing payment.</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <Detail label="Hospital" value={session.hospital?.name || "Unavailable"} />
          <Detail label="Doctor" value={session.doctor?.name || "Unavailable"} />
          <Detail label="Department" value={session.department?.name || session.doctor?.specialization || "General"} />
          <Detail label="Patient" value={session.patient.name || "Not provided"} />
          <Detail label="Date" value={session.slot?.date || "Not selected"} />
          <Detail label="Time" value={session.slot?.time || "Not selected"} />
        </div>
        <div className="mt-8 flex items-center justify-between rounded-2xl bg-[var(--text)] p-6 text-[var(--bg)]">
          <div><p className="m-0 text-sm opacity-70">Consultation fee</p><p className="m-0 mt-1 text-2xl font-semibold">{session.currency} {session.amount ?? 0}</p></div>
          <Icon name="clock" size={24} />
        </div>
        {error && <p role="alert" className="mt-5 rounded-xl border border-[var(--handoff)] bg-[var(--handoff-soft)] p-4 text-sm">{error}</p>}
        {!session.doctor || !session.slot || !session.patient.name ? (
          <p role="alert" className="mt-6 rounded-xl border border-[var(--handoff)] bg-[var(--handoff-soft)] p-4 text-sm">
            This booking link is waiting for appointment details. Please return to the WhatsApp conversation to complete your selections.
          </p>
        ) : (
        <button type="button" onClick={pay} disabled={paying || session.status !== "pending"} className="btn btn-primary mt-6 w-full !min-h-14">
          <Icon name="card" size={20} />{paying ? "Processing…" : "Pay and confirm"}
        </button>
        )}
        <p className="muted mt-4 text-center text-xs">This secure booking link expires at {new Date(session.expires_at).toLocaleString()}.</p>
      </div>
    </Shell>
  );
}
