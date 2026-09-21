import { useEffect, useMemo, useState } from 'react';
import { StaffTable } from '../components/Staff/StaffTable';
import { Loading } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { createStaff, deleteStaff, listStaff, updateStaff } from '../services/staff';
import { listEnterprises } from '../services/enterprise';

const emptyForm = {
	full_name: '',
	email: '',
	role: 'receptionist',
	hospital_id: '',
	is_active: true,
};

const emptyCreateForm = {
	full_name: '',
	email: '',
	role: 'receptionist',
	hospital_id: '',
	temporary_password: '',
};

export default function Staff() {
	const [items, setItems] = useState(null);
	const [enterprises, setEnterprises] = useState([]);
	const [query, setQuery] = useState('');
	const [error, setError] = useState('');
	const [editingStaff, setEditingStaff] = useState(null);
	const [editForm, setEditForm] = useState(emptyForm);
	const [editError, setEditError] = useState('');
	const [saving, setSaving] = useState(false);
	const [showAddModal, setShowAddModal] = useState(false);
	const [form, setForm] = useState(emptyCreateForm);
	const [createError, setCreateError] = useState('');
	const [creating, setCreating] = useState(false);

	useEffect(() => {
		Promise.all([listStaff(), listEnterprises()])
			.then(([staff, enterpriseList]) => {
				setItems(staff);
				setEnterprises(enterpriseList);
			})
			.catch((exception) => setError(exception.message));
	}, []);

	const filtered = useMemo(
		() => (items || []).filter((item) => `${item.full_name} ${item.email} ${item.enterprise_name}`.toLowerCase().includes(query.toLowerCase())),
		[items, query],
	);

	const handleEdit = (staff) => {
		setEditingStaff(staff);
		setEditError('');
		setEditForm({
			full_name: staff.full_name || '',
			email: staff.email || '',
			role: staff.role || 'receptionist',
			hospital_id: staff.hospital_id || '',
			is_active: staff.is_active ?? true,
		});
	};

	const handleEditChange = (event) => {
		const { name, value, type, checked } = event.target;
		setEditForm((previous) => ({
			...previous,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSaveEdit = async () => {
		setSaving(true);
		setEditError('');

		try {
			await updateStaff(editingStaff.id, editForm);
			setItems(await listStaff());
			setEditingStaff(null);
		} catch (exception) {
			setEditError(exception.message);
		} finally {
			setSaving(false);
		}
	};

	const handleCreateStaff = async (event) => {
		event.preventDefault();
		setCreating(true);
		setCreateError('');

		try {
			await createStaff({
				...form,
				temporary_password: form.temporary_password || undefined,
			});
			setItems(await listStaff());
			setForm(emptyCreateForm);
			setShowAddModal(false);
		} catch (exception) {
			setCreateError(exception.message);
		} finally {
			setCreating(false);
		}
	};

	const handleDeleteStaff = async (id) => {
		if (!window.confirm('Are you sure you want to permanently delete this staff member?')) return;

		try {
			await deleteStaff(id);
			setItems((previous) => previous.filter((member) => member.id !== id));
		} catch (exception) {
			window.alert(exception.message || 'Failed to delete staff member.');
		}
	};

	if (error) return <ErrorMessage message={error} />;

	return (
		<>
			<div className="page-heading">
				<div>
					<p className="eyebrow">ACCESS MANAGEMENT</p>
					<h1>Staff</h1>
					<p className="subtitle">Manage staff members across your enterprises.</p>
				</div>
				<button type="button" onClick={() => { setCreateError(''); setShowAddModal(true); }}>+ Add Staff</button>
			</div>

			<div className="toolbar">
				<input aria-label="Search staff" placeholder="Search staff..." value={query} onChange={(event) => setQuery(event.target.value)} />
			</div>

			{items ? <StaffTable staff={filtered} onEdit={handleEdit} onDelete={handleDeleteStaff} /> : <Loading />}

			{showAddModal && (
				<div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowAddModal(false); }}>
					<section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="add-staff-title">
						<div className="modal-heading">
							<div>
								<h2 id="add-staff-title">Add Staff</h2>
								<p>Create a new receptionist account.</p>
							</div>
							<button type="button" className="modal-close" aria-label="Close add staff dialog" onClick={() => setShowAddModal(false)}>X</button>
						</div>

						{createError && <ErrorMessage message={createError} />}

						<form className="edit-form" onSubmit={handleCreateStaff}>
							<label>Full Name<input type="text" value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Rahul Sharma" required /></label>
							<label>Email<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="rahul@example.com" required /></label>
							<label>Role<select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="receptionist">Receptionist</option></select></label>
							<label>Enterprise<select value={form.hospital_id} onChange={(event) => setForm({ ...form, hospital_id: event.target.value })} required><option value="">Select Enterprise</option>{enterprises.map((enterprise) => <option key={enterprise.id} value={enterprise.id}>{enterprise.name}</option>)}</select></label>
							<label>Temporary Password<input type="password" value={form.temporary_password} onChange={(event) => setForm({ ...form, temporary_password: event.target.value })} placeholder="Temporary password" minLength="8" /></label>

							<div className="modal-actions">
								<button type="button" className="button-muted" onClick={() => setShowAddModal(false)}>Cancel</button>
								<button type="submit" disabled={creating}>{creating ? 'Creating...' : 'Create Staff'}</button>
							</div>
						</form>
					</section>
				</div>
			)}

			{editingStaff && (
				<div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditingStaff(null); }}>
					<section className="edit-modal" role="dialog" aria-modal="true" aria-labelledby="edit-staff-title">
						<div className="modal-heading">
							<div>
								<h2 id="edit-staff-title">Edit Employee</h2>
								<p>Update employee information.</p>
							</div>
							<button type="button" className="modal-close" aria-label="Close edit employee dialog" onClick={() => setEditingStaff(null)}>X</button>
						</div>

						{editError && <ErrorMessage message={editError} />}

						<div className="edit-form">
							<label>Employee Name<input type="text" name="full_name" value={editForm.full_name} onChange={handleEditChange} /></label>
							<label>Email<input type="email" name="email" value={editForm.email} onChange={handleEditChange} /></label>
							<label>Role<select name="role" value={editForm.role} onChange={handleEditChange}><option value="receptionist">Receptionist</option><option value="manager">Manager</option><option value="staff">Staff</option></select></label>
							<label>Enterprise<select name="hospital_id" value={editForm.hospital_id} onChange={handleEditChange}>{enterprises.map((enterprise) => <option key={enterprise.id} value={enterprise.id}>{enterprise.name}</option>)}</select></label>
							<label className="checkbox-field"><input type="checkbox" name="is_active" checked={editForm.is_active} onChange={handleEditChange} />Employee is active</label>
						</div>

						<div className="modal-actions">
							<button type="button" className="button-muted" onClick={() => setEditingStaff(null)}>Cancel</button>
							<button type="button" onClick={handleSaveEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
						</div>
					</section>
				</div>
			)}
		</>
	);
}
