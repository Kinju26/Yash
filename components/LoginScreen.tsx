"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EyeClosedIcon, EyeOpenIcon } from "@/components/icons";
import LoginMascot from "@/components/LoginMascot";
import { GENERIC_AUTH_ERROR } from "@/lib/auth/messages";
import { usePharmacy } from "@/context/PharmacyContext";

type Step = "credentials" | "location";

export function LoginScreen() {
  const { ready, currentUser, setSessionUser, branchNames, setSelectedBranches, showToast } = usePharmacy();
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");
  const [loginMsg, setLoginMsg] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pwFocus, setPwFocus] = useState(false);
  const [location, setLocation] = useState("");
  const [busy, setBusy] = useState(false);

  const multiLocation = branchNames.length > 1;

  useEffect(() => {
    if (ready && currentUser) router.replace("/dashboard");
  }, [currentUser, ready, router]);

  useEffect(() => {
    if (branchNames.length && !location) setLocation(branchNames[0]);
  }, [branchNames, location]);

  const subtitle = useMemo(() => {
    switch (step) {
      case "credentials":
        return "Sign in to continue to your account.";
      case "location":
        return "Select the pharmacy location you are working at today.";
      default: {
        const _exhaustive: never = step;
        return _exhaustive;
      }
    }
  }, [step]);

  function goAfterAuth(userEmail: string) {
    showToast("Sign in successfully");
    setLoginMsg("Sign in successfully");
    setSessionUser(userEmail);
    if (multiLocation) {
      setStep("location");
      return;
    }
    if (branchNames.length === 1) setSelectedBranches([branchNames[0]]);
    router.push("/dashboard");
  }

  async function onCredentials(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setLoginMsg("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as {
        error?: string;
        user?: { email: string };
      };
      if (!res.ok || !data.user) {
        setLoginMsg(data.error || GENERIC_AUTH_ERROR);
        return;
      }
      setPassword("");
      goAfterAuth(data.user.email);
    } catch {
      setLoginMsg(GENERIC_AUTH_ERROR);
    } finally {
      setBusy(false);
    }
  }

  function onLocation(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!location) {
      setLoginMsg("Please select a pharmacy location.");
      return;
    }
    setSelectedBranches([location]);
    setLoginMsg("");
    router.push("/dashboard");
  }

  return (
    <div className="login-host" aria-label="Sign in">
      <main className="card" data-mode="login">
        <div className="card-bg" aria-hidden="true">
          <div className="doc-stage" aria-hidden="true">
            <div className="doc-in">
              <div className="doc-figure">
                <img alt="" src="/images/login-mascot.webp?v=8" />
              </div>
            </div>
            <div className="doc-desk" />
            <div className="doc-bubble">
              Good to see you <i>👋</i>
            </div>
          </div>
        </div>

        <section className="hero login" aria-label="Staff notice">
          <h2>Authorized pharmacy staff only</h2>
          <p>Staff accounts are created by Admin invite. All activity is logged.</p>
        </section>

        <section className="form login" aria-label="Sign in">
          <div className="form-inner">
            <LoginMascot email={email} passwordFocused={pwFocus && step === "credentials"} src="/mascot.png?v=2" />
            <p className="subtitle">{subtitle}</p>

            {step === "credentials" && (
              <form onSubmit={onCredentials} noValidate>
                <div className="field">
                  <label htmlFor="loginEmail">User ID / Email</label>
                  <input
                    id="loginEmail"
                    name="email"
                    type="text"
                    autoComplete="username"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="field password-field">
                  <label htmlFor="loginPassword">Password</label>
                  <div className="input-wrap">
                    <input
                      id="loginPassword"
                      name="password"
                      type={showLoginPass ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setPwFocus(true)}
                      onBlur={() => setPwFocus(false)}
                    />
                    <button
                      className="eye"
                      type="button"
                      aria-label={showLoginPass ? "Hide password" : "Show password"}
                      onClick={() => setShowLoginPass((v) => !v)}
                    >
                      {showLoginPass ? <EyeClosedIcon /> : <EyeOpenIcon />}
                    </button>
                  </div>
                </div>
                <div className="form-row form-row-end">
                  <a
                    href="#"
                    className="link"
                    onClick={(e) => {
                      e.preventDefault();
                      setLoginMsg("Contact your admin for a reset link. Reset links expire quickly.");
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <button className="primary" type="submit" disabled={busy}>
                  Sign In
                </button>
                <div className="message" aria-live="polite">
                  {loginMsg}
                </div>
              </form>
            )}

            {step === "location" && (
              <form onSubmit={onLocation} noValidate>
                <div className="field">
                  <label htmlFor="loginLocation">Pharmacy location</label>
                  <select
                    id="loginLocation"
                    name="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  >
                    {branchNames.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>
                <button className="primary" type="submit">
                  Continue
                </button>
                <div className="message" aria-live="polite">
                  {loginMsg}
                </div>
              </form>
            )}

            <p className="auth-notice">Authorized users only. Activity is logged.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
