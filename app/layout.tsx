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
  // Quitamos la configuración del viewport de aquí ya que la agregaremos directamente en el head
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light" data-force-theme="light">
      <head>
        {/* Meta tag viewport simplificada */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.2, maximum-scale=5, user-scalable=yes"
        />
        <style>{`
          html, body {
            background-color: #f0f4f8;
            color-scheme: light only;
            /* Eliminamos overscroll-behavior que puede interferir con el zoom */
          }
          
          /* Eliminamos cualquier restricción de gestos táctiles */
          * {
            touch-action: auto !important;
            -ms-touch-action: auto !important;
          }
        `}</style>

        {/* Script para asegurar que el zoom funcione */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            // Asegurarnos que el zoom funcione correctamente, especialmente el zoom out
            document.addEventListener('DOMContentLoaded', function() {
              // Forzar que el viewport permita zoom completo (acercar y alejar)
              const meta = document.querySelector('meta[name="viewport"]');
              if (meta) {
                meta.content = 'width=device-width, initial-scale=1.0, minimum-scale=0.1, maximum-scale=5.0, user-scalable=yes';
              }
              
              // Prevenir cualquier evento que pueda estar bloqueando el zoom
              const preventZoomHandler = function(e) {
                // No prevenir eventos de zoom
                if (e.ctrlKey || e.metaKey || e.touches?.length > 1) {
                  e.stopImmediatePropagation();
                }
              };
              
              // Aplicar a eventos relevantes
              document.addEventListener('touchstart', preventZoomHandler, true);
              document.addEventListener('touchmove', preventZoomHandler, true);
              document.addEventListener('wheel', preventZoomHandler, true);
            });
          `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased light`}
      >
        {children}
      </body>
    </html>
  );
}
