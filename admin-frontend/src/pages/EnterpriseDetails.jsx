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
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    is_active: true,
  });

  const loadEnterprise = async () => {
    try {
      const data = await api(`/enterprises/${id}`);
      setEnterprise(data);
      setForm({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        is_active: data.is_active ?? true,
      });
    } catch (e) {
      setError(e.message);
    }
  };

  useEffect(() => {
    if (!id) return;
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
      const updated = await api(`/enterprises/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(form),
      });

      setEnterprise(updated);
      setEditing(false);
      alert('Enterprise updated successfully');
    } catch (e) {
      alert(e.message);
    }
  };

  if (error) return <ErrorMessage message={error} />;
  if (!enterprise) return <Loading />;

  return (
    <>
      <Link className="back-link" to="/enterprises">← All enterprises</Link>

      <div className="page-heading">
        <div>
          <p className="eyebrow">ENTERPRISE DETAILS</p>
          <h1>{enterprise.name}</h1>
          <p className="subtitle">{enterprise.email || 'No email provided'}</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <StatusBadge active={enterprise.is_active} />
          <button
            type="button"
            onClick={handleEdit}
            className="btn btn-primary"
            style={{ padding: '10px 16px' }}
          >
            Edit
          </button>
        </div>
      </div>

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

      <section className="panel table-wrap">
        <div className="panel-heading">
          <h2>Staff accounts</h2>
        </div>

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
            {enterprise.staff.map((member) => (
              <tr key={member.id}>
                <td>{member.full_name}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td><StatusBadge active={member.is_active} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6" style={{ background: '#fff', borderRadius: '18px', width: '100%', maxWidth: '560px', padding: '24px', boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)' }}>
            <div className="flex items-center justify-between mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Edit Enterprise</h2>
              <button type="button" onClick={() => setEditing(false)} style={{ background: 'transparent', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '1.5rem' }}>
                ×
              </button>
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Enterprise Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500 }}>Address</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={3} style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '10px 12px', resize: 'vertical' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
                <span>Active Enterprise</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
              <button type="button" onClick={() => setEditing(false)} style={{ padding: '10px 16px', border: '1px solid #cbd5e1', borderRadius: '10px', background: '#fff' }}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} style={{ padding: '10px 16px', border: 'none', borderRadius: '10px', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
