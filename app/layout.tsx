import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://goodecosolutions.in"),
  title: {
    default: "JSECO | Authorised RVSF Vehicle Scrapping Facility",
    template: "%s | JSECO RVSF",
  },
  description: "JSECO is an official Registered Vehicle Scrapping Facility (RVSF). Responsible ELV recycling, instant scrap valuation, and legal VAHAN de-registration.",
  keywords: [
    "vehicle scrapping Baghpat",
    "car scrapping Baghpat",
    "RVSF Baghpat",
    "vehicle scrap Baghpat",
    "vehicle scrapping Ghaziabad",
    "car scrapping Ghaziabad",
    "RVSF Ghaziabad",
    "vehicle scrap Ghaziabad",
    "old car scrap Baghpat",
    "authorized vehicle scrapping facility Baghpat",
    "vehicle scrapping near me",
    "car scrap near me",
    "ELV recycling Ghaziabad",
    "end of life vehicle recycling",
    "vehicle scrapping facility near Delhi",
    "car scrapping Delhi NCR",
    "vehicle scrapping Uttar Pradesh",
    "RVSF Uttar Pradesh",
    "scrap car price Ghaziabad",
    "old vehicle scrapping",
    "vehicle scrapping certificate",
    "Certificate of Deposit vehicle scrapping",
    "commercial vehicle scrapping",
    "truck scrapping",
    "bus scrapping",
    "tempo scrapping",
    "commercial vehicle RVSF",
    "old truck scrap",
    "vehicle scrapping for fleet owner",
    "vehicle scrappage policy",
    "vehicle scrapping benefits",
    "vehicle scrappage certificate",
    "vehicle scrapping road tax benefits",
    "vehicle scrapping registration fee benefits",
    "Parivahan vehicle scrapping",
    "Vahan vehicle scrapping"
  ],
  authors: [{ name: "JSECO Private Limited" }],
  creator: "JSECO Private Limited",
  publisher: "JSECO Private Limited",
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
  openGraph: {
    title: "JSECO | Authorised RVSF Vehicle Scrapping Facility",
    description: "JSECO is a registered vehicle scrapping facility. Best scrap car prices, doorstep pickup, and instant Certificate of Deposit (COD).",
    url: "https://goodecosolutions.in",
    siteName: "JSECO Private Limited",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/logo.jpeg",
        width: 800,
        height: 600,
        alt: "JSECO Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSECO | Authorised RVSF Vehicle Scrapping Facility",
    description: "Official Registered Vehicle Scrapping Facility. Best scrap value, doorstep pickup & VAHAN deregistration.",
    images: ["/logo.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
