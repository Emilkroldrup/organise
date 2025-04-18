"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-950 text-white flex flex-col shadow-xl border-r border-gray-800">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-center mb-2">
          <img src="/logo.png" alt="Logo" className="w-14 h-14 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Organiser
        </h2>
      </div>

      <nav className="flex flex-col p-4 flex-grow">
        <div className="mb-4 px-2">
          <p className="text-xs uppercase text-gray-500 font-medium tracking-wider mb-2">
            Main
          </p>
          <NavItem
            href="/"
            icon={<HomeIcon />}
            label="Home"
            pathname={pathname}
          />
          <NavItem
            href="/tasks"
            icon={<TaskIcon />}
            label="Tasks"
            pathname={pathname}
          />
          <NavItem
            href="/calendar"
            icon={<CalendarIcon />}
            label="Calendar"
            pathname={pathname}
          />
          <NavItem
            href="/notes"
            icon={<NotesIcon />}
            label="Notes"
            pathname={pathname}
          />
        </div>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center p-2 rounded-lg bg-gray-800/50 text-gray-400 text-sm">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3">
            <span className="font-semibold text-white">EK</span>
          </div>
          <p>Emil K</p>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon,
  pathname,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  pathname: string;
}) {
  const isActive = pathname === href;
  return (
    <Link
      href={href}
      className={`flex items-center p-3 mb-2 rounded-lg transition-all ${
        isActive
          ? "bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-blue-900/20"
          : "text-gray-400 hover:bg-gray-800/60 hover:text-gray-100"
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-300"></span>
      )}
    </Link>
  );
}

// Icons
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

const TaskIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
    <path
      fillRule="evenodd"
      d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
      clipRule="evenodd"
    />
  </svg>
);

const CalendarIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
      clipRule="evenodd"
    />
  </svg>
);

const NotesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
);
