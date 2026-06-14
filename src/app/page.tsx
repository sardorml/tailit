"use client";

import Link from "next/link";
import { ArrowRightOutlined, ScissorOutlined } from "@ant-design/icons";
import { Button, Flex, Layout, Typography, theme } from "antd";
import TemplateCarousel from "@/components/landing/TemplateCarousel";

const { Title, Text, Paragraph } = Typography;

export default function Home() {
  const { token } = theme.useToken();
  return (
    // On desktop the whole page fits one viewport (no scroll); on small
    // screens it falls back to natural height and scrolls.
    <Layout className="screen-lg" style={{ minHeight: "100dvh", background: "transparent" }}>
      {/* Nav */}
      <Flex
        align="center"
        justify="space-between"
        style={{
          width: "100%",
          maxWidth: 1152,
          margin: "0 auto",
          padding: "20px 24px",
        }}
      >
        <Flex align="center" gap={8} style={{ fontWeight: 600 }}>
          <ScissorOutlined style={{ fontSize: 20, color: token.colorPrimary }} />
          tailit
        </Flex>
        <Link href="/build">
          <Button>Open the builder</Button>
        </Link>
      </Flex>

      {/* Center column — hero (natural height) above a template showcase that
          fills the remaining space, so the A4 cards size to the viewport and
          the page never scrolls on desktop. */}
      <Flex
        vertical
        gap={20}
        style={{ flex: 1, minHeight: 0 }}
      >
        {/* Hero */}
        <Flex
          vertical
          align="center"
          style={{
            width: "100%",
            maxWidth: 768,
            margin: "0 auto",
            padding: "0 24px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <Title
            level={1}
            // Fluid size: smaller on phones (down to 34px), capped at 62px on desktop.
            style={{
              margin: 0,
              paddingTop: 24,
              fontSize: "clamp(34px, 8vw, 62px)",
              fontWeight: 700,
              lineHeight: 1.03,
            }}
          >
            Tailor your resume to{" "}
            <span style={{ color: token.colorPrimary, whiteSpace: "nowrap" }}>any job</span>{" "}
            in minutes
          </Title>
          <Paragraph
            type="secondary"
            style={{
              maxWidth: 576,
              marginTop: 12,
              marginBottom: 0,
              fontSize: 16,
            }}
          >
            Paste a job link, and AI rewrites your resume to match it —
            surfacing your real experience and the right keywords. An AI
            interview builds your profile; pick a template; download a clean
            PDF.
          </Paragraph>
          <Flex align="center" justify="center" gap={12} style={{ marginTop: 18 }}>
            <Link href="/build">
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                iconPosition="end"
              >
                Get started
              </Button>
            </Link>
          </Flex>
          <Text type="secondary" style={{ marginTop: 8, fontSize: 12 }}>
            No sign-up. No credit card.
          </Text>
        </Flex>

        {/* Template showcase — a seamless infinite-slider marquee of A4
            previews; click a card to start. Its root is the flex-fill child. */}
        <Flex vertical style={{ minHeight: 0, flex: 1 }}>
          <Text
            type="secondary"
            style={{
              marginBottom: 12,
              flexShrink: 0,
              textAlign: "center",
              fontSize: 12,
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            65 ATS-ready templates · click one to start
          </Text>
          <div style={{ flex: 1, minHeight: 0 }}>
            <TemplateCarousel />
          </div>
        </Flex>
      </Flex>

      <Layout.Footer
        style={{
          padding: "16px 0",
          textAlign: "center",
          fontSize: 12,
          background: "transparent",
        }}
      >
        <Text type="secondary" style={{ fontSize: 12 }}>
          Built with open-source models. Your resume never leaves your browser
          except to be rewritten.
        </Text>
      </Layout.Footer>
    </Layout>
  );
}
