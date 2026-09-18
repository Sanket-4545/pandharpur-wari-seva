export default function LoginLoading() {
  return (
    <div className="login-shell">
      <div className="login-image-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="login-image-wash" />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ width: 40, height: 40, border: '3px solid #e7af6a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
      </div>
      <div className="login-form-panel">
        <div className="login-form-wrap">
          <div style={{ marginBottom: 35 }}>
            <div style={{ height: 12, width: 120, background: '#e5ddd3', borderRadius: 3, marginBottom: 14 }} />
            <div style={{ height: 44, width: '80%', background: '#e5ddd3', borderRadius: 3, marginBottom: 8 }} />
            <div style={{ height: 14, width: 200, background: '#e5ddd3', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ height: 12, width: 80, background: '#e5ddd3', borderRadius: 3 }} />
            <div style={{ height: 52, width: '100%', background: '#e5ddd3', borderRadius: 3 }} />
            <div style={{ height: 12, width: 80, background: '#e5ddd3', borderRadius: 3, marginTop: 8 }} />
            <div style={{ height: 52, width: '100%', background: '#e5ddd3', borderRadius: 3 }} />
            <div style={{ height: 53, width: '100%', background: '#e5ddd3', borderRadius: 3, marginTop: 8 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
