import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, CreditCard, LoaderCircle } from 'lucide-react';

type BookingSession = {
  token: string;
  hospital: { name: string } | null;
  doctor: { name: string; specialization?: string | null } | null;
  department?: { name: string } | null;
  appointment: { date: string; time: string };
  patient: { name: string; phone: string; email?: string | null };
  payment: { amount: number; currency: string; required: boolean };
  status: string;
  expires_at: string;
};

type RazorpayCheckout = new (options: {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
}) => { open: () => void };

type RazorpayWindow = Window & { Razorpay?: RazorpayCheckout };

export function BookingSessionPage({ token }: { token: string }) {
  const [session, setSession] = useState<BookingSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/v1/booking/session/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.detail || 'Unable to load booking session.');
        setSession(data);
      })
      .catch((exception) => setError(exception.message))
      .finally(() => setLoading(false));
  }, [token]);

  const pay = async () => {
    if (!session) return;
    setPaying(true);
    setError('');

    try {
      const orderResponse = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_token: token }),
      });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.detail || 'Unable to create payment order.');

      const Razorpay = (window as RazorpayWindow).Razorpay;
      if (!Razorpay) throw new Error('Payment checkout is unavailable. Please reload and try again.');

      new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: session.hospital?.name || 'Saral AI',
        description: 'Appointment consultation',
        order_id: order.order_id,
        handler: async (response) => {
          const verifyResponse = await fetch('/api/v1/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ booking_token: token, ...response }),
          });
          const result = await verifyResponse.json();
          if (!verifyResponse.ok) throw new Error(result.detail || 'Payment verification failed.');
          setConfirmed(true);
        },
      }).open();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Payment failed.');
      setPaying(false);
    }
  };

  if (loading) return <BookingShell><LoaderCircle className="mx-auto h-8 w-8 animate-spin text-neutral-400" /></BookingShell>;
  if (error) return <BookingShell><ErrorState message={error} /></BookingShell>;
  if (!session) return null;

  if (confirmed) return <BookingShell><div className="mx-auto max-w-xl rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm"><CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" /><h1 className="mt-5 text-3xl text-neutral-950">Appointment confirmed</h1><p className="mt-3 text-neutral-600">Your payment was verified and your appointment is confirmed.</p><p className="mt-6 font-medium text-neutral-950">{session.hospital?.name} · {session.doctor?.name}</p><p className="mt-2 text-sm text-neutral-500">{session.appointment.date} at {session.appointment.time}</p></div></BookingShell>;

  return <BookingShell>
    <div className="mx-auto max-w-3xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">Saral Booking</p>
      <h1 className="mt-4 text-4xl text-neutral-950">Confirm your appointment</h1>
      <p className="mt-3 text-neutral-600">Review the details collected through WhatsApp before completing payment.</p>
      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <Detail label="Hospital" value={session.hospital?.name || 'Unavailable'} />
        <Detail label="Doctor" value={session.doctor?.name || 'Unavailable'} />
        <Detail label="Department" value={session.department?.name || session.doctor?.specialization || 'General'} />
        <Detail label="Patient" value={session.patient.name} />
        <Detail label="Date" value={session.appointment.date} />
        <Detail label="Time" value={session.appointment.time} />
      </div>
      <div className="mt-8 flex items-center justify-between rounded-2xl bg-neutral-950 p-6 text-white"><div><p className="text-sm text-neutral-400">Consultation fee</p><p className="mt-1 text-2xl font-semibold">{session.payment.currency} {session.payment.amount}</p></div><Clock3 className="h-6 w-6 text-neutral-400" /></div>
      {error && <p className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      <button onClick={pay} disabled={paying || session.status !== 'pending'} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-semibold text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300"><CreditCard className="h-4 w-4" />{paying ? 'Opening secure checkout...' : 'Confirm & Pay'}</button>
      <p className="mt-4 text-center text-xs text-neutral-500">This secure booking link expires at {new Date(session.expires_at).toLocaleString()}.</p>
    </div>
  </BookingShell>;
}

function BookingShell({ children }: { children: ReactNode }) { return <main className="min-h-screen bg-neutral-50 px-6 py-16 md:px-12 md:py-24">{children}</main>; }
function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-neutral-200 bg-white p-5"><p className="text-xs uppercase tracking-[0.16em] text-neutral-400">{label}</p><p className="mt-2 font-medium text-neutral-900">{value}</p></div>; }
function ErrorState({ message }: { message: string }) { return <div className="mx-auto max-w-xl rounded-3xl border border-red-200 bg-white p-8 text-center"><h1 className="text-2xl text-neutral-950">Booking unavailable</h1><p className="mt-3 text-red-700">{message}</p></div>; }
