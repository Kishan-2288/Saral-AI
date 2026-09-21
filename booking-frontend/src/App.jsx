import { useEffect, useMemo, useState } from 'react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1').replace(/\/$/, '')

function getToken() {
  const parts = window.location.pathname.split('/').filter(Boolean)
  const bookIndex = parts.indexOf('book')
  return bookIndex >= 0 ? parts[bookIndex + 1] : null
}

function money(value, currency = 'INR') {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function formatTime(value) {
  if (!value) return '—'
  const [hours, minutes] = value.split(':').map(Number)
  const d = new Date()
  d.setHours(hours, minutes, 0, 0)
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}

function App() {
  const token = useMemo(getToken, [])
  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState(null)
  const [paymentError, setPaymentError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('This booking link is invalid.')
      setLoading(false)
      return
    }

    fetch(`${API_URL}/booking/${encodeURIComponent(token)}`)
      .then(async (response) => {
        const data = await response.json().catch(() => ({}))
        if (!response.ok) throw new Error(data.detail || 'Unable to load this booking.')
        return data
      })
      .then(setBooking)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [token])

  async function createOrder() {
    const response = await fetch(`${API_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_token: token }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.detail || 'Unable to create payment order.')
    return data
  }

  async function verifyPayment(order, response) {
    const result = await fetch(`${API_URL}/payments/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        booking_token: token,
        razorpay_order_id: order.order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      }),
    })
    const data = await result.json().catch(() => ({}))
    if (!result.ok) throw new Error(data.detail || 'Payment verification failed.')
    return data
  }

  async function confirmFreeBooking() {
    const response = await fetch(`${API_URL}/payments/confirm-free`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_token: token }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.detail || 'Unable to confirm the appointment.')
    return data
  }

  async function handlePay() {
    if (!booking || paying) return
    setPaying(true)
    setPaymentError('')

    try {
      const amount = Number(booking.amount || 0)

      if (amount <= 0) {
        const result = await confirmFreeBooking()
        setSuccess(result)
        return
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout could not be loaded. Please refresh and try again.')
      }

      const order = await createOrder()

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Saral AI',
        description: `${booking.doctor?.name || 'Doctor'} consultation`,
        order_id: order.order_id,
        prefill: {
          name: booking.patient?.name || '',
          email: booking.patient?.email || '',
          contact: booking.patient?.phone || '',
        },
        notes: {
          booking_token: token,
        },
        theme: {
          color: '#050505',
        },
        handler: async (response) => {
          try {
            const result = await verifyPayment(order, response)
            setSuccess(result)
          } catch (err) {
            setPaymentError(err.message)
          } finally {
            setPaying(false)
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on('payment.failed', (response) => {
        setPaymentError(response?.error?.description || 'Payment failed. Please try again.')
        setPaying(false)
      })
      razorpay.open()
    } catch (err) {
      setPaymentError(err.message)
      setPaying(false)
    }
  }

  if (loading) return <PageShell><Loading /></PageShell>
  if (error) return <PageShell><ErrorState message={error} /></PageShell>
  if (success) return <PageShell><SuccessState booking={booking} result={success} /></PageShell>
  if (!booking) return <PageShell><ErrorState message="Booking information is unavailable." /></PageShell>

  const amount = Number(booking.amount || 0)
  const expired = booking.expires_at && new Date(booking.expires_at) <= new Date()
  const unavailable = booking.slot && booking.slot.available === false

  return (
    <PageShell>
      <main className="booking-page">
        <div className="topbar">
          <div className="brand">saral<span>.</span></div>
          <div className="secure">Secure appointment booking</div>
        </div>

        <section className="hero">
          <div className="eyebrow">APPOINTMENT CONFIRMATION</div>
          <h1>Complete your booking.</h1>
          <p>Review your appointment details and continue to secure your slot.</p>
        </section>

        <section className="grid">
          <div className="card details-card">
            <div className="card-heading">
              <div>
                <span className="label">Hospital</span>
                <h2>{booking.hospital?.name || 'Hospital'}</h2>
              </div>
              <span className="status-pill">Slot held</span>
            </div>

            <div className="doctor-block">
              <div className="avatar">{(booking.doctor?.name || 'D').charAt(0).toUpperCase()}</div>
              <div>
                <h3>{booking.doctor?.name || 'Doctor'}</h3>
                <p>{booking.doctor?.specialization || booking.department?.name || 'Consultation'}</p>
              </div>
            </div>

            <div className="detail-grid">
              <Detail label="Date" value={formatDate(booking.slot?.date)} />
              <Detail label="Time" value={formatTime(booking.slot?.start_time || booking.slot?.time)} />
              <Detail label="Patient" value={booking.patient?.name || '—'} />
              <Detail label="Phone" value={booking.patient?.phone || '—'} />
            </div>

            {booking.patient?.reason_for_visit && (
              <div className="reason">
                <span className="label">Reason for visit</span>
                <p>{booking.patient.reason_for_visit}</p>
              </div>
            )}

            {booking.expires_at && (
              <div className="expiry">
                This booking link expires at {new Date(booking.expires_at).toLocaleString('en-IN')}.
              </div>
            )}
          </div>

          <aside className="card payment-card">
            <span className="label">Payment</span>
            <h2>{amount > 0 ? money(amount, booking.currency) : 'No payment required'}</h2>
            <p className="muted">Consultation fee</p>

            <div className="line" />
            <div className="price-row"><span>Consultation</span><strong>{money(amount, booking.currency)}</strong></div>
            <div className="price-row total"><span>Total</span><strong>{money(amount, booking.currency)}</strong></div>

            {paymentError && <div className="alert error">{paymentError}</div>}

            {expired ? (
              <button className="primary disabled" disabled>Booking link expired</button>
            ) : unavailable ? (
              <button className="primary disabled" disabled>Slot unavailable</button>
            ) : (
              <button className="primary" onClick={handlePay} disabled={paying}>
                {paying ? 'Processing…' : amount > 0 ? `Confirm & Pay ${money(amount, booking.currency)}` : 'Confirm appointment'}
              </button>
            )}

            <p className="payment-note">Your payment is processed securely by Razorpay. Saral does not store your card or UPI credentials.</p>
          </aside>
        </section>

        <footer>Powered by Saral AI · Secure healthcare automation</footer>
      </main>
    </PageShell>
  )
}

function Detail({ label, value }) {
  return <div className="detail"><span className="label">{label}</span><strong>{value}</strong></div>
}

function PageShell({ children }) {
  return <div className="app-shell">{children}</div>
}

function Loading() {
  return <div className="center-state"><div className="spinner" /><h2>Loading your booking</h2><p>Please wait while we retrieve the appointment details.</p></div>
}

function ErrorState({ message }) {
  return <div className="center-state"><div className="error-icon">!</div><h2>We couldn't open this booking</h2><p>{message}</p><a href="/" className="secondary">Return home</a></div>
}

function SuccessState({ booking, result }) {
  return (
    <div className="center-state success-state">
      <div className="success-icon">✓</div>
      <div className="eyebrow">BOOKING CONFIRMED</div>
      <h1>Your appointment is confirmed.</h1>
      <p>We have securely recorded your appointment{booking?.hospital?.name ? ` at ${booking.hospital.name}` : ''}.</p>
      <div className="success-card">
        <Detail label="Appointment ID" value={result.appointment_id || 'Confirmed'} />
        <Detail label="Doctor" value={booking?.doctor?.name || '—'} />
        <Detail label="Date" value={formatDate(booking?.slot?.date)} />
        <Detail label="Time" value={formatTime(booking?.slot?.start_time || booking?.slot?.time)} />
      </div>
      <p className="muted">A confirmation message will be sent through WhatsApp when the hospital workflow completes.</p>
    </div>
  )
}

export default App
