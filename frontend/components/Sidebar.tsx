"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white p-6 flex flex-col shadow-lg">
      <Image
        src="/logo.png"
        alt="Logo"
        width={128}
        height={128}
        className="w-32 h-auto mx-auto mb-6"
      />
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
}: Readonly<{
  href: string;
  label: string;
  pathname: string;
}>) {
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-lg text-lg font-medium transition-colors duration-200 hover:bg-gray-700 ${
        pathname === href ? "bg-gray-700" : ""
      }`}
    >
      {label}
    </Link>
  );
}
