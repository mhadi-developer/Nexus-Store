import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, CheckCircle2, CircleAlert, KeyRound, LockKeyhole, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { Link, useLocation, useSearchParams } from "react-router";
import { useAuth } from "../context/AuthContext.jsx";
import "../css/register-page.css";

function getApiMessage(result, fallback) {
  const message = result?.detail || result?.details || result?.message;
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.map((item) => item.msg).filter(Boolean).join(" ");
  return fallback;
}

async function postPasswordRequest(path, payload, accessToken) {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  if (!backendUrl) throw new Error("VITE_BACKEND_URL is not configured.");

  const headers = { "Content-Type": "application/json", Accept: "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(`${backendUrl.replace(/\/$/, "")}/${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(getApiMessage(result, `Request failed (${response.status})`));
  }
  return result;
}

function PasswordPageLayout({ title, description, icon, children, footer }) {
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
            <span className="intro-badge"><ShieldCheck size={15} /> Keep your account secure</span>
            <h1>Your account.<br /><span>Your control.</span></h1>
            <p>Manage your password safely and get back to enjoying everything ClaySpace has to offer.</p>
            <div className="intro-benefits">
              <div className="intro-benefit"><span className="benefit-icon mint"><CheckCircle2 size={19} /></span><span><strong>Secure by design</strong><small>Password requests are handled securely.</small></span></div>
              <div className="intro-benefit"><span className="benefit-icon peach"><LockKeyhole size={19} /></span><span><strong>Private to you</strong><small>Your account details stay protected.</small></span></div>
            </div>
          </div>
          <p className="intro-footer">A little creativity. A better experience.</p>
        </aside>

        <section className="register-form-side">
          <div className="register-card">
            <div className="form-heading">
              <div className="form-heading-icon">{icon}</div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
            {children}
            <div className="form-security-note"><ShieldCheck size={16} /><span>Your account information stays protected.</span></div>
          </div>
          <p className="mobile-register-footer">© {new Date().getFullYear()} ClaySpace. All rights reserved.</p>
          {footer}
        </section>
      </section>
    </main>
  );
}

function FormAlert({ message, success = false }) {
  if (!message) return null;
  return (
    <div className={`form-alert ${success ? "success-alert" : "error-alert"}`} role={success ? "status" : "alert"}>
      {success ? <CheckCircle2 size={19} /> : <CircleAlert size={19} />}
      <span>{message}</span>
    </div>
  );
}

function ForgotPasswordForm() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(z.object({
      email: z.string().trim().email("Enter a valid email address"),
    })),
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }) => {
    setError("");
    setMessage("");
    try {
      const result = await postPasswordRequest("forgot-password", { email: email.trim() });
      setMessage(getApiMessage(result, "If an account exists for this email, you will receive a password reset link."));
      reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to request a password reset.");
    }
  };

  return (
    <>
      <FormAlert message={error} />
      <FormAlert message={message} success />
      <form className="register-form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="forgot-email">Email address</label>
          <div className={`input-shell ${errors.email ? "input-invalid" : ""}`}>
            <Mail size={19} className="input-icon" />
            <input id="forgot-email" type="email" placeholder="you@example.com" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          </div>
          {errors.email && <p className="field-error">{errors.email.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary register-submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending request..." : "Send reset link"}{!isSubmitting && <ArrowRight size={19} />}
        </button>
      </form>
      <div className="form-divider"><span>REMEMBERED YOUR PASSWORD?</span></div>
      <p className="login-prompt"><Link to="/login">Back to sign in</Link></p>
    </>
  );
}

function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(z.object({
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    }).refine((values) => values.newPassword === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ newPassword }) => {
    setError("");
    setMessage("");
    try {
      const result = await postPasswordRequest("reset-password", { token, new_password: newPassword });
      setMessage(getApiMessage(result, "Your password has been reset. You can now sign in."));
      reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to reset your password.");
    }
  };

  return (
    <>
      <FormAlert message={error || (!token ? "This reset link is missing its token. Request a new link to continue." : "")} />
      <FormAlert message={message} success />
      <form className="register-form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="reset-password">New password</label>
          <div className={`input-shell ${errors.newPassword ? "input-invalid" : ""}`}>
            <LockKeyhole size={19} className="input-icon" />
            <input id="reset-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </div>
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="reset-confirm-password">Confirm new password</label>
          <div className={`input-shell ${errors.confirmPassword ? "input-invalid" : ""}`}>
            <LockKeyhole size={19} className="input-icon" />
            <input id="reset-confirm-password" type="password" autoComplete="new-password" placeholder="Re-enter your new password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          </div>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary register-submit" disabled={isSubmitting || !token}>
          {isSubmitting ? "Resetting password..." : "Reset password"}{!isSubmitting && <ArrowRight size={19} />}
        </button>
      </form>
      <div className="form-divider"><span>ALREADY RESET YOUR PASSWORD?</span></div>
      <p className="login-prompt"><Link to="/login">Back to sign in</Link></p>
    </>
  );
}

