export default function LoginLoading() {
  return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div className="login-accent" style={{ margin: '0 auto 16px' }} />
        <div style={{ height: 20, width: 140, background: '#eadfce', borderRadius: 6, margin: '0 auto 10px' }} />
        <div style={{ height: 12, width: 190, background: '#efe6d8', borderRadius: 6, margin: '0 auto 26px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ height: 60, width: '100%', background: '#efe6d8', borderRadius: 12 }} />
          <div style={{ height: 60, width: '100%', background: '#efe6d8', borderRadius: 12 }} />
          <div style={{ height: 60, width: '100%', background: '#efe6d8', borderRadius: 12 }} />
        </div>
      </div>
    </div>
  );
}
