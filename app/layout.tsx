import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProvider } from "../lib/AppContext";

export const viewport: Viewport = {
  themeColor: "#DC0101",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "OUIYA - The Offer Explorer | Verified Local Deals in Pondicherry",
  description: "Discover verified discount coupons, hotel vouchers, french bistros, two wheeler rentals & exclusive lifestyle deals in Pondicherry.",
  keywords: ["Pondicherry deals", "Ouiya", "Puducherry offers", "White Town restaurants", "Pondy scooter rental", "Pondicherry resorts"],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ouiya.in"),
  openGraph: {
    title: "OUIYA - The Offer Explorer",
    description: "Verified Local Deals, Discounts & Vouchers in Pondicherry",
    siteName: "OUIYA Pondicherry",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "OUIYA - The Offer Explorer",
    description: "Verified Local Deals, Discounts & Vouchers in Pondicherry",
  },
  icons: {
    icon: "/assets/icons/Logo.png",
    apple: "/assets/icons/Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="font-sans h-full antialiased scroll-smooth"
    >
      <body className="min-h-full flex flex-col bg-[#F7F7F7] dark:bg-[#18181B] text-[#1A1A1A] dark:text-[#F9FAFB] selection:bg-[#DC0101] selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
