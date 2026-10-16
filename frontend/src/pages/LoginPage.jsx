import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, CircleAlert, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/register-page.css";

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

function getApiMessage(result, fallback) {
  const message = result?.detail || result?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.map((item) => item.msg).filter(Boolean).join(" ");
  return fallback;
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }) => {
    setSubmitError("");
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      if (!backendUrl) throw new Error("VITE_BACKEND_URL is not configured.");
      const body = new URLSearchParams({ username: email.trim(), password });
      const response = await fetch(`${backendUrl.replace(/\/$/, "")}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
        body,
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(getApiMessage(result, `Login failed (${response.status})`));
      if (!result?.access_token) throw new Error("The API did not return an access token.");

      window.localStorage.setItem("access_token", result.access_token);
      const user = await refreshUser();
      if (!user) throw new Error("Signed in, but we couldn't load your profile. Please try again.");
      reset();
      navigate("/");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
    }
  };

  return (
    <main className="register-page login-page">
      <div className="register-decoration decoration-one" />
      <div className="register-decoration decoration-two" />
      <div className="register-decoration decoration-three" />
      <section className="register-layout">
        <aside className="register-intro">
          <Link to="/" className="register-brand">
            <span className="register-brand-icon"><Sparkles size={24} /></span>
            <span className="logo">ClaySpace</span>
          </Link>
          <div className="intro-content">
            <span className="intro-badge"><Sparkles size={15} /> A familiar space, just for you</span>
            <h1>Welcome<br />back.<br /><span>Your space awaits.</span></h1>
            <p>Sign in to pick up where you left off and enjoy everything ClaySpace has to offer.</p>
            <div className="intro-benefits">
              <div className="intro-benefit"><span className="benefit-icon mint"><CheckCircle2 size={19} /></span><span><strong>Your account, ready</strong><small>Continue with your saved profile.</small></span></div>
              <div className="intro-benefit"><span className="benefit-icon peach"><ShieldCheck size={19} /></span><span><strong>Protected sign in</strong><small>Your credentials are sent securely.</small></span></div>
            </div>
          </div>
          <p className="intro-footer">A little creativity. A better experience.</p>
        </aside>

        <section className="register-form-side">
          <div className="register-card">
            <div className="form-heading">
              <div className="form-heading-icon"><UserRound size={24} /></div>
              <h2>Welcome back</h2>
              <p>Sign in with your account details.</p>
            </div>

            {submitError && <div className="form-alert error-alert" role="alert"><CircleAlert size={19} /><span>{submitError}</span></div>}

            <form className="register-form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-field">
                <label htmlFor="login-email">Email address</label>
                <div className={`input-shell ${errors.email ? "input-invalid" : ""}`}>
                  <Mail size={19} className="input-icon" />
                  <input id="login-email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
                </div>
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>
              <div className="form-field">
                <label htmlFor="login-password">Password</label>
                <div className={`input-shell ${errors.password ? "input-invalid" : ""}`}>
                  <LockKeyhole size={19} className="input-icon" />
                  <input id="login-password" type={showPassword ? "text" : "password"} placeholder="Enter your password" autoComplete="current-password" aria-invalid={!!errors.password} {...register("password")} />
                  <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>
              <button type="submit" className="btn btn-primary register-submit" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign in"}{!isSubmitting && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="form-divider"><span>NEW TO CLAYSPACE?</span></div>
            <p className="login-prompt">Create an account <Link to="/register">Sign up</Link></p>
            <div className="form-security-note"><ShieldCheck size={16} /><span>Your account information stays protected.</span></div>
          </div>
          <p className="mobile-register-footer">© {new Date().getFullYear()} ClaySpace. All rights reserved.</p>
        </section>
      </section>
    </main>
  );
}
