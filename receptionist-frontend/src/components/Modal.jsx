export default function Modal({ title, children, close }) {
  return (
    <div className="veil" onMouseDown={close}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{title}</h2>
          <button onClick={close} aria-label="Close">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}