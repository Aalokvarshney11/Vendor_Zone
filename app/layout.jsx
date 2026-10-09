import "./globals.css";
import GridBackground from "@/components/GridBackground";

export const metadata = {
  title: "VendorZone — Smart Digital Management for Street Vendors",
  description:
    "Empowering street vendors and municipal officers with authorized vending zones, instant digital permits, QR verification, and transparent complaint resolution.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen text-slate-900 antialiased">
        <GridBackground>{children}</GridBackground>
      </body>
    </html>
  );
}
