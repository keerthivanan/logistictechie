import type { Metadata } from "next";
import { Inter, Outfit, Cairo } from "next/font/google";
import "@/app/globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/providers";
import { CreativeCortex } from "@/components/domain/ai/CreativeCortex";
import { ScrollProgress } from "@/components/ui/ScrollProgress";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const cairo = Cairo({ subsets: ["arabic"], variable: "--font-cairo" });

export const metadata: Metadata = {
  title: "The Global Oracle | Logistics AI",
  description: "Real-time freight rates and tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${outfit.variable} ${cairo.variable} font-sans bg-black text-white antialiased min-h-screen flex flex-col`}>
        <Providers>
          <ScrollProgress />
          <Navbar />
          <div className="flex-1 flex flex-col">
            <main className="flex-1 w-full">{children}</main>
          </div>
          <Footer />
          <CreativeCortex />
        </Providers>
      </body>
    </html>
  );
}

