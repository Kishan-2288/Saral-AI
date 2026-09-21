export default function Settings({ user }) {
  return (
    <>
      <h1 className="page-title">Settings</h1>
      <p className="page-subtitle">Your receptionist profile.</p>
      <section className="settings-card">
        <h2>Profile</h2>
        <p>
          {user.full_name}
          <br />
          {user.email}
        </p>
      </section>
    </>
  );
}