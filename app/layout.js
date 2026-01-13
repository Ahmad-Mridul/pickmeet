import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PickMeet",
  description: "A OBPLC Service",
  // icons: {
  //   icon: "/favicon.png"
  // }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex bg-gray-50`}
      >
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto w-full">
          {children}
        </main>
      </body>
    </html>
  );
}
