import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "../lib/AppContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "OUIYA - The Offer Explorer | Verified Local Deals in Pondicherry",
  description: "Discover verified discount coupons, hotel vouchers, french bistros, two wheeler rentals & exclusive lifestyle deals in Pondicherry.",
  keywords: ["Pondicherry deals", "Ouiya", "Puducherry offers", "White Town restaurants", "Pondy scooter rental"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} font-sans h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-[#0B0F19] text-zinc-900 dark:text-zinc-100 selection:bg-[#DC0101] selection:text-white">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
