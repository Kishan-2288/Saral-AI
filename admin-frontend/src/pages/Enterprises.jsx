import { useEffect, useMemo, useState } from 'react';
import { Link } from '../routes/router';
import { EnterpriseTable } from '../components/Enterprise/EnterpriseTable';
import { Loading } from '../components/Common/Loading';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { deleteEnterprise, listEnterprises } from '../services/enterprise';

export default function Enterprises() {
	const [items, setItems] = useState(null);
	const [query, setQuery] = useState('');
	const [error, setError] = useState('');

	useEffect(() => {
		listEnterprises().then(setItems).catch((exception) => setError(exception.message));
	}, []);

	const handleDeleteEnterprise = async (id) => {
		if (!window.confirm('Are you sure you want to permanently delete this enterprise?')) return;

		try {
			await deleteEnterprise(id);
			setItems((previous) => previous.filter((enterprise) => enterprise.id !== id));
		} catch (exception) {
			window.alert(exception.message || 'Failed to delete enterprise.');
		}
	};

	const filtered = useMemo(
		() => (items || []).filter((item) => `${item.name} ${item.email} ${item.business_type}`.toLowerCase().includes(query.toLowerCase())),
		[items, query],
	);

	if (error) return <ErrorMessage message={error} />;

	return (
		<>
			<div className="page-heading">
				<div><p className="eyebrow">ORGANIZATIONS</p><h1>Enterprises</h1><p className="subtitle">Manage hospitals and business accounts connected to your platform.</p></div>
				<Link className="button button-primary" to="/enterprises/new">+ Add enterprise</Link>
			</div>
			<div className="toolbar"><input aria-label="Search enterprises" placeholder="Search enterprises..." value={query} onChange={(event) => setQuery(event.target.value)} /></div>
			{items ? <EnterpriseTable enterprises={filtered} onDelete={handleDeleteEnterprise} /> : <Loading />}
		</>
	);
}
