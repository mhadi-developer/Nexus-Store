
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import "../css/register-page.css"
import {
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  CircleAlert,
} from "lucide-react";

import { z } from "zod";

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    userName: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    terms: z.boolean().refine((value) => value, {
      message: "You must accept the terms",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [registered, setRegistered] = useState(false);

const {
  register,
  handleSubmit,
  watch,
  setValue,
  formState: { errors, isSubmitting },
} = useForm({
  resolver: zodResolver(registerSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    terms: false,
  },
});
const onSubmit = async (values) => {
  setSubmitError("");
  setRegistered(false);

  const payload = {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    userName: values.userName.trim(),
    email: values.email.trim(),
    password: values.password,
  };

  console.log('payload:',payload)

  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    if (!backendUrl) {
      throw new Error("VITE_BACKEND_URL is not configured.");
    }

    const response = await fetch(
      `${backendUrl.replace(/\/$/, "")}/create/user`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        result?.detail ||
        result?.message ||
        `Registration failed (${response.status})`;

      throw new Error(
        typeof message === "string"
          ? message
          : JSON.stringify(message)
      );
    }

    setRegistered(true);
    console.log("Registration successful:", result);
  } catch (error) {
    console.error("Registration error:", error);

    setSubmitError(
      error instanceof Error
        ? error.message
        : "Unable to create your account. Please try again."
    );
  }
};
  return (
    <main className="register-page">
      <div className="register-decoration decoration-one" />
      <div className="register-decoration decoration-two" />
      <div className="register-decoration decoration-three" />

      <section className="register-layout">
        {/* Left promotional panel */}
        <aside className="register-intro">
          <a href="/" className="register-brand">
            <span className="register-brand-icon">
              <Sparkles size={24} />
            </span>
            <span className="logo">ClaySpace</span>
          </a>

          <div className="intro-content">
            <span className="intro-badge">
              <Sparkles size={15} />
              Your next chapter starts here
            </span>

            <h1>
              Create your
              <br />
              account.
              <br />
              <span>Make it yours.</span>
            </h1>

            <p>
              Join a community built around simplicity, creativity,
              and a better digital experience.
            </p>

            <div className="intro-benefits">
              <div className="intro-benefit">
                <span className="benefit-icon mint">
                  <CheckCircle2 size={19} />
                </span>
                <span>
                  <strong>Simple to get started</strong>
                  <small>Set up your account in minutes.</small>
                </span>
              </div>

              <div className="intro-benefit">
                <span className="benefit-icon peach">
                  <ShieldCheck size={19} />
                </span>
                <span>
                  <strong>Security-conscious design</strong>
                  <small>Your account deserves protection.</small>
                </span>
              </div>
            </div>
          </div>

          <p className="intro-footer">
            A little creativity. A better experience.
          </p>
        </aside>

        {/* Registration form */}
        <section className="register-form-side">
          <div className="register-card">
            <div className="form-heading">
              <div className="form-heading-icon">
                <UserRound size={24} />
              </div>

              <h2>Create account</h2>
              <p>Fill in your details to get started.</p>
            </div>

            {registered && (
              <div className="form-alert success-alert" role="status">
                <CheckCircle2 size={19} />
                <span>
                  Form validated successfully. Connect your API
                  to create the account.
                </span>
              </div>
            )}

            {submitError && (
              <div className="form-alert error-alert" role="alert">
                <CircleAlert size={19} />
                <span>{submitError}</span>
              </div>
            )}

            <form
              className="register-form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Full name */}
              <div className="form-row">
  <div className="form-group">
    <label htmlFor="firstName">First name</label>
    <input
      id="firstName"
      type="text"
      placeholder="First name"
      {...register("firstName")}
    />
    {errors.firstName && (
      <p className="field-error">{errors.firstName.message}</p>
    )}
  </div>

  <div className="form-group">
    <label htmlFor="lastName">Last name</label>
    <input
      id="lastName"
      type="text"
      placeholder="Last name"
      {...register("lastName")}
    />
    {errors.lastName && (
      <p className="field-error">{errors.lastName.message}</p>
    )}
  </div>
</div>
              {/* Username */}
              <div className="form-group">
                <label htmlFor="userName">Username</label>
                <input
                  id="userName"
                  type="text"
                  placeholder="Choose a username"
                  autoComplete="username"
                  aria-invalid={!!errors.userName}
                  aria-describedby={errors.userName ? "userName-error" : undefined}
                  {...register("userName")}
                />
                {errors.userName && (
                  <p className="field-error" id="userName-error">
                    {errors.userName.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="form-field">
                <label htmlFor="email">Email address</label>

                <div
                  className={`input-shell ${
                    errors.email ? "input-invalid" : ""
                  }`}
                >
                  <Mail size={19} className="input-icon" />

                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    aria-invalid={!!errors.email}
                    aria-describedby={
                      errors.email ? "email-error" : undefined
                    }
                    {...register("email")}
                  />
                </div>

                {errors.email && (
                  <p className="field-error" id="email-error">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="form-field">
                <label htmlFor="password">Password</label>

                <div
                  className={`input-shell ${
                    errors.password ? "input-invalid" : ""
                  }`}
                >
                  <LockKeyhole size={19} className="input-icon" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : "password-hint"
                    }
                    {...register("password")}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.password ? (
                  <p className="field-error" id="password-error">
                    {errors.password.message}
                  </p>
                ) : (
                  <p className="field-hint" id="password-hint">
                    At least 8 characters, including uppercase,
                    lowercase, and a number.
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div className="form-field">
                <label htmlFor="confirmPassword">Confirm password</label>

                <div
                  className={`input-shell ${
                    errors.confirmPassword ? "input-invalid" : ""
                  }`}
                >
                  <LockKeyhole size={19} className="input-icon" />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={
                      errors.confirmPassword
                        ? "confirmPassword-error"
                        : undefined
                    }
                    {...register("confirmPassword")}
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() =>
                      setShowConfirmPassword((current) => !current)
                    }
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="field-error" id="confirmPassword-error">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="terms-field">
                <label className="terms-label">
                  <input type="checkbox" {...register("terms")} />

                  <span className="custom-checkbox">
                    <CheckCircle2 size={15} />
                  </span>

                  <span>
                    I agree to the{" "}
                    <a href="/terms">Terms of Service</a>{" "}
                    and <a href="/privacy">Privacy Policy</a>.
                  </span>
                </label>

                {errors.terms && (
                  <p className="field-error">
                    {errors.terms.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary register-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating account..." : "Create account"}
                {!isSubmitting && <ArrowRight size={19} />}
              </button>
            </form>

            <div className="form-divider">
              <span>ALREADY HAVE AN ACCOUNT?</span>
            </div>

            <p className="login-prompt">
              Welcome back!{" "}
              <a href="/login">Sign in instead</a>
            </p>

            <div className="form-security-note">
              <ShieldCheck size={16} />
              <span>Your account information stays protected.</span>
            </div>
          </div>

          <p className="mobile-register-footer">
            © {new Date().getFullYear()} ClaySpace. All rights reserved.
          </p>
        </section>
      </section>
    </main>
  );
}
