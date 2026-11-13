export default function Settings() {
  return (
    <div style={{ padding: '40px', color: '#F6F2EA' }}>
      <h1>⚙️ Settings</h1>
      <div style={{ marginTop: '30px', maxWidth: '600px' }}>
        <div style={{ backgroundColor: '#202124', padding: '20px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <h3>Account Settings</h3>
          <p style={{ fontSize: '14px', color: '#A5B59A' }}>Manage your account preferences and security</p>
        </div>
        <div style={{ backgroundColor: '#202124', padding: '20px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <h3>Integrations</h3>
          <p style={{ fontSize: '14px', color: '#A5B59A' }}>Connect external services and APIs</p>
        </div>
        <div style={{ backgroundColor: '#202124', padding: '20px', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <h3>Billing</h3>
          <p style={{ fontSize: '14px', color: '#A5B59A' }}>Manage your subscription and billing</p>
        </div>
      </div>
    </div>
  );
}
