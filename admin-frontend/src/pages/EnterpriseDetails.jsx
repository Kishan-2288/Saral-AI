import { useEffect, useState } from 'react';
import { Link, useParams } from '../routes/router';
import { api } from '../services/api';
import { Loading } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { StatusBadge } from '../components/Common/StatusBadge';

export default function EnterpriseDetails() {
  const { id } = useParams();

  const [enterprise, setEnterprise] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
  });

  const loadEnterprise = async () => {
    try {
      setError('');

      if (!id) {
        throw new Error('Enterprise ID is missing');
      }

      const data = await api(`/enterprises/${id}`);

      console.log('Enterprise details response:', data);

      /*
       * Normalize the response so the UI does not crash
       * if staff is missing/null.
       */
      const normalized = {
        ...data,
        staff: Array.isArray(data?.staff) ? data.staff : [],
        staff_count: data?.staff_count ?? 0,
        patient_count: data?.patient_count ?? 0,
        appointment_count: data?.appointment_count ?? 0,
        is_active: data?.is_active ?? true,
      };

      setEnterprise(normalized);

      setForm({
        name: normalized.name || '',
        phone: normalized.phone || '',
        email: normalized.email || '',
        address: normalized.address || '',
        is_active: normalized.is_active,
      });
    } catch (e) {
      console.error('Failed to load enterprise:', e);
      setError(e?.message || 'Failed to load enterprise');
    }
  };

  useEffect(() => {
    loadEnterprise();
  }, [id]);

  const handleEdit = () => {
    if (!enterprise) return;

    setForm({
      name: enterprise.name || '',
      phone: enterprise.phone || '',
      email: enterprise.email || '',
      address: enterprise.address || '',
      is_active: enterprise.is_active ?? true,
    });

    setEditing(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updated = await api(`/enterprises/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });

      console.log('Updated enterprise:', updated);

      const normalized = {
        ...updated,
        staff: Array.isArray(updated?.staff)
          ? updated.staff
          : enterprise.staff || [],
        staff_count:
          updated?.staff_count ?? enterprise.staff_count ?? 0,
        patient_count:
          updated?.patient_count ?? enterprise.patient_count ?? 0,
        appointment_count:
          updated?.appointment_count ??
          enterprise.appointment_count ??
          0,
        is_active: updated?.is_active ?? form.is_active,
      };

      setEnterprise(normalized);
      setEditing(false);

      alert('Enterprise updated successfully');
    } catch (e) {
      console.error('Failed to update enterprise:', e);
      alert(e?.message || 'Failed to update enterprise');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div>
        <Link className="back-link" to="/enterprises">
          ← All enterprises
        </Link>

        <ErrorMessage message={error} />
      </div>
    );
  }

  if (!enterprise) {
    return <Loading />;
  }

  const staff = Array.isArray(enterprise.staff)
    ? enterprise.staff
    : [];

  return (
    <>
      <Link className="back-link" to="/enterprises">
        ← All enterprises
      </Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">ENTERPRISE DETAILS</p>

          <h1>{enterprise.name || 'Unnamed Enterprise'}</h1>

          <p className="subtitle">
            {enterprise.email || 'No email provided'}
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <StatusBadge active={enterprise.is_active} />

          <button
            type="button"
            onClick={handleEdit}
            className="btn btn-primary"
            style={{
              padding: '10px 16px',
            }}
          >
            Edit
          </button>
        </div>
      </div>

      {/* =====================================================
          STATS
      ===================================================== */}

      <div className="stats-grid">
        <article className="stat-card">
          <p>Staff</p>
          <strong>{enterprise.staff_count}</strong>
        </article>

        <article className="stat-card">
          <p>Patients</p>
          <strong>{enterprise.patient_count}</strong>
        </article>

        <article className="stat-card">
          <p>Appointments</p>
          <strong>{enterprise.appointment_count}</strong>
        </article>
      </div>

      {/* =====================================================
          STAFF
      ===================================================== */}

      <section className="panel table-wrap">
        <div className="panel-heading">
          <h2>Staff accounts</h2>
        </div>

        {staff.length === 0 ? (
          <div
            style={{
              padding: '30px',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            No staff accounts found.
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td>
                    {member.name ||
                      member.full_name ||
                      'Unnamed staff'}
                  </td>

                  <td>
                    {member.email || '—'}
                  </td>

                  <td>
                    {member.role || 'receptionist'}
                  </td>

                  <td>
                    <StatusBadge
                      active={member.is_active}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* =====================================================
          EDIT MODAL
      ===================================================== */}

      {editing && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '18px',
              width: '100%',
              maxWidth: '560px',
              padding: '24px',
              boxShadow:
                '0 20px 40px rgba(15, 23, 42, 0.3)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: 600,
                }}
              >
                Edit Enterprise
              </h2>

              <button
                type="button"
                onClick={() => setEditing(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#475569',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                }}
              >
                ×
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gap: '16px',
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  Enterprise Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  Phone
                </label>

                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 12px',
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '6px',
                    fontWeight: 500,
                  }}
                >
                  Address
                </label>

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1px solid #cbd5e1',
                    borderRadius: '10px',
                    padding: '10px 12px',
                    resize: 'vertical',
                  }}
                />
              </div>

              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />

                <span>Active Enterprise</span>
              </label>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              <button
                type="button"
                onClick={() => setEditing(false)}
                disabled={saving}
                style={{
                  padding: '10px 16px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  background: '#fff',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 16px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#2563eb',
                  color: '#fff',
                  cursor: saving
                    ? 'not-allowed'
                    : 'pointer',
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}