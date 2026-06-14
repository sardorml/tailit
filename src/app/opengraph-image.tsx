import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_HOST } from "@/lib/site";

// Generated Open Graph / social-share card for tailit. Next.js renders this to a
// static PNG at build time and wires up the og:image + twitter:image meta tags.
export const alt =
  "tailit — AI resume tailoring. Paste a job link and your resume is rewritten to match.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#1677ff"; // stock antd primary — same brand blue as the app

export default async function Image() {
  const fontsDir = join(process.cwd(), "src/templates/vantage/fonts");
  const [regular, bold] = await Promise.all([
    readFile(join(fontsDir, "PTSans-Regular.ttf")),
    readFile(join(fontsDir, "PTSans-Bold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0a0e1a",
          backgroundImage:
            "radial-gradient(900px 520px at 88% -12%, rgba(22,119,255,0.42), transparent 60%), radial-gradient(760px 520px at -8% 112%, rgba(22,119,255,0.16), transparent 55%)",
          color: "#ffffff",
          fontFamily: "PT Sans",
        }}
      >
        {/* Top row: wordmark + free badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: 6,
                background: ACCENT,
                marginRight: 16,
                display: "flex",
              }}
            />
            <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
              tailit
            </span>
          </div>
          <span
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: ACCENT,
              border: `2px solid ${ACCENT}`,
              borderRadius: 999,
              padding: "8px 24px",
              display: "flex",
            }}
          >
            Free
          </span>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "baseline",
              width: 1010,
              fontSize: 70,
              fontWeight: 700,
              lineHeight: 1.1,
              letterSpacing: -1.5,
            }}
          >
            <span style={{ marginRight: 20 }}>Tailor your resume to any job</span>
            <span style={{ color: ACCENT }}>with AI</span>
          </div>
          <span
            style={{
              fontSize: 34,
              color: "#aeb6c8",
              marginTop: 28,
              width: 920,
              lineHeight: 1.3,
            }}
          >
            Paste a job link and your resume is rewritten to match — then export
            a clean PDF.
          </span>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 28,
            color: "#7c869c",
          }}
        >
          <span style={{ color: "#ffffff", fontWeight: 700 }}>{SITE_HOST}</span>
          <span style={{ display: "flex" }}>
            AI builder · 65 templates · no signup
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "PT Sans", data: regular, weight: 400, style: "normal" },
        { name: "PT Sans", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
