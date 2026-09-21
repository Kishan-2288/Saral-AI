export default function PageHeading({ title, subtitle, action }) {
  return (
    <div className="page-heading">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}