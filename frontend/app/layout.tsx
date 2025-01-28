import type { Metadata } from "next";
import "../styles/globals.css";
import ReduxProvider from "@/redux/Provider";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Organise",
  description: "Organise your life with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen bg-gray-100 dark:bg-gray-800 text-white">
        <ReduxProvider>
          <div className="flex w-full h-full">
            <Sidebar />
            <main className="flex-grow p-6 ml-64">{children}</main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
