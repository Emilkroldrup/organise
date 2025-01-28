import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between">
        <Link href="/" className="text-lg font-bold">
          Organiser App
        </Link>
        <div className="space-x-4">
          <Link href="/tasks">Tasks</Link>
          <Link href="/calendar">Calendar</Link>
          <Link href="/notes">Notes</Link>
        </div>
      </div>
    </nav>
  );
}
