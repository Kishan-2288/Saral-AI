export default function Status({ value = 'pending' }) {
  return (
    <span className={`status status-${value}`}>
      {value === 'pending' ? 'Waiting' : value}
    </span>
  );
}