"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../../lib/firebase";

type MemberItem = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

type GroupItem = {
  id: string;
  name: string;
  adminIds?: string[];
  userIds?: string[];
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [members, setMembers] = useState<MemberItem[]>([]);

  const [name, setName] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedMember, setSelectedMember] = useState("");

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

    const adminQuery = query(
      collection(db, "users"),
      where("role", "==", "admin")
    );

    const [groupSnap, userSnap, adminSnap] =
      await Promise.all([
        getDocs(groupQuery),
        getDocs(userQuery),
        getDocs(adminQuery),
      ]);

    const groupData = groupSnap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as GroupItem[];

    const userData = userSnap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as MemberItem[];

    const adminData = adminSnap.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    })) as MemberItem[];

    const combined = [...adminData, ...userData].filter(
      (item, index, array) =>
        array.findIndex((x) => x.id === item.id) === index
    );

    setGroups(groupData);
    setMembers(combined);
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

  async function addMemberToGroup() {
    if (!selectedGroup || !selectedMember) {
      setMessage("Select a group and member.");
      return;
    }

    const member = members.find(
      (item) => item.id === selectedMember
    );

    if (!member) return;

    try {
      const groupRef = doc(db, "groups", selectedGroup);

      if (member.role === "admin") {
        await updateDoc(groupRef, {
          adminIds: arrayUnion(member.id),
        });
      } else {
        await updateDoc(groupRef, {
          userIds: arrayUnion(member.id),
        });
      }

      if (auth.currentUser) {
        await loadData(auth.currentUser.uid);
      }

      setSelectedMember("");
      setMessage("Member added to group.");
    } catch {
      setMessage("Unable to add member to group.");
    }
  }

  return (
    <main className="p-5 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Groups
        </h1>

        <p className="mt-1 text-slate-500">
          Create groups and organize Admins and Users.
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

            <form
              onSubmit={createGroup}
              className="mt-5 space-y-4"
            >
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
              Add Member
            </h2>

            <div className="mt-5 space-y-4">
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select Group</option>

                {groups.map((group) => (
                  <option
                    key={group.id}
                    value={group.id}
                  >
                    {group.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedMember}
                onChange={(e) =>
                  setSelectedMember(e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3"
              >
                <option value="">Select Member</option>

                {members.map((member) => (
                  <option
                    key={member.id}
                    value={member.id}
                  >
                    {member.name} — {member.role}
                  </option>
                ))}
              </select>

              <button
                onClick={addMemberToGroup}
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

                  <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                    <span>
                      {group.adminIds?.length || 0} Admins
                    </span>

                    <span>
                      {group.userIds?.length || 0} Users
                    </span>
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                    Admins in this group can share relevant group
                    information and tasks.
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
