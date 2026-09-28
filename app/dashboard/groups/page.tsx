"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";

type GroupItem = {
  id: string;
  name: string;
  createdBy: string;
  adminIds?: string[];
  userIds?: string[];
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadGroups(adminId: string) {
    const q = query(
      collection(db, "groups"),
      where("adminIds", "array-contains", adminId)
    );

    const snap = await getDocs(q);

    const data = snap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as GroupItem[];

    setGroups(data);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        await loadGroups(user.uid);
      } catch {
        setMessage("Unable to load groups.");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function createGroup(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim() || !auth.currentUser) return;

    setSaving(true);
    setMessage("");

    try {
      const adminId = auth.currentUser.uid;

      await addDoc(collection(db, "groups"), {
        name: name.trim(),
        createdBy: adminId,
        type: "admin",
        adminIds: [adminId],
        userIds: [],
        createdAt: serverTimestamp(),
      });

      await loadGroups(adminId);

      setName("");
      setMessage("Group created successfully.");
    } catch {
      setMessage("Unable to create group.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
        <p className="mt-1 text-slate-500">
          Create and manage shared groups.
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
            Create Group
          </h2>

          <form onSubmit={createGroup} className="mt-5 space-y-4">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group Name"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
            />

            <button
              disabled={saving}
              className="w-full rounded-xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-50"
            >
              {saving ? "Creating..." : "Create Group"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
          <div className="border-b p-6">
            <h2 className="text-lg font-bold text-slate-900">
              Group List
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center text-sm text-slate-500">
              Loading groups...
            </div>
          ) : groups.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No groups found.
            </div>
          ) : (
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="rounded-2xl border border-slate-200 p-5"
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {group.name}
                  </h3>

                  <div className="mt-4 flex gap-5 text-sm text-slate-500">
                    <span>
                      {group.adminIds?.length || 0} Admins
                    </span>

                    <span>
                      {group.userIds?.length || 0} Users
                    </span>
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
