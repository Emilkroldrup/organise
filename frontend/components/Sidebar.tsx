"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6 flex flex-col shadow-lg">
      <img src="/logo.png" alt="Logo" className="w-32 h-auto mx-auto mb-6" />
      <h2 className="text-2xl font-bold mb-6 text-center">Organiser</h2>
      <nav className="flex flex-col space-y-4">
        <NavItem href="/" label="Home" pathname={pathname} />
        <NavItem href="/tasks" label="Tasks" pathname={pathname} />
        <NavItem href="/calendar" label="Calendar" pathname={pathname} />
        <NavItem href="/notes" label="Notes" pathname={pathname} />
      </nav>
    </aside>
  );
}

function NavItem({
  href,
  label,
  pathname,
}: {
  href: string;
  label: string;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`p-3 rounded-lg transition-colors ${
        isActive ? "bg-blue-600" : "hover:bg-gray-700"
      }`}
    >
      {label}
    </Link>
  );
}
