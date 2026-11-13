export default function Analytics() {
  return (
    <div style={{ padding: '40px', color: '#F6F2EA' }}>
      <h1>📈 Advanced Analytics</h1>
      <p style={{ marginTop: '20px', fontSize: '16px' }}>Real-time dashboards and performance tracking</p>
      <div style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        <div style={{ backgroundColor: '#202124', padding: '20px', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <p>Conversion Rate</p>
          <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#C6AD83' }}>27.8%</h2>
        </div>
        <div style={{ backgroundColor: '#202124', padding: '20px', borderRadius: '8px', border: '1px solid #8C7BB8' }}>
          <p>Avg Lead Value</p>
          <h2 style={{ fontSize: '28px', margin: '10px 0', color: '#A5B59A' }}>$245</h2>
        </div>
      </div>
    </div>
  );
}
