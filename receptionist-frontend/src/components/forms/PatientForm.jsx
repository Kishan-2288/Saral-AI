import { useState } from 'react';
import Modal from '../Modal';

export default function PatientForm({ close, save }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '' });

  async function handleSubmit(e) {
    e.preventDefault();
    await save(form);
    close();
  }

  return (
    <Modal title="Add patient" close={close}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Patient name *
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          Phone *
          <input
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label>
          Email
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <button className="btn-primary">Add patient</button>
      </form>
    </Modal>
  );
}