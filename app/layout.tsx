import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const coopFont = localFont({
  src: [
    { path: "../public/fonts/CoopRg.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/CoopIt.ttf", weight: "400", style: "italic" },
    { path: "../public/fonts/CoopBd.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/CoopBdIt.ttf", weight: "700", style: "italic" },
  ],
  variable: "--font-coop",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Leistungserfassung",
  description: "Demo Leistungserfassung",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className={`${coopFont.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
