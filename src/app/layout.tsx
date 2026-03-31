import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

import { ThemeProvider } from "@/components/ThemeProvider";
import Chatbot from "@/components/Chatbot";
import MainLayout from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "Maestro Caree",
  description: "Experience the future of career exploration with our interactive 3D platform.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased selection:bg-primary selection:text-white`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainLayout>
            {children}
            <Chatbot />
          </MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
