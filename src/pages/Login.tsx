import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

const DEMO_USER = {
  id: "demo-admin-001",
  name: "Demo Admin",
  email: "demo@f5hiring.com",
  role: "admin" as const,
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((s) => s.setUser);
  const setDemoMode = useAuthStore((s) => s.setDemoMode);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    setUser({ id: "user-001", name: "Joel Davis", email: email || "joel@f5recruiting.com", role: "admin" });
    setLoading(false);
    navigate("/dashboard", { replace: true });
  };

  const handleDemo = () => {
    setUser(DEMO_USER);
    setDemoMode(true);
    navigate("/dashboard", { replace: true });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '36px',
    border: '1px solid #e2e3e6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#1a1a1a',
    padding: '0 12px',
    background: '#ffffff',
    outline: 'none',
    transition: 'border-color 150ms ease, box-shadow 150ms ease',
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full"
        style={{
          maxWidth: '380px',
          backgroundColor: '#ffffff',
          border: '1px solid #e9eaec',
          borderRadius: '8px',
          padding: '36px 32px 32px',
        }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center" style={{ marginBottom: '32px' }}>
          <div className="flex items-center justify-center shrink-0" style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#7c3aed' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>F5</span>
          </div>
          <span style={{ fontSize: '16px', fontWeight: 600, color: '#1a1a1a', marginLeft: '10px' }}>F5 Hiring Solutions</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.boxShadow = '0 0 0 3px #7c3aed18'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#e2e3e6'; e.currentTarget.style.boxShadow = 'none'; }}
              placeholder="••••••••"
            />
          </div>

          {error && <p style={{ fontSize: '12px', color: '#dc2626', margin: 0 }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'background-color 150ms ease, opacity 150ms ease',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.backgroundColor = '#6d28d9'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#7c3aed'; }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="relative" style={{ margin: '4px 0' }}>
            <div className="absolute inset-0 flex items-center"><span className="w-full" style={{ borderTop: '1px solid #e9eaec' }} /></div>
            <div className="relative flex justify-center"><span style={{ backgroundColor: '#ffffff', padding: '0 10px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#9ca3af' }}>or</span></div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            style={{
              width: '100%',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid #e2e3e6',
              cursor: 'pointer',
              transition: 'background-color 150ms ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f3f4f6'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            View Demo
          </button>
        </div>
      </form>
    </div>
  );
}
