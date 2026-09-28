"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

const SUPER_ADMIN_UID = "3awXBqEMFhXt3QHafTiP3y2buAx2";

const navigation = [
  {
    href: "/super-admin",
    label: "Dashboard",
    icon: "▦",
  },
  {
    href: "/super-admin/admins",
    label: "Admins",
    icon: "♙",
  },
  {
    href: "/super-admin/groups",
    label: "Groups",
    icon: "◫",
  },
  {
    href: "/super-admin/users",
    label: "Users",
    icon: "♟",
  },
  {
    href: "/super-admin/tasks",
    label: "Tasks",
    icon: "✓",
  },
  {
    href: "/super-admin/settings",
    label: "System Settings",
    icon: "⚙",
  },
  {
    href: "/super-admin/profile",
    label: "My Profile",
    icon: "○",
  },
];

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("Super Admin");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.replace("/login");
          return;
        }

        if (user.uid !== SUPER_ADMIN_UID) {
          router.replace("/dashboard");
          return;
        }

        setEmail(user.email || "");

        try {
          const snap = await getDoc(
            doc(db, "users", user.uid)
          );

          if (snap.exists()) {
            const data = snap.data();
            setName(
              data.name ||
                user.displayName ||
                "Super Admin"
            );
          } else {
            setName(
              user.displayName ||
                "Super Admin"
            );
          }
        } catch {
          setName(
            user.displayName ||
              "Super Admin"
          );
        }

        setChecking(false);
      }
    );

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl font-bold text-slate-900">
            TM
          </div>

          <p className="text-sm text-slate-400">
            Loading Super Admin...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-slate-950 text-white lg:flex">

        <div className="border-b border-white/10 px-6 py-6">
          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-950">
              TM
            </div>

            <div>
              <h1 className="font-bold">
                Task Manager
              </h1>

              <p className="mt-0.5 text-xs text-slate-400">
                Super Admin Console
              </p>
            </div>

          </div>
        </div>

        <div className="border-b border-white/10 px-6 py-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Signed in as
          </p>

          <p className="mt-2 truncate text-sm font-semibold text-white">
            {name}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {email}
          </p>

          <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            Super Admin
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Management
          </p>

          <div className="space-y-1">
            {navigation.map((item) => {
              const active =
                item.href === "/super-admin"
                  ? pathname === "/super-admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    active
                      ? "bg-white text-slate-950"
                      : "text-slate-400 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg text-base">
                    {item.icon}
                  </span>

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-white/10 p-4">

          <Link
            href="/"
            className="mb-2 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <span className="flex h-7 w-7 items-center justify-center">
              ↗
            </span>

            View Website
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
          >
            <span className="flex h-7 w-7 items-center justify-center">
              ⎋
            </span>

            Logout
          </button>

        </div>
      </aside>


      {/* Mobile Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white lg:hidden">

        <div className="flex items-center justify-between px-4 py-4">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white">
              TM
            </div>

            <div className="min-w-0">
              <p className="truncate font-bold text-slate-900">
                Super Admin
              </p>

              <p className="truncate text-xs text-slate-500">
                {name}
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-red-200 px-3 py-2 text-xs font-semibold text-red-600"
          >
            Logout
          </button>

        </div>

        <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-3">

          {navigation.map((item) => {
            const active =
              item.href === "/super-admin"
                ? pathname === "/super-admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                  active
                    ? "bg-slate-950 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}

        </nav>
      </header>


      {/* Main Content */}
      <section className="min-h-screen lg:pl-72">
        {children}
      </section>

    </div>
  );
            }
