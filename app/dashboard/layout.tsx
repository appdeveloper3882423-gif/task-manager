"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [name, setName] = useState("User");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          setName(snap.data().name || user.displayName || "User");
        } else {
          setName(user.displayName || "User");
        }
      } catch {
        setName(user.displayName || "User");
      }

      setChecking(false);
    });

    return () => unsubscribe();
  }, [router]);

  async function handleLogout() {
    await signOut(auth);
    router.replace("/login");
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Loading...</p>
      </main>
    );
  }

  const links = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/tasks", label: "Tasks" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/groups", label: "Groups" },
    { href: "/dashboard/profile", label: "My Profile" },
    { href: "/dashboard/settings", label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r bg-white p-5 md:block">
          <div className="mb-8">
            <div className="text-xl font-bold text-slate-900">
              Task Manager
            </div>

            <div className="mt-1 truncate text-sm text-slate-500">
              {name}
            </div>
          </div>

          <nav className="space-y-2">
            {links.map((link) => {
              const active =
                pathname === link.href ||
                (link.href !== "/dashboard" &&
                  pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-10 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="border-b bg-white px-5 py-4 md:hidden">
            <div className="mb-4 flex items-center justify-between">
              <div className="font-bold text-slate-900">Task Manager</div>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-600"
              >
                Logout
              </button>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium ${
                    pathname === link.href
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>

          {children}
        </section>
      </div>
    </div>
  );
    }
