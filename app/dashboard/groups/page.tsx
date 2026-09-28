"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
  arrayUnion,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";

type UserItem = {
  id: string;
  name: string;
  email: string;
};

type GroupItem = {
  id: string;
  name: string;
  adminIds?: string[];
  userIds?: string[];
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [name, setName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData(adminId: string) {
    const groupQuery = query(
      collection(db, "groups"),
      where("adminIds", "array-contains", adminId)
    );

    const userQuery = query(
      collection(db, "users"),
      where("adminIds", "array-contains", adminId)
    );

    const [groupSnap, userSnap] = await Promise.all([
      getDocs(groupQuery),
      getDocs(userQuery),
    ]);

    setGroups(
      groupSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as GroupItem[]
    );

    setUsers(
      userSnap.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      })) as UserItem[]
    );
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        await loadData(user.uid);
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

      await loadData(adminId);

      setName("");
      setMessage("Group created successfully.");
    } catch {
      setMessage("Unable to create group.");
    } finally {
      setSaving(false);
    }
  }

  async function addUserToGroup() {
    if (!selectedGroup || !selectedUser) {
      setMessage("Select a group and user.");
      return;
    }

    try {
      await updateDoc(doc(db, "groups", selectedGroup), {
        userIds: arrayUnion(selectedUser),
      });

      if (auth.currentUser) {
        await loadData(auth.currentUser.uid);
      }

      setMessage("User added to group.");
    } catch {
      setMessage("Unable to add user to group.");
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Groups</h1>
        <p className="mt-1 text-slate-500">
          Create groups and organize users.
        </p>
      </div>

      {message && (
        <div className="mb-6 rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900">
              Add User
            </h2>

            <div className="mt-5 space-y-4">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select Group</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} — {user.email}
                  </option>
                ))}
              </select>

              <button
                onClick={addUserToGroup}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Add Member
              </button>
            </div>
          </div>
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
