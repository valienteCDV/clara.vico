import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "",
  description: "",
  viewport: {
    width: "device-width",
    initialScale: 1,
    minimumScale: 0.5,
    maximumScale: 3,
    userScalable: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" data-force-theme="light">
      <head>
        <style>{`
          html, body {
            background-color: #f0f4f8;
            overscroll-behavior: none;
            color-scheme: light only;
          }
          
          /* Permitir todos los gestos táctiles, incluido el zoom */
          * {
            touch-action: auto;
          }
        `}</style>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
      >
        {children}
      </body>
    </html>
  );
}
