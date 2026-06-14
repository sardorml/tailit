"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import {
  FileTextOutlined,
  HighlightOutlined,
  MessageOutlined,
  ReloadOutlined,
  ScissorOutlined,
} from "@ant-design/icons";
import {
  App,
  Button,
  Flex,
  Progress,
  Skeleton,
  Spin,
  Tabs,
  Typography,
  theme,
} from "antd";
import { useAppStore } from "@/store/useAppStore";
import { useHydration, useMediaQuery } from "@/lib/hooks";
import { completeness } from "@/lib/resume/schema";
import ResumeEditor from "@/components/editor/ResumeEditor";
import OnboardingPanel from "@/components/onboarding/OnboardingPanel";
import TailorPanel from "@/components/tailor/TailorPanel";
import ExportButton from "@/components/preview/ExportButton";
import { TemplatePicker } from "@/components/preview/TemplatePicker";

const ResumePreview = dynamic(() => import("@/components/preview/ResumePreview"), {
  ssr: false,
  loading: () => <PreviewSkeleton />,
});

type Tab = "assistant" | "edit" | "tailor";

const TAB_ITEMS = [
  { key: "assistant", label: <span><MessageOutlined /> AI Assistant</span> },
  { key: "edit", label: <span><FileTextOutlined /> Edit</span> },
  { key: "tailor", label: <span><HighlightOutlined /> Tailor</span> },
];

export default function BuildPage() {
  const { token } = theme.useToken();
  const { modal } = App.useApp();
  const hydrated = useHydration();
  // Two-column on desktop, stacked single column below the 1024px one-viewport
  // breakpoint (matches the `.screen-lg` CSS rule).
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [tab, setTab] = useState<Tab>("assistant");

  const resume = useAppStore((s) => s.resume);
  const templateId = useAppStore((s) => s.templateId);
  const resetAll = useAppStore((s) => s.resetAll);

  if (!hydrated) {
    return (
      <Flex align="center" justify="center" style={{ height: "60vh" }}>
        <Spin />
      </Flex>
    );
  }

  const pct = completeness(resume);

  return (
    <Flex
      vertical
      className="screen-lg"
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        padding: "0 16px",
        minHeight: "100dvh",
        boxSizing: "border-box",
      }}
    >
      {/* Top bar */}
      <Flex
        align="center"
        justify="space-between"
        style={{ flexShrink: 0, padding: "12px 0" }}
      >
        <Link href="/">
          <Flex align="center" gap={8} style={{ fontWeight: 600 }}>
            <ScissorOutlined style={{ color: token.colorPrimary }} />
            tailit
          </Flex>
        </Link>
        <Flex align="center" gap={12}>
          {isDesktop ? (
            <Flex align="center" gap={8}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Resume {Math.round(pct * 100)}% ready
              </Typography.Text>
              <Progress percent={Math.round(pct * 100)} size="small" style={{ width: 120 }} />
            </Flex>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {Math.round(pct * 100)}% ready
            </Typography.Text>
          )}
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => {
              modal.confirm({
                title: "Start over?",
                content: "This clears your resume and answers from this browser.",
                okText: "Start over",
                cancelText: "Cancel",
                onOk: () => {
                  resetAll();
                },
              });
            }}
          >
            Start over
          </Button>
        </Flex>
      </Flex>

      <Flex
        vertical={!isDesktop}
        gap={isDesktop ? 20 : 16}
        style={{ flex: 1, minHeight: 0, paddingBottom: 16 }}
      >
        {/* Left: preview. On desktop it flex-fills beside the work area; stacked
            on top (order 1) with a capped height on narrow screens. */}
        <Flex
          style={
            isDesktop
              ? { flex: "1 1 0", minWidth: 0, minHeight: 0 }
              : { order: 1, width: "100%", height: "70vh", minHeight: 0 }
          }
        >
          <Flex
            vertical
            style={{
              flex: 1,
              minHeight: 0,
              borderRadius: token.borderRadiusLG,
              border: `1px solid ${token.colorBorder}`,
              background: token.colorBgContainer,
              padding: 12,
              boxShadow: token.boxShadowTertiary,
            }}
          >
            <Flex
              align="center"
              justify="space-between"
              wrap
              gap={8}
              style={{ marginBottom: 12 }}
            >
              <TemplatePicker />
              <ExportButton resume={resume} templateId={templateId} />
            </Flex>
            <div
              className="pdf-canvas"
              style={{ flex: 1, minHeight: 0, overflow: "hidden", borderRadius: 4 }}
            >
              <ResumePreview resume={resume} templateId={templateId} />
            </div>
          </Flex>
        </Flex>

        {/* Right: work area (tabs + panels). Fixed 440px column on desktop;
            full-width and below the preview (order 2) when stacked. */}
        <Flex
          vertical
          style={
            isDesktop
              ? { flex: "0 0 440px", width: 440, maxWidth: "100%", minHeight: 0 }
              : { order: 2, width: "100%", height: "78vh", minHeight: 0 }
          }
        >
          <div style={{ flexShrink: 0 }}>
            <Tabs
              items={TAB_ITEMS}
              activeKey={tab}
              onChange={(k) => setTab(k as Tab)}
            />
          </div>

          {/* All three panels stay mounted; we toggle visibility so switching
              tabs doesn't unmount/remount (which flickered and re-seeded chat). */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <div style={{ height: "100%", display: tab === "assistant" ? "block" : "none" }}>
              <OnboardingPanel onNavigate={setTab} />
            </div>
            <div
              className="scrollbar-thin"
              style={{
                height: "100%",
                overflowY: "auto",
                paddingRight: 4,
                display: tab === "edit" ? "block" : "none",
              }}
            >
              <ResumeEditor />
            </div>
            <div
              className="scrollbar-thin"
              style={{
                height: "100%",
                overflowY: "auto",
                paddingRight: 4,
                display: tab === "tailor" ? "block" : "none",
              }}
            >
              <TailorPanel />
            </div>
          </div>
        </Flex>
      </Flex>
    </Flex>
  );
}

function PreviewSkeleton() {
  // A4-shaped placeholder on the dark canvas while the preview chunk loads.
  return (
    <Flex align="center" justify="center" style={{ height: "100%", padding: 16 }}>
      <Skeleton.Node active style={{ width: "100%", height: "100%" }} />
    </Flex>
  );
}
