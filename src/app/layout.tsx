import type { Metadata, Viewport } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const TITLE = "tailit — AI resume builder that tailors your resume to any job";
const DESCRIPTION =
  "Build your resume with AI, then paste a job link and tailit rewrites it to match — 65 templates and one-click PDF export. Free, no signup, your data stays in your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · tailit",
  },
  description: DESCRIPTION,
  applicationName: "tailit",
  keywords: [
    "AI resume builder",
    "resume tailoring",
    "tailor resume to job",
    "ATS resume",
    "free resume builder",
    "CV builder",
    "PDF resume",
    "job application",
    "resume to job description",
    "Typst resume",
  ],
  authors: [{ name: "Sardor" }],
  creator: "Sardor",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "tailit",
    title: TITLE,
    description: DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description:
      "Build your resume with AI, then tailor it to any job — just paste the link. Free, no signup, data stays in your browser.",
    creator: "@sardorml",
    site: "@sardorml",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "productivity",
};

export const viewport: Viewport = {
  themeColor: "#1677ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <Providers>{children}</Providers>
        </AntdRegistry>
      </body>
    </html>
  );
}
