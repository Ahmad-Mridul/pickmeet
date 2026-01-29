"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import NextAuthSessionProvider from "./Providers/NextAuthSessionProvider";
import { usePathname } from "next/navigation";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata = {
//   title: "PickMeet",
//   description: "A OBPLC Service",
//   // icons: {
//   //   icon: "/favicon.png"
//   // }
// };

export default function RootLayout({ children }) {
  const pathname = usePathname();
  return (
    <html lang="en">
      <NextAuthSessionProvider>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased flex bg-gray-50`}
        >
          {
            pathname !== "/login" && (
              <Sidebar />
            )
          }
          <main className="flex-1 min-h-full bg-white overflow-y-auto w-full">
            {children}
          </main>
        </body>
      </NextAuthSessionProvider>
    </html>
  );
}
