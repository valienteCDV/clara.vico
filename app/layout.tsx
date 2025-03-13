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
    width: "1200",
    initialScale: 0.7,
    minimumScale: 0.1,
    maximumScale: 5,
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
            touch-action: manipulation;
          }
          
          /* Forzar tema claro y deshabilitar tema oscuro */
          @media (prefers-color-scheme: dark) {
            html {
              color-scheme: light only;
            }
            
            .dark {
              color-scheme: light only;
              --background: oklch(1 0 0);
              --foreground: oklch(0.129 0.042 264.695);
            }
          }
          
          /* Habilitar zoom con gestos */
          * {
            touch-action: pan-x pan-y;
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
