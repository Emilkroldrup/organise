import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-bold">
          Organiser App
        </Link>
        <div className="space-x-4">
          <Link href="/tasks" className="hover:text-gray-300 transition-colors">
            Tasks
          </Link>
          <Link
            href="/calendar"
            className="hover:text-gray-300 transition-colors"
          >
            Calendar
          </Link>
          <Link href="/notes" className="hover:text-gray-300 transition-colors">
            Notes
          </Link>
        </div>
      </div>
    </nav>
  );
}
