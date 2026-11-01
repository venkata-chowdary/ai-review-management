import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope-next",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Working label; the final product name is undecided.
  title: {
    template: "%s · Local Business Review Platform",
    default: "Local Business Review Platform",
  },
  description: "QR review assistant and Google review management.",
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
