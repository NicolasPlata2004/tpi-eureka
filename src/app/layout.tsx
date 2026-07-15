import type { Metadata } from "next";
import { Lexend, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const lexend = Lexend({
  variable: "--font-lexend",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const splineSansMono = Spline_Sans_Mono({
  variable: "--font-spline-sans-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Eureka — Aprende álgebra sin miedo",
  description: "Plataforma gamificada de álgebra para grado 8° enfocada en la transición aritmética-álgebra.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${lexend.variable} ${splineSansMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg-soft1 text-tinta">{children}</body>
    </html>
  );
}

