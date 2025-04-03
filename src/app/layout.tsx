import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "next-themes"
import Navbar from "@/components/common/Navbar";
import { Toaster } from "@/components/ui/sonner";
import "@radix-ui/themes/styles.css";
import { DM_Sans } from 'next/font/google'

const font = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudySync",
  description: "A comprehensive study tracker for all.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${font.variable}`}>
           <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
        <Navbar />
        {children}
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
