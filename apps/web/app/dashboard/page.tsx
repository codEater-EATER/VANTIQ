// Dashboard page for VANTIQ
export default function Dashboard() {
  return (
    <div style={{ padding: '40px', color: '#F6F2EA', backgroundColor: '#101827', minHeight: '100vh' }}>
      <h1>📊 Dashboard</h1>
      <p style={{ color: '#8C7BB8', marginBottom: '20px' }}>Welcome to VANTIQ Dashboard!</p>
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        <div style={{ padding: '20px', backgroundColor: '#202124', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <p style={{ color: '#8C7BB8', fontSize: '14px' }}>Total Leads</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0' }}>1,234</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#202124', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <p style={{ color: '#C6AD83', fontSize: '14px' }}>Qualified</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0' }}>856</h2>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#202124', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <p style={{ color: '#A5B59A', fontSize: '14px' }}>Converted</p>
          <h2 style={{ fontSize: '32px', margin: '10px 0' }}>342</h2>
        </div>
      </div>
    </div>
  );
}
