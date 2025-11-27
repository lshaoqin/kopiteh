import "./globals.css"
import { Inter } from "next/font/google";

export const metadata = {
  title: "The Volunteer Switchboard Ordering Helper",
  description: "An app that processes orders for Kopi Teh or Moi sessions.",
}

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}