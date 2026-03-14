import type { Metadata } from "next";
import {  Raleway } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers/Providers";

const raleway = Raleway({ subsets: ['latin'], variable: '--font-sans' });


export const metadata: Metadata = {
  title: "Nestify",
  description: "A modern full-stack web application using Next.js.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", raleway.variable)}>
      <body className={`overflow-x-hidden antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
