"use client";

import { useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";
import {
  initializeApp,
  getApps,
} from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../../lib/firebase";

type UserItem = {
  id: string;
  name: string;
  email: string;
  status?: string;
};

const firebaseConfig = {
  apiKey:
    "AIzaSyA__VCR9IGqmFxjSk0e3pcu5dh6IRdzNr0",
  authDomain:
    "task-6ced7.firebaseapp.com",
  projectId:
    "task-6ced7",
  storageBucket:
    "task-6ced7.firebasestorage.app",
  messagingSenderId:
    "693208081052",
  appId:
    "1:693208081052:web:1e8336dca22b53d9e80359",
};

export default function UsersPage() {
  const [users, setUsers] =
    useState<UserItem[]>([]);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState("");

  const [message, setMessage] =
    useState("");

  async function loadUsers(
    adminId: string
  ) {
    const q = query(
      collection(db, "users"),
      where(
        "adminIds",
        "array-contains",
        adminId
      )
    );

    const snap = await getDocs(q);

    const data = snap.docs
      .map((item) => {
        const value = item.data();

        return {
          id: item.id,
          name:
            value.name ||
            "Unnamed User",
          email:
            value.email || "",
          status:
            value.status ||
            "active",
          role:
            value.role || "user",
        };
      })
      .filter(
        (item: any) =>
          item.role === "user"
      ) as UserItem[];

    setUsers(
      data.filter(
        (item) =>
          item.id !== adminId
      )
    );
  }

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        async (user) => {
          if (!user) {
            setLoading(false);
            return;
          }

          try {
            await loadUsers(
              user.uid
            );
          } catch (error) {
            console.error(
              "Load users error:",
              error
            );

            setMessage(
              "Unable to load users. Please check your Firestore Rules."
            );
          } finally {
            setLoading(false);
          }
        }
      );

    return () =>
      unsubscribe();
  }, []);

  async function addUser(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (
      !name.trim() ||
      !email.trim() ||
      password.length < 6
    ) {
      setMessage(
        "Enter all fields. Password must be at least 6 characters."
      );
      return;
    }

    if (!auth.currentUser) {
      setMessage(
        "Please login again."
      );
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const adminId =
        auth.currentUser.uid;

      const secondaryApp =
        getApps().find(
          (app) =>
            app.name ===
            "UserCreator"
        ) ||
        initializeApp(
          firebaseConfig,
          "UserCreator"
        );

      const secondaryAuth =
        getAuth(
          secondaryApp
        );

      const cleanEmail =
        email
          .trim()
          .toLowerCase();

      const cleanName =
        name.trim();

      const credential =
        await createUserWithEmailAndPassword(
          secondaryAuth,
          cleanEmail,
          password
        );

      await setDoc(
        doc(
          db,
          "users",
          credential.user.uid
        ),
        {
          name: cleanName,
          email: cleanEmail,
          role: "user",
          status: "active",
          adminIds: [adminId],
          createdBy: adminId,
          createdAt:
            serverTimestamp(),
        }
      );

      await loadUsers(
        adminId
      );

      setName("");
      setEmail("");
      setPassword("");
      setShowPassword(false);

      setMessage(
        "User account created successfully."
      );
    } catch (err: any) {
      console.error(
        "Create user error:",
        err
      );

      if (
        err?.code ===
        "auth/email-already-in-use"
      ) {
        setMessage(
          "This email already has an account."
        );
      } else if (
        err?.code ===
        "auth/weak-password"
      ) {
        setMessage(
          "Password must be at least 6 characters."
        );
      } else if (
        err?.code ===
        "permission-denied"
      ) {
        setMessage(
          "User Auth account was created, but Firestore permission was denied. Please check Firestore Rules."
        );
      } else {
        setMessage(
          "Unable to create user."
        );
      }
    } finally {
      setSaving(false);
    }
  }

  async function deleteUser(
    user: UserItem
  ) {
    if (!auth.currentUser) {
      setMessage(
        "Please login again."
      );
      return;
    }

    const confirmed =
      window.confirm(
        `Delete user "${user.name}" from the system?`
      );

    if (!confirmed) {
      return;
    }

    setDeletingId(user.id);
    setMessage("");

    try {
      await deleteDoc(
        doc(
          db,
          "users",
          user.id
        )
      );

      await loadUsers(
        auth.currentUser.uid
      );

      setMessage(
        `User "${user.name}" was removed from the system.`
      );
    } catch (error: any) {
      console.error(
        "Delete user error:",
        error
      );

      if (
        error?.code ===
        "permission-denied"
      ) {
        setMessage(
          "You do not have permission to delete this user."
        );
      } else {
        setMessage(
          "Unable to delete user."
        );
      }
    } finally {
      setDeletingId("");
    }
  }

  return (
    <main className="p-5 md:p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Users
        </h1>

        <p className="mt-1 text-slate-500">
          Create and manage users.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="text-lg font-bold text-slate-900">
            Create User
          </h2>

          <form
            onSubmit={addUser}
            className="mt-5 space-y-4"
          >

            <input
              required
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
              placeholder="Full Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <input
              required
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="Email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <div className="relative">

              <input
                required
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                minLength={6}
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                placeholder="Temporary Password"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 outline-none focus:border-slate-900"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500"
              >
                {showPassword
                  ? "Hide"
                  : "Show"}
              </button>

            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Creating..."
                : "Create User"}
            </button>

          </form>

        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">

          <div className="border-b p-6">
            <h2 className="text-lg font-bold text-slate-900">
              User List
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="divide-y">

              {users.map((user) => (
                <div
                  key={user.id}
                  className="p-6"
                >

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-base font-bold text-white">
                        {user.name
                          .charAt(0)
                          .toUpperCase() ||
                          "U"}
                      </div>

                      <div className="min-w-0">

                        <h3 className="font-semibold text-slate-900">
                          {user.name}
                        </h3>

                        <p className="break-all text-sm text-slate-500">
                          {user.email}
                        </p>

                      </div>

                    </div>

                    <div className="flex flex-wrap items-center gap-3">

                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                        {user.status ||
                          "active"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          deleteUser(
                            user
                          )
                        }
                        disabled={
                          deletingId ===
                          user.id
                        }
                        className="rounded-xl border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {deletingId ===
                        user.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>

                    </div>

                  </div>

                </div>
              ))}

            </div>
          )}

        </div>

      </div>

    </main>
  );
}
