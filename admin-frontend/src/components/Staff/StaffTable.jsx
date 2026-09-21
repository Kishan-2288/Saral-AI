import { StatusBadge } from '../Common/StatusBadge';

export function StaffTable({ staff, onEdit, onDelete }) {
	return (
		<section className="panel table-wrap">
			<table>
				<thead>
					<tr>
						<th>Name</th>
						<th>Email</th>
						<th>Enterprise</th>
						<th>Role</th>
						<th>Status</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{staff.map((member) => (
						<tr key={member.id}>
							<td><strong>{member.full_name}</strong></td>
							<td>{member.email}</td>
							<td>{member.enterprise_name || '—'}</td>
							<td>{member.role}</td>
							<td><StatusBadge active={member.is_active} /></td>
							<td>
								<div className="table-actions">
									<button type="button" className="button-muted" onClick={() => onEdit(member)}>Edit</button>
									<button type="button" className="delete-btn" onClick={() => onDelete(member.id)}>Delete</button>
								</div>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
