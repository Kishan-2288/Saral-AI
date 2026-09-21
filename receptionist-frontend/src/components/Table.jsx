export default function Table({ title, action, children }) {
  return (
    <section className="table-card">
      <div className="table-header">
        <h2 className="table-title">{title}</h2>
        {action}
      </div>
      <div className="table-scroll">
        <table>{children}</table>
      </div>
    </section>
  );
}