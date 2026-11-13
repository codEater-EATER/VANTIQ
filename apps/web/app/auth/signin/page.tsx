export default function SignIn() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#101827',
      color: '#F6F2EA',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '400px', width: '100%', padding: '40px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Sign In to VANTIQ</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Email</label>
          <input 
            type="email" 
            placeholder="your@email.com"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #8C7BB8',
              backgroundColor: '#202124',
              color: '#F6F2EA',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px' }}>Password</label>
          <input 
            type="password" 
            placeholder="••••••••"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #8C7BB8',
              backgroundColor: '#202124',
              color: '#F6F2EA',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#8C7BB8',
          color: '#101827',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
          marginBottom: '20px'
        }}>
          Sign In
        </button>

        <p style={{ textAlign: 'center' }}>
          Don&apos;t have an account? <a href="/auth/signup" style={{ color: '#8C7BB8' }}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
