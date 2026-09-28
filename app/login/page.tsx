"use client";

import { useState } from "react";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

async function handleLogin(e: React.FormEvent) {
e.preventDefault();

setError("");
setLoading(true);

try {
  const cleanEmail = email.trim().toLowerCase();

  const credential = await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    password
  );

  const snap = await getDoc(
    doc(db, "users", credential.user.uid)
  );

  if (!snap.exists()) {
    await auth.signOut();
    setError(
      "Firebase login succeeded, but your Firestore user profile was not found."
    );
    return;
  }

  const role = snap.data().role;

  if (role === "user") {
    router.push("/user-dashboard");
  } else {
    router.push("/dashboard");
  }
} catch (err: any) {
  console.error("Firebase Login Error:", err);

  const code = err?.code || "";

  if (code === "auth/invalid-credential") {
    setError(
      "Firebase says the email or password is incorrect. Please verify the password in Authentication → Users."
    );
  } else if (code === "auth/wrong-password") {
    setError("Firebase says the password is incorrect.");
  } else if (code === "auth/user-not-found") {
    setError("Firebase cannot find this email account.");
  } else if (code === "auth/invalid-email") {
    setError("The email address format is invalid.");
  } else if (code === "auth/operation-not-allowed") {
    setError(
      "Email/Password login is not enabled in Firebase Authentication."
    );
  } else if (code === "auth/network-request-failed") {
    setError(
      "Network connection failed. Please check your internet connection."
    );
  } else {
    setError(
      `Firebase login error: ${code || "Unknown error"}`
    );
  }
} finally {
  setLoading(false);
}

}

return (
<main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
<div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
<div className="mb-8 text-center">
<h1 className="text-3xl font-bold text-slate-900">
Welcome Back
</h1>

      <p className="mt-2 text-sm text-slate-500">
        Sign in to your Task Manager account
      </p>
    </div>

    {error && (
      <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
        {error}
      </div>
    )}

    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Email
        </label>

        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Password
        </label>

        <div className="relative">
          <input
            required
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600">
          <input type="checkbox" />
          Remember Me
        </label>

        <Link
          href="/forgot-password"
          className="font-medium text-slate-900 hover:underline"
        >
          Forgot Password?
        </Link>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Login"}
      </button>
    </form>

    <p className="mt-6 text-center text-sm text-slate-500">
      Need an Admin account?{" "}
      <Link
        href="/register"
        className="font-semibold text-slate-900 hover:underline"
      >
        Create Admin Account
      </Link>
    </p>
  </div>
</main>

);
}