function ChangePasswordForm() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(z.object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    }).refine((values) => values.newPassword === values.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async ({ currentPassword, newPassword }) => {
    setError("");
    setMessage("");
    try {
      const accessToken = window.localStorage.getItem("access_token");
      if (!accessToken) throw new Error("Please sign in to change your password.");
      const result = await postPasswordRequest("change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      }, accessToken);
      setMessage(getApiMessage(result, "Your password has been changed."));
      reset();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to change your password.");
    }
  };

  if (loading) return <p className="login-prompt">Checking your sign-in status...</p>;
  if (!user) {
    return (
      <>
        <FormAlert message="Please sign in to change your password." />
        <p className="login-prompt"><Link to="/login">Sign in</Link></p>
      </>
    );
  }

  return (
    <>
      <FormAlert message={error} />
      <FormAlert message={message} success />
      <form className="register-form login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="form-field">
          <label htmlFor="current-password">Current password</label>
          <div className={`input-shell ${errors.currentPassword ? "input-invalid" : ""}`}>
            <LockKeyhole size={19} className="input-icon" />
            <input id="current-password" type="password" autoComplete="current-password" placeholder="Enter your current password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
          </div>
          {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="new-password">New password</label>
          <div className={`input-shell ${errors.newPassword ? "input-invalid" : ""}`}>
            <LockKeyhole size={19} className="input-icon" />
            <input id="new-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
          </div>
          {errors.newPassword && <p className="field-error">{errors.newPassword.message}</p>}
        </div>
        <div className="form-field">
          <label htmlFor="confirm-new-password">Confirm new password</label>
          <div className={`input-shell ${errors.confirmPassword ? "input-invalid" : ""}`}>
            <LockKeyhole size={19} className="input-icon" />
            <input id="confirm-new-password" type="password" autoComplete="new-password" placeholder="Re-enter your new password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
          </div>
          {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
        </div>
        <button type="submit" className="btn btn-primary register-submit" disabled={isSubmitting}>
          {isSubmitting ? "Changing password..." : "Change password"}{!isSubmitting && <ArrowRight size={19} />}
        </button>
      </form>
    </>
  );
}

export default function PasswordPage() {
  const { pathname } = useLocation();
  const isReset = pathname === "/reset-password";
  const isChange = pathname === "/change-password";
  const title = isReset ? "Set a new password" : isChange ? "Change your password" : "Forgot your password?";
  const description = isReset
    ? "Choose a new password for your account."
    : isChange
      ? "Update your password using your current one."
      : "Enter your email and we will send you a reset link.";
  const icon = isReset ? <KeyRound size={24} /> : isChange ? <LockKeyhole size={24} /> : <Mail size={24} />;

  return (
    <PasswordPageLayout title={title} description={description} icon={icon}>
      {isReset ? <ResetPasswordForm /> : isChange ? <ChangePasswordForm /> : <ForgotPasswordForm />}
    </PasswordPageLayout>
  );
}
