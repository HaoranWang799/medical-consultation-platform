import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth, UserRole } from "../../context/AuthContext";
import { api } from "../../../lib/api";
import { Loader2 } from "lucide-react";

function EmailInput(props: {
  email: string;
  checkingEmail: boolean;
  readOnly: boolean;
  onChange: (value: string) => void;
}) {
  const { email, checkingEmail, readOnly, onChange } = props;
  return (
    <div className="space-y-2">
      <label htmlFor="email" className="text-sm font-medium text-gray-700">
        邮箱
      </label>
      <div className="relative">
        <input
          id="email"
          type="email"
          value={email}
          readOnly={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder="name@example.com"
          className="h-11 w-full rounded-lg border border-gray-300 px-3 pr-10 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
          required
        />
        {checkingEmail && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-teal-600" />
        )}
      </div>
    </div>
  );
}

function PasswordInput(props: {
  password: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="password" className="text-sm font-medium text-gray-700">
        密码
      </label>
      <input
        id="password"
        type="password"
        value={props.password}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        required
      />
    </div>
  );
}

function ConfirmPasswordInput(props: {
  confirmPassword: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
        确认密码
      </label>
      <input
        id="confirmPassword"
        type="password"
        value={props.confirmPassword}
        onChange={(e) => props.onChange(e.target.value)}
        className="h-11 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
        required
      />
    </div>
  );
}

function SubmitButton(props: {
  loading: boolean;
  text: string;
}) {
  return (
    <button
      type="submit"
      disabled={props.loading}
      className="h-11 w-full rounded-lg bg-teal-600 text-white transition-all duration-300 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {props.loading ? "处理中..." : props.text}
    </button>
  );
}

function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const requestIdRef = useRef(0);
  const role: UserRole = "patient";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const normalized = email.trim().toLowerCase();
    if (!normalized) {
      setEmailExists(null);
      setCheckingEmail(false);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
    if (!isValidEmail) {
      setEmailExists(null);
      setCheckingEmail(false);
      return;
    }

    setError("");
    setCheckingEmail(true);
    const currentRequestId = ++requestIdRef.current;

    const timer = window.setTimeout(async () => {
      try {
        const result = await api.get<{ exists: boolean }>(
          `/auth/check-email?email=${encodeURIComponent(normalized)}`
        );
        if (requestIdRef.current !== currentRequestId) {
          return;
        }
        setEmail(normalized);
        setEmailExists(result.exists);
      } catch (err) {
        if (requestIdRef.current !== currentRequestId) {
          return;
        }
        setEmailExists(null);
        setError(err instanceof Error ? err.message : "邮箱检测失败，请重试");
      } finally {
        if (requestIdRef.current === currentRequestId) {
          setCheckingEmail(false);
        }
      }
    }, 500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password, role);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    setLoading(true);
    try {
      const derivedName = email.split("@")[0] || "用户";
      await register(derivedName, email, password, role);
      navigate("/home");
    } catch (err) {
      setError(err instanceof Error ? err.message : "注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-teal-50 via-white to-cyan-50 px-4 py-8">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg transition-all duration-300">
        <h1 className="text-center text-2xl font-semibold text-gray-900">智能登录</h1>
        <p className="mt-2 text-center text-sm text-gray-500">输入邮箱后自动识别登录或注册</p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600 transition-all duration-300">
            {error}
          </div>
        )}

        <div className="mt-5 space-y-4">
          <EmailInput
            email={email}
            checkingEmail={checkingEmail}
            readOnly={emailExists !== null}
            onChange={(value) => {
              setEmail(value);
              setError("");
              setEmailExists(null);
              setPassword("");
              setConfirmPassword("");
            }}
          />

          <div className={`overflow-hidden transition-all duration-300 ${emailExists === null ? "max-h-0 opacity-0" : "max-h-[420px] opacity-100"}`}>
            {emailExists === true && (
              <form onSubmit={handleLogin} className="space-y-4 transition-all duration-300">
                <PasswordInput password={password} onChange={setPassword} />
                <SubmitButton loading={loading || checkingEmail} text="登录" />
              </form>
            )}

            {emailExists === false && (
              <form onSubmit={handleRegister} className="space-y-4 transition-all duration-300">
                <PasswordInput password={password} onChange={setPassword} />
                <ConfirmPasswordInput confirmPassword={confirmPassword} onChange={setConfirmPassword} />
                <SubmitButton loading={loading || checkingEmail} text="注册" />
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage() {
  return <AuthPage />;
}
