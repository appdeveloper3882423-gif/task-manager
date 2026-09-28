import Link from "next/link";

const stats = [
  { title: "Total Tasks", value: "24" },
  { title: "Pending", value: "8" },
  { title: "In Progress", value: "6" },
  { title: "Completed", value: "10" },
];

const tasks = [
  {
    title: "Prepare monthly report",
    assignedBy: "Ali",
    group: "Karachi Team",
    status: "In Progress",
    priority: "High",
  },
  {
    title: "Review customer requests",
    assignedBy: "Ahmed",
    group: "Support Team",
    status: "Pending",
    priority: "Medium",
  },
  {
    title: "Update project documentation",
    assignedBy: "Ali",
    group: "Karachi Team",
    status: "Completed",
    priority: "Low",
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r bg-white p-5 md:block">
          <div className="mb-8 text-xl font-bold text-slate-900">
            Task Manager
          </div>

          <nav className="space-y-2">
            <NavItem href="/dashboard" text="Dashboard" active />
            <NavItem href="/dashboard/tasks" text="Tasks" />
            <NavItem href="/dashboard/users" text="Users" />
            <NavItem href="/dashboard/groups" text="Groups" />
            <NavItem href="/dashboard/profile" text="My Profile" />
            <NavItem href="/dashboard/settings" text="Settings" />
          </nav>

          <button className="mt-10 w-full rounded-xl px-4 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50">
            Logout
          </button>
        </aside>

        <section className="flex-1">
          <header className="border-b bg-white px-5 py-4 md:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Dashboard
                </h1>
                <p className="text-sm text-slate-500">
                  Welcome back. Here is your task overview.
                </p>
              </div>

              <Link
                href="/dashboard/tasks"
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create Task
              </Link>
            </div>
          </header>

          <div className="p-5 md:p-8">
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <p className="text-sm text-slate-500">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="text-lg font-bold text-slate-900">
                  Recent Tasks
                </h2>
              </div>

              <div className="divide-y">
                {tasks.map((task) => (
                  <div
                    key={task.title}
                    className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Given by {task.assignedBy} • {task.group}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {task.priority}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                        {task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function NavItem({
  href,
  text,
  active = false,
}: {
  href: string;
  text: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`block rounded-xl px-4 py-3 text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {text}
    </Link>
  );
}
