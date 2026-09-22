import { useEffect, useMemo, useState } from 'react'

const API_URL = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001/api/v1'
).replace(/\/$/, '')

function getToken() {
  const parts = window.location.pathname.split('/').filter(Boolean)

  const bookIndex = parts.indexOf('book')

  if (bookIndex !== -1 && parts[bookIndex + 1]) {
    return parts[bookIndex + 1]
  }

  // Also support /TOKEN
  return parts[0] || null
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

  const date = new Date()
  date.setHours(hours, minutes, 0, 0)

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function todayISO() {
  const date = new Date()

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

async function loadRazorpayScript() {
  if (window.Razorpay) {
    return true
  }

  return new Promise((resolve) => {
    const script = document.createElement('script')

    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)

    document.body.appendChild(script)
  })
}

export default function App() {
  const token = getToken()

  const [booking, setBooking] = useState(null)

  const [departments, setDepartments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [slots, setSlots] = useState([])

  const [loading, setLoading] = useState(true)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [loadingDoctors, setLoadingDoctors] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(null)

  const [processing, setProcessing] = useState(false)

  const [form, setForm] = useState({
    department_id: '',
    doctor_id: '',
    appointment_date: '',
    slot_id: '',
    patient_name: '',
    patient_phone: '',
    patient_email: '',
    reason_for_visit: '',
  })

  /*
   * ------------------------------------------------------------
   * LOAD BOOKING LINK
   * ------------------------------------------------------------
   */

  useEffect(() => {
    async function loadBooking() {
      if (!token) {
        setError('Booking link is missing or invalid.')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError('')

        const response = await fetch(
          `${API_URL}/booking/${encodeURIComponent(token)}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.detail || data?.message || 'Unable to load booking.'
          )
        }

        setBooking(data)

        /*
         * If the booking link already contains information,
         * pre-fill it.
         */
        setForm((previous) => ({
          ...previous,

          department_id:
            data?.department?.id ||
            data?.department_id ||
            previous.department_id,

          doctor_id:
            data?.doctor?.id ||
            data?.doctor_id ||
            previous.doctor_id,

          appointment_date:
            data?.slot?.date ||
            data?.appointment_date ||
            previous.appointment_date,

          slot_id:
            data?.slot?.id ||
            data?.slot_id ||
            previous.slot_id,

          patient_name:
            data?.patient?.full_name ||
            data?.patient?.name ||
            data?.patient_name ||
            previous.patient_name,

          patient_phone:
            data?.patient?.phone ||
            data?.patient_phone ||
            previous.patient_phone,

          patient_email:
            data?.patient?.email ||
            data?.patient_email ||
            previous.patient_email,

          reason_for_visit:
            data?.patient?.reason_for_visit ||
            data?.reason_for_visit ||
            previous.reason_for_visit,
        }))
      } catch (err) {
        setError(err.message || 'Unable to load booking.')
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [token])

  /*
   * ------------------------------------------------------------
   * LOAD DEPARTMENTS
   * ------------------------------------------------------------
   */

  useEffect(() => {
    async function loadDepartments() {
      const hospitalId = booking?.hospital?.id

      if (!hospitalId) return

      try {
        setLoadingDepartments(true)

        const response = await fetch(
          `${API_URL}/departments/?hospital_id=${encodeURIComponent(
            hospitalId
          )}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.detail || 'Unable to load departments.'
          )
        }

        setDepartments(Array.isArray(data) ? data : [])
      } catch (err) {
        setError(err.message || 'Unable to load departments.')
      } finally {
        setLoadingDepartments(false)
      }
    }

    loadDepartments()
  }, [booking?.hospital?.id])

  /*
   * ------------------------------------------------------------
   * LOAD DOCTORS WHEN DEPARTMENT CHANGES
   * ------------------------------------------------------------
   */

  useEffect(() => {
    async function loadDoctors() {
      const hospitalId = booking?.hospital?.id
      const departmentId = form.department_id

      if (!hospitalId || !departmentId) {
        setDoctors([])
        return
      }

      try {
        setLoadingDoctors(true)
        setError('')

        const params = new URLSearchParams({
          hospital_id: hospitalId,
          department_id: departmentId,
        })

        const response = await fetch(
          `${API_URL}/doctors/?${params.toString()}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.detail || 'Unable to load doctors.'
          )
        }

        setDoctors(Array.isArray(data) ? data : [])
      } catch (err) {
        setDoctors([])
        setError(err.message || 'Unable to load doctors.')
      } finally {
        setLoadingDoctors(false)
      }
    }

    loadDoctors()
  }, [booking?.hospital?.id, form.department_id])

  /*
   * ------------------------------------------------------------
   * LOAD AVAILABLE SLOTS
   * ------------------------------------------------------------
   */

  useEffect(() => {
    async function loadSlots() {
      if (!token || !form.doctor_id || !form.appointment_date) {
        setSlots([])
        return
      }

      try {
        setLoadingSlots(true)
        setError('')

        const params = new URLSearchParams({
          doctor_id: form.doctor_id,
          date: form.appointment_date,
        })

        const response = await fetch(
          `${API_URL}/booking/${encodeURIComponent(
            token
          )}/slots?${params.toString()}`
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(
            data?.detail || 'Unable to load available slots.'
          )
        }

        /*
         * Backend returns the available slots inside data.slots.
         */
        const availableSlots = Array.isArray(data?.slots)
          ? data.slots
          : []

        setSlots(availableSlots)

        /*
         * Keep the selected slot only if it is still available.
         */
        const stillAvailable = availableSlots.some(
          (slot) => String(slot.id) === String(form.slot_id)
        )

        if (!stillAvailable) {
          setForm((previous) => ({
            ...previous,
            slot_id: '',
          }))
        }
      } catch (err) {
        setSlots([])
        setForm((previous) => ({
          ...previous,
          slot_id: '',
        }))
        setError(err.message || 'Unable to load available slots.')
      } finally {
        setLoadingSlots(false)
      }
    }

    loadSlots()
  }, [token, form.doctor_id, form.appointment_date])

  /*
   * ------------------------------------------------------------
   * SELECTED VALUES
   * ------------------------------------------------------------
   */

  const selectedDepartment = useMemo(
    () =>
      departments.find(
        (department) => String(department.id) === String(form.department_id)
      ),
    [departments, form.department_id]
  )

  const selectedDoctor = useMemo(
    () =>
      doctors.find(
        (doctor) => String(doctor.id) === String(form.doctor_id)
      ),
    [doctors, form.doctor_id]
  )

  const selectedSlot = useMemo(
    () =>
      slots.find(
        (slot) => String(slot.id) === String(form.slot_id)
      ),
    [slots, form.slot_id]
  )

  const consultationFee = Number(
    selectedDoctor?.consultation_fee ??
      booking?.amount ??
      booking?.doctor?.consultation_fee ??
      0
  )

  const currency = selectedDoctor
    ? 'INR'
    : booking?.currency || 'INR'

  /*
   * ------------------------------------------------------------
   * FORM HANDLERS
   * ------------------------------------------------------------
   */

  function updateField(field, value) {
    setError('')

    setForm((previous) => ({
      ...previous,
      [field]: value,
    }))
  }

  function handleDepartmentChange(value) {
    setForm((previous) => ({
      ...previous,
      department_id: value,
      doctor_id: '',
      appointment_date: '',
      slot_id: '',
    }))

    setDoctors([])
    setSlots([])
    setError('')
  }

  function handleDoctorChange(value) {
    const doctor = doctors.find(
      (item) => String(item.id) === String(value)
    )

    setForm((previous) => ({
      ...previous,
      doctor_id: value,
      appointment_date: '',
      slot_id: '',
    }))

    setSlots([])
    setError('')

    if (doctor) {
      // Doctor fee is automatically reflected in the payment card.
    }
  }

  function handleDateChange(value) {
    setForm((previous) => ({
      ...previous,
      appointment_date: value,
      slot_id: '',
    }))

    setSlots([])
    setError('')
  }

  /*
   * ------------------------------------------------------------
   * VALIDATE
   * ------------------------------------------------------------
   */

  function validateForm() {
    if (!form.department_id) {
      return 'Please select a department.'
    }

    if (!form.doctor_id) {
      return 'Please select a doctor.'
    }

    if (!form.appointment_date) {
      return 'Please select an appointment date.'
    }

    if (!form.slot_id) {
      return 'Please select an available time slot.'
    }

    if (!form.patient_name.trim()) {
      return 'Please enter the patient name.'
    }

    if (!form.patient_phone.trim()) {
      return 'Please enter the patient phone number.'
    }

    const phoneDigits = form.patient_phone.replace(/\D/g, '')

    if (phoneDigits.length < 10) {
      return 'Please enter a valid phone number.'
    }

    if (form.patient_email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!emailRegex.test(form.patient_email.trim())) {
        return 'Please enter a valid email address.'
      }
    }

    return ''
  }

  /*
   * ------------------------------------------------------------
   * SAVE DETAILS
   * ------------------------------------------------------------
   */

  async function saveBookingDetails() {
    const validationError = validateForm()

    if (validationError) {
      setError(validationError)
      return null
    }

    const payload = {
      department_id: form.department_id,
      doctor_id: form.doctor_id,
      slot_id: form.slot_id,
      patient_name: form.patient_name.trim(),
      patient_phone: form.patient_phone.trim(),
      patient_email: form.patient_email.trim() || null,
      reason_for_visit: form.reason_for_visit.trim() || null,
    }

    const response = await fetch(
      `${API_URL}/booking/${encodeURIComponent(token)}/details`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          'Unable to save booking details.'
      )
    }

    setBooking(data)

    return data
  }

  /*
   * ------------------------------------------------------------
   * FREE APPOINTMENT
   * ------------------------------------------------------------
   */

  async function confirmFreeAppointment() {
    const response = await fetch(
      `${API_URL}/payments/confirm-free`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_token: token,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          'Unable to confirm appointment.'
      )
    }

    return data
  }

  /*
   * ------------------------------------------------------------
   * CREATE RAZORPAY ORDER
   * ------------------------------------------------------------
   */

  async function createPaymentOrder() {
    const response = await fetch(
      `${API_URL}/payments/create-order`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_token: token,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          'Unable to create payment order.'
      )
    }

    return data
  }

  /*
   * ------------------------------------------------------------
   * VERIFY RAZORPAY PAYMENT
   * ------------------------------------------------------------
   */

  async function verifyPayment(order, razorpayResponse) {
    const response = await fetch(
      `${API_URL}/payments/verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_token: token,
          razorpay_order_id:
            razorpayResponse.razorpay_order_id ||
            order.order_id,
          razorpay_payment_id:
            razorpayResponse.razorpay_payment_id,
          razorpay_signature:
            razorpayResponse.razorpay_signature,
        }),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      throw new Error(
        data?.detail ||
          data?.message ||
          'Payment verification failed.'
      )
    }

    return data
  }

  /*
   * ------------------------------------------------------------
   * MAIN BOOKING BUTTON
   * ------------------------------------------------------------
   */

  async function handleSubmit(event) {
    event.preventDefault()

    if (processing) return

    setError('')
    setProcessing(true)

    try {
      /*
       * STEP 1
       * Save patient + doctor + date + slot
       */
      await saveBookingDetails()

      /*
       * STEP 2
       * Free appointment
       */
      if (consultationFee <= 0) {
        const result = await confirmFreeAppointment()

        setSuccess({
          ...result,
          doctor: selectedDoctor,
          department: selectedDepartment,
          slot: selectedSlot,
          appointment_date: form.appointment_date,
        })

        return
      }

      /*
       * STEP 3
       * Load Razorpay
       */
      const razorpayLoaded = await loadRazorpayScript()

      if (!razorpayLoaded) {
        throw new Error(
          'Unable to load Razorpay. Please check your internet connection.'
        )
      }

      /*
       * STEP 4
       * Create payment order
       */
      const order = await createPaymentOrder()

      const razorpayKey =
        order.key_id ||
        order.razorpay_key_id ||
        order.key

      if (!razorpayKey) {
        throw new Error(
          'Razorpay key was not returned by the backend.'
        )
      }

      /*
       * STEP 5
       * Open Razorpay
       */
      const options = {
        key: razorpayKey,

        amount:
          order.amount ||
          Math.round(consultationFee * 100),

        currency: order.currency || 'INR',

        name: 'Saral',

        description: `Appointment at ${
          booking?.hospital?.name || 'Hospital'
        }`,

        order_id: order.order_id,

        prefill: {
          name: form.patient_name.trim(),
          contact: form.patient_phone.trim(),
          email: form.patient_email.trim(),
        },

        theme: {
          color: '#050505',
        },

        handler: async function (response) {
          try {
            setProcessing(true)

            const verified = await verifyPayment(
              order,
              response
            )

            setSuccess({
              ...verified,
              doctor: selectedDoctor,
              department: selectedDepartment,
              slot: selectedSlot,
              appointment_date: form.appointment_date,
            })
          } catch (err) {
            setError(
              err.message || 'Payment verification failed.'
            )
          } finally {
            setProcessing(false)
          }
        },

        modal: {
          ondismiss: function () {
            setProcessing(false)
          },
        },
      }

      const razorpay = new window.Razorpay(options)

      razorpay.on('payment.failed', function (response) {
        setProcessing(false)

        setError(
          response?.error?.description ||
            'Payment failed. Please try again.'
        )
      })

      razorpay.open()
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong while completing your booking.'
      )
      setProcessing(false)
    }
  }

  /*
   * ------------------------------------------------------------
   * LOADING SCREEN
   * ------------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="center-state">
        <div className="spinner" />

        <h2>Loading booking...</h2>

        <p>
          Please wait while we prepare your appointment booking.
        </p>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * ERROR SCREEN
   * ------------------------------------------------------------
   */

  if (error && !booking) {
    return (
      <div className="center-state">
        <div className="error-icon">!</div>

        <h1>Booking unavailable</h1>

        <p>{error}</p>

        <a className="secondary" href="/">
          Go back
        </a>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * SUCCESS SCREEN
   * ------------------------------------------------------------
   */

  if (success) {
    const doctor = success.doctor
    const department = success.department
    const slot = success.slot

    return (
      <div className="app-shell">
        <main className="center-state success-state">
          <div className="success-icon">✓</div>

          <div className="eyebrow">
            APPOINTMENT CONFIRMED
          </div>

          <h1>Your appointment is confirmed.</h1>

          <p>
            Your appointment at{' '}
            <strong>
              {booking?.hospital?.name || 'the hospital'}
            </strong>{' '}
            has been successfully booked.
          </p>

          <div className="success-card">
            <div className="success-detail">
              <span className="label">Hospital</span>
              <strong>
                {booking?.hospital?.name || '—'}
              </strong>
            </div>

            <div className="success-detail">
              <span className="label">Doctor</span>
              <strong>
                {doctor?.name || booking?.doctor?.name || '—'}
              </strong>
            </div>

            <div className="success-detail">
              <span className="label">Department</span>
              <strong>
                {department?.name ||
                  booking?.department?.name ||
                  '—'}
              </strong>
            </div>

            <div className="success-detail">
              <span className="label">Date</span>
              <strong>
                {formatDate(
                  success.appointment_date ||
                    booking?.appointment_date
                )}
              </strong>
            </div>

            <div className="success-detail">
              <span className="label">Time</span>
              <strong>
                {formatTime(
                  slot?.time ||
                    booking?.appointment_time
                )}
              </strong>
            </div>

            <div className="success-detail">
              <span className="label">Patient</span>
              <strong>{form.patient_name}</strong>
            </div>

            <div className="success-detail">
              <span className="label">Phone</span>
              <strong>{form.patient_phone}</strong>
            </div>

            <div className="success-detail">
              <span className="label">Payment</span>
              <strong>
                {consultationFee > 0
                  ? 'Paid'
                  : 'No payment required'}
              </strong>
            </div>
          </div>

          <p className="muted">
            Please keep your appointment details for your
            records.
          </p>
        </main>
      </div>
    )
  }

  /*
   * ------------------------------------------------------------
   * MAIN BOOKING PAGE
   * ------------------------------------------------------------
   */

  return (
    <div className="app-shell">
      <main className="booking-page">

        {/* TOP BAR */}

        <header className="topbar">
          <div className="brand">
            saral<span>.</span>
          </div>

          <div className="secure">
            Secure appointment booking
          </div>
        </header>

        {/* HERO */}

        <section className="hero">
          <div className="eyebrow">
            APPOINTMENT BOOKING
          </div>

          <h1>Book your appointment.</h1>

          <p>
            Choose your department, doctor, date and available
            time. Then enter the patient's details to confirm
            your appointment.
          </p>
        </section>

        <div className="grid">

          {/* ==================================================
              LEFT CARD
          ================================================== */}

          <form
            className="card details-card"
            onSubmit={handleSubmit}
          >

            <div className="card-heading">
              <div>
                <span className="label">Hospital</span>

                <h2>
                  {booking?.hospital?.name ||
                    'Hospital'}
                </h2>
              </div>

              <div className="status-pill">
                Secure booking
              </div>
            </div>

            {/* DOCTOR / APPOINTMENT SECTION */}

            <div className="form-section">
              <h3 className="form-section-title">
                Appointment details
              </h3>

              <p className="form-section-description">
                Select the department, doctor and a suitable
                appointment time.
              </p>

              <div className="form-grid">

                {/* DEPARTMENT */}

                <div className="form-group">
                  <label className="form-label">
                    Department
                    <span> *</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.department_id}
                    onChange={(event) =>
                      handleDepartmentChange(
                        event.target.value
                      )
                    }
                    disabled={loadingDepartments}
                  >
                    <option value="">
                      {loadingDepartments
                        ? 'Loading departments...'
                        : 'Select department'}
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DOCTOR */}

                <div className="form-group">
                  <label className="form-label">
                    Doctor
                    <span> *</span>
                  </label>

                  <select
                    className="form-select"
                    value={form.doctor_id}
                    onChange={(event) =>
                      handleDoctorChange(
                        event.target.value
                      )
                    }
                    disabled={
                      !form.department_id ||
                      loadingDoctors
                    }
                  >
                    <option value="">
                      {!form.department_id
                        ? 'Select department first'
                        : loadingDoctors
                        ? 'Loading doctors...'
                        : doctors.length === 0
                        ? 'No doctors available'
                        : 'Select doctor'}
                    </option>

                    {doctors.map((doctor) => (
                      <option
                        key={doctor.id}
                        value={doctor.id}
                      >
                        {doctor.name}
                        {doctor.specialization
                          ? ` — ${doctor.specialization}`
                          : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* DATE */}

                <div className="form-group">
                  <label className="form-label">
                    Appointment date
                    <span> *</span>
                  </label>

                  <input
                    className="form-input"
                    type="date"
                    min={todayISO()}
                    value={form.appointment_date}
                    onChange={(event) =>
                      handleDateChange(
                        event.target.value
                      )
                    }
                    disabled={!form.doctor_id}
                  />
                </div>

              </div>

              {/* TIME SLOTS */}

              <div className="slot-section">

                <div className="slot-header">
                  <label className="form-label">
                    Available time
                    <span> *</span>
                  </label>

                  {form.appointment_date && (
                    <span className="slot-date-note">
                      {formatDate(
                        form.appointment_date
                      )}
                    </span>
                  )}
                </div>

                {!form.doctor_id ||
                !form.appointment_date ? (
                  <div className="no-slots">
                    Select a doctor and date to see
                    available appointment times.
                  </div>
                ) : loadingSlots ? (
                  <div className="no-slots">
                    Loading available slots...
                  </div>
                ) : slots.length === 0 ? (
                  <div className="no-slots">
                    No available appointments for this
                    doctor on the selected date.
                    <br />
                    Please choose another date.
                  </div>
                ) : (
                  <div className="slots">
                    {slots.map((slot) => (
                      <button
                        type="button"
                        key={slot.id}
                        className={`slot-button ${
                          String(form.slot_id) === String(slot.id)
                            ? 'selected'
                            : ''
                        }`}
                        onClick={() =>
                          updateField(
                            'slot_id',
                            slot.id
                          )
                        }
                        disabled={
                          slot.available === false
                        }
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>

            {/* PATIENT SECTION */}

            <div className="form-section">

              <h3 className="form-section-title">
                Patient information
              </h3>

              <p className="form-section-description">
                Enter the details of the person who will
                attend the appointment.
              </p>

              <div className="form-grid">

                {/* NAME */}

                <div className="form-group">
                  <label className="form-label">
                    Full name
                    <span> *</span>
                  </label>

                  <input
                    className="form-input"
                    type="text"
                    placeholder="Enter patient's full name"
                    value={form.patient_name}
                    onChange={(event) =>
                      updateField(
                        'patient_name',
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* PHONE */}

                <div className="form-group">
                  <label className="form-label">
                    Phone number
                    <span> *</span>
                  </label>

                  <input
                    className="form-input"
                    type="tel"
                    placeholder="Enter phone number"
                    value={form.patient_phone}
                    onChange={(event) =>
                      updateField(
                        'patient_phone',
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* EMAIL */}

                <div className="form-group">
                  <label className="form-label">
                    Email <span>(optional)</span>
                  </label>

                  <input
                    className="form-input"
                    type="email"
                    placeholder="Enter email address"
                    value={form.patient_email}
                    onChange={(event) =>
                      updateField(
                        'patient_email',
                        event.target.value
                      )
                    }
                  />
                </div>

                {/* REASON */}

                <div className="form-group full">
                  <label className="form-label">
                    Reason for visit{' '}
                    <span>(optional)</span>
                  </label>

                  <textarea
                    className="form-textarea"
                    placeholder="Briefly describe the reason for the appointment"
                    value={form.reason_for_visit}
                    onChange={(event) =>
                      updateField(
                        'reason_for_visit',
                        event.target.value
                      )
                    }
                  />
                </div>

              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="alert error">
                {error}
              </div>
            )}

            {/* SUBMIT */}

            <div className="booking-action">
              <button
                className="primary"
                type="submit"
                disabled={processing}
              >
                {processing
                  ? 'Processing...'
                  : consultationFee > 0
                  ? 'Continue to payment'
                  : 'Confirm appointment'}
              </button>
            </div>

            {processing && (
              <div className="payment-processing">
                <span className="mini-spinner" />
                Processing your booking securely...
              </div>
            )}

          </form>

          {/* ==================================================
              RIGHT PAYMENT CARD
          ================================================== */}

          <aside className="card payment-card">

            <span className="label">
              Appointment summary
            </span>

            <h2>
              {money(consultationFee, currency)}
            </h2>

            <p className="muted">
              Consultation fee
            </p>

            {selectedDoctor && (
              <div className="payment-doctor">

                <div className="payment-avatar">
                  {getInitials(
                    selectedDoctor.name
                  )}
                </div>

                <div>
                  <strong>
                    {selectedDoctor.name}
                  </strong>

                  <span>
                    {selectedDoctor.specialization ||
                      selectedDepartment?.name ||
                      'Doctor'}
                  </span>
                </div>

              </div>
            )}

            <div className="line" />

            <div className="price-row">
              <span>Hospital</span>

              <strong>
                {booking?.hospital?.name || '—'}
              </strong>
            </div>

            <div className="price-row">
              <span>Department</span>

              <strong>
                {selectedDepartment?.name || '—'}
              </strong>
            </div>

            <div className="price-row">
              <span>Doctor</span>

              <strong>
                {selectedDoctor?.name || '—'}
              </strong>
            </div>

            <div className="price-row">
              <span>Date</span>

              <strong>
                {form.appointment_date
                  ? formatDate(
                      form.appointment_date
                    )
                  : '—'}
              </strong>
            </div>

            <div className="price-row">
              <span>Time</span>

              <strong>
                {selectedSlot
                  ? formatTime(selectedSlot.time)
                  : '—'}
              </strong>
            </div>

            <div className="line" />

            <div className="price-row">
              <span>Consultation</span>

              <strong>
                {money(
                  consultationFee,
                  currency
                )}
              </strong>
            </div>

            <div className="price-row total">
              <span>Total</span>

              <strong>
                {money(
                  consultationFee,
                  currency
                )}
              </strong>
            </div>

            <p className="payment-note">
              {consultationFee > 0
                ? 'You will be redirected to Razorpay to complete your payment securely.'
                : 'No payment is required for this appointment.'}
            </p>

          </aside>

        </div>

        <footer>
          © {new Date().getFullYear()} Saral ·
          Secure healthcare booking
        </footer>

      </main>
    </div>
  )
}