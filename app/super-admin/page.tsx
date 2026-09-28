"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "../../lib/firebase";
import { useRouter } from "next/navigation";

const SUPER_ADMIN_EMAIL = "labpc4308077@gmail.com";
const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

type TestResult = {
  name: string;
  status: "testing" | "success" | "failed";
  message: string;
  count?: number;
};

export default function SuperAdminPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loggedInEmail, setLoggedInEmail] = useState("");
  const [loggedInUid, setLoggedInUid] = useState("");

  const [tests, setTests] = useState<TestResult[]>([
    {
      name: "Users",
      status: "testing",
      message: "Waiting...",
    },
    {
      name: "Groups",
      status: "testing",
      message: "Waiting...",
    },
    {
      name: "Tasks",
      status: "testing",
      message: "Waiting...",
    },
  ]);

  const [overallError, setOverallError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        const email =
          user.email?.trim().toLowerCase() || "";

        setLoggedInEmail(email);
        setLoggedInUid(user.uid);

        if (user.uid !== SUPER_ADMIN_UID) {
          setOverallError(
            `This account is not the configured Super Admin account. Logged in UID: ${user.uid}`
          );
          setChecking(false);
          return;
        }

        await testFirestoreCollection("Users", "users");
        await testFirestoreCollection("Groups", "groups");
        await testFirestoreCollection("Tasks", "tasks");

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function testFirestoreCollection(
    name: string,
    collectionName: string
  ) {
    try {
      const snapshot = await getDocs(
        collection(db, collectionName)
      );

      setTests((current) =>
        current.map((item) =>
          item.name === name
            ? {
                ...item,
                status: "success",
                message: "Read successful.",
                count: snapshot.size,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(
        `${name} Firestore Error:`,
        err
      );

      setTests((current) =>
        current.map((item) =>
          item.name === name
            ? {
                ...item,
                status: "failed",
                message: `${err?.code || "unknown-error"} — ${
                  err?.message ||
                  "Missing or insufficient permissions."
                }`,
              }
            : item
        )
      );
    }
  }

  function statusClass(status: TestResult["status"]) {
    if (status === "success") {
      return "bg-green-50 text-green-700";
    }

    if (status === "failed") {
      return "bg-red-50 text-red-700";
    }

    return "bg-slate-100 text-slate-600";
  }

  return (
    <main className="min-h-screen bg-slate-50">

      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-8">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Task Manager
            </p>

            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Super Admin
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              System administration and security diagnostics
            </p>
          </div>

          <Link
            href="/login"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Login
          </Link>

        </div>
      </header>

      <section className="mx-auto max-w-5xl p-5 md:p-8">

        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Super Admin Authentication
          </h2>

          <div className="mt-5 space-y-3 text-sm">

            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Logged In Email
              </span>

              <span className="break-all font-medium text-slate-900">
                {loggedInEmail || "Checking..."}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Logged In UID
              </span>

              <span className="break-all font-medium text-slate-900">
                {loggedInUid || "Checking..."}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Configured Super Admin UID
              </span>

              <span className="break-all font-medium text-slate-900">
                {SUPER_ADMIN_UID}
              </span>
            </div>

            <div className="flex flex-col gap-1 rounded-xl bg-slate-50 p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Configured Super Admin Email
              </span>

              <span className="break-all font-medium text-slate-900">
                {SUPER_ADMIN_EMAIL}
              </span>
            </div>

          </div>

          {loggedInUid && (
            <div
              className={`mt-5 rounded-xl px-4 py-3 text-sm font-medium ${
                loggedInUid === SUPER_ADMIN_UID
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {loggedInUid === SUPER_ADMIN_UID
                ? "Super Admin UID verified."
                : "Super Admin UID does not match."}
            </div>
          )}

        </div>

        {overallError && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5">
            <h2 className="font-bold text-red-700">
              Authentication Error
            </h2>

            <p className="mt-2 break-all text-sm leading-6 text-red-600">
              {overallError}
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Firestore Access Test
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Each collection is tested separately.
            </p>
          </div>

          <div className="divide-y">

            {tests.map((test) => (
              <div
                key={test.name}
                className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
              >

                <div>
                  <h3 className="font-semibold text-slate-900">
                    {test.name}
                  </h3>

                  <p className="mt-1 break-all text-sm text-slate-500">
                    {test.message}
                  </p>

                  {test.status === "success" && (
                    <p className="mt-1 text-xs text-slate-400">
                      Documents found: {test.count}
                    </p>
                  )}
                </div>

                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${statusClass(
                    test.status
                  )}`}
                >
                  {test.status === "testing"
                    ? "Testing..."
                    : test.status === "success"
                    ? "Success"
                    : "Failed"}
                </span>

              </div>
            ))}

          </div>

        </div>

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <h2 className="font-bold text-amber-800">
            Important
          </h2>

          <p className="mt-2 text-sm leading-6 text-amber-700">
            This page is temporarily showing detailed Firestore
            diagnostics. Do not change anything else yet. After the
            test, we will fix the exact collection that is returning
            permission-denied.
          </p>

        </div>

        {checking && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Checking Firebase authentication and Firestore access...
          </p>
        )}

      </section>
    </main>
  );
}
