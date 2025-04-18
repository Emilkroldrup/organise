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
      <body className="flex h-screen overflow-hidden bg-gray-900">
        <ReduxProvider>
          <div className="flex w-full h-full">
            <Sidebar />
            <main className="flex-grow h-screen overflow-auto">{children}</main>
          </div>
        </ReduxProvider>
      </body>
    </html>
  );
}
