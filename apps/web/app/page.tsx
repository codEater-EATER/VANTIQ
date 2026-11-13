export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 VANTIQ - Intelligence That Converts</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>
        AI-powered lead generation platform
      </p>
      <div style={{ marginTop: '30px' }}>
        <a href="/auth/signup" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#8C7BB8',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          marginRight: '10px'
        }}>
          Sign Up
        </a>
        <a href="/auth/signin" style={{
          display: 'inline-block',
          padding: '12px 24px',
          backgroundColor: '#101827',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '6px',
          border: '1px solid #8C7BB8'
        }}>
          Sign In
        </a>
      </div>
      <hr style={{ margin: '40px 0' }} />
      <h2>Features</h2>
      <ul style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
        <li>✅ AI-Powered Lead Qualification</li>
        <li>✅ Multi-Source Lead Generation</li>
        <li>✅ Advanced Analytics Dashboard</li>
        <li>✅ Lead Deduplication</li>
        <li>✅ Commission Protection</li>
        <li>✅ DPDP Compliance</li>
      </ul>
    </div>
  );
}
