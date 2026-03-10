import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { api } from "@/lib/api";

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
    try {
      const data = await api.post("/auth/login", { email, password });
      setUser(data.user);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    setUser(DEMO_USER);
    setDemoMode(true);
    navigate("/dashboard", { replace: true });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    height: '32px',
    border: '1px solid #e2e3e6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#1a1a1a',
    padding: '0 10px',
    background: '#ffffff',
    outline: 'none',
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
          padding: '32px',
        }}
      >
        <div className="flex items-center justify-center mb-8">
          <div className="h-8 w-8 rounded-md flex items-center justify-center" style={{ backgroundColor: '#7c3aed' }}>
            <span className="text-white text-sm font-bold">F5</span>
          </div>
          <span className="text-[16px] font-semibold ml-2" style={{ color: '#1a1a1a' }}>F5 Hiring Solutions</span>
        </div>

        <div className="space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Email</label>
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
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>Password</label>
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

          {error && <p style={{ fontSize: '11px', color: '#dc2626' }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center"><span className="w-full" style={{ borderTop: '1px solid #e9eaec' }} /></div>
            <div className="relative flex justify-center"><span style={{ backgroundColor: '#ffffff', padding: '0 8px', fontSize: '11px', textTransform: 'uppercase', color: '#9ca3af' }}>or</span></div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            style={{
              width: '100%',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              color: '#374151',
              fontSize: '13px',
              fontWeight: 500,
              border: '1px solid #e2e3e6',
              cursor: 'pointer',
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
