import type { Metadata } from "next";
import "./globals.css";
import Chatbox from "@/components/Chatbox";

export const metadata: Metadata = {
  title: "RetroNotes — Rebuilding the Past",
  description: "A modern note-taking application with a retro-inspired CRT UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('retronotes-theme') || 'green';
                document.documentElement.setAttribute('data-theme', theme);
                const crt = localStorage.getItem('retronotes-crt') !== 'false';
                if (crt) {
                  document.documentElement.classList.add('crt-effect');
                  document.documentElement.classList.add('crt-flicker');
                } else {
                  document.documentElement.classList.remove('crt-effect');
                  document.documentElement.classList.remove('crt-flicker');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-mono antialiased overflow-x-hidden">
        {children}
        <Chatbox />
      </body>
    </html>
  );
}
