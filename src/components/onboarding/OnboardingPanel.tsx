"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRightOutlined,
  SendOutlined,
  ThunderboltOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Alert, Button, Flex, Input, Progress, Spin, Typography, theme } from "antd";
import { useAppStore } from "@/store/useAppStore";
import { postForm, postJSON } from "@/lib/api";
import { completeness, type ResumePatch } from "@/lib/resume/schema";

interface InterviewResponse {
  reply: string;
  patch: ResumePatch;
  done: boolean;
}
interface ParseResponse {
  resume: ResumePatch;
  text: string;
  chars: number;
}

const GREETING =
  "Hi! I'll help you build a resume we can tailor to any job. You can upload an existing resume (PDF, DOCX, or TXT) to import it instantly — or just tell me about yourself. Let's start: what's your name and the role you're targeting?";

export default function OnboardingPanel({
  onNavigate,
}: {
  onNavigate?: (tab: "tailor") => void;
}) {
  const messages = useAppStore((s) => s.messages);
  const addMessage = useAppStore((s) => s.addMessage);
  const resume = useAppStore((s) => s.resume);
  const patchResume = useAppStore((s) => s.patchResume);

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const { token } = theme.useToken();
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Seed a deterministic greeting once (no API call needed).
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (useAppStore.getState().messages.length === 0) {
      addMessage({ role: "assistant", content: GREETING });
    }
  }, [addMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function runInterview() {
    setBusy(true);
    setError(null);
    try {
      const { messages: msgs, resume: r } = useAppStore.getState();
      const res = await postJSON<InterviewResponse>("/api/interview", { messages: msgs, resume: r });
      if (res.patch && Object.keys(res.patch).length) patchResume(res.patch);
      addMessage({ role: "assistant", content: res.reply });
      if (res.done) setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    addMessage({ role: "user", content: text });
    await runInterview();
  }

  async function handleFile(file: File) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await postForm<ParseResponse>("/api/parse", form);
      const imported = res.resume && Object.keys(res.resume).length > 0;
      if (imported) {
        patchResume(res.resume);
        addMessage({ role: "user", content: `📄 Uploaded my resume (${file.name}).` });
        await runInterview();
      } else {
        addMessage({
          role: "assistant",
          content:
            "I couldn't pull structured details from that file — it may be a scanned image. No worries, let's fill it in together. What's your name and target role?",
        });
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  const pct = completeness(resume);

  return (
    <Flex
      vertical
      style={{
        height: "100%",
        overflow: "hidden",
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorder}`,
        background: token.colorBgContainer,
        boxShadow: token.boxShadowTertiary,
      }}
    >
      {/* Header */}
      <Flex
        align="center"
        justify="space-between"
        gap={12}
        style={{
          padding: "12px 16px",
          borderBottom: `1px solid ${token.colorBorder}`,
        }}
      >
        <Flex align="center" gap={8} style={{ fontSize: 14, fontWeight: 500 }}>
          <ThunderboltOutlined style={{ color: token.colorPrimary }} /> AI onboarding
        </Flex>
        <Flex align="center" gap={8}>
          <Progress percent={Math.round(pct * 100)} size="small" showInfo={false} style={{ width: 96 }} />
          <Typography.Text type="secondary" style={{ fontSize: 12, fontVariantNumeric: "tabular-nums" }}>
            {Math.round(pct * 100)}%
          </Typography.Text>
        </Flex>
      </Flex>

      {/* Transcript */}
      <div
        ref={scrollRef}
        className="scrollbar-thin"
        style={{ flex: 1, overflowY: "auto", padding: "16px" }}
      >
        <Flex vertical gap={12}>
          {messages.map((m, i) => (
            <Flex key={i} justify={m.role === "user" ? "flex-end" : "flex-start"}>
              <div
                style={{
                  maxWidth: "85%",
                  padding: "8px 14px",
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                  borderRadius: 16,
                  ...(m.role === "user"
                    ? {
                        borderBottomRightRadius: 4,
                        background: token.colorPrimary,
                        color: token.colorWhite,
                      }
                    : {
                        borderBottomLeftRadius: 4,
                        border: `1px solid ${token.colorBorder}`,
                        background: token.colorBgLayout,
                        color: token.colorText,
                      }),
                }}
              >
                {m.content}
              </div>
            </Flex>
          ))}
          {busy && (
            <Flex justify="flex-start">
              <Flex
                align="center"
                gap={8}
                style={{
                  padding: "10px 14px",
                  fontSize: 14,
                  borderRadius: 16,
                  borderBottomLeftRadius: 4,
                  border: `1px solid ${token.colorBorder}`,
                  background: token.colorBgLayout,
                  color: token.colorTextSecondary,
                }}
              >
                <Spin size="small" /> thinking…
              </Flex>
            </Flex>
          )}
          {done && (
            <Flex justify="center" style={{ paddingTop: 8 }}>
              <Button size="small" type="primary" onClick={() => onNavigate?.("tailor")}>
                Tailor to a job <ArrowRightOutlined />
              </Button>
            </Flex>
          )}
        </Flex>
      </div>

      {/* Error */}
      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ margin: "0 16px 8px" }}
          action={
            <Button size="small" onClick={() => runInterview()}>
              Retry
            </Button>
          }
          closable
          onClose={() => setError(null)}
        />
      )}

      {/* Composer */}
      <div style={{ borderTop: `1px solid ${token.colorBorder}`, padding: 12 }}>
        <Flex align="flex-end" gap={8}>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,text/plain"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleFile(f);
            }}
          />
          <Button
            icon={<UploadOutlined />}
            loading={uploading}
            onClick={() => fileRef.current?.click()}
            title="Upload an existing resume"
            style={{ flexShrink: 0 }}
          >
            Upload
          </Button>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            autoSize={{ minRows: 1, maxRows: 5 }}
            placeholder="Type your answer…"
            style={{ flex: 1 }}
          />
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => void send()}
            disabled={!input.trim() || busy}
            style={{ flexShrink: 0 }}
          />
        </Flex>
        <Typography.Text type="secondary" style={{ display: "block", marginTop: 6, padding: "0 4px", fontSize: 11 }}>
          AI can make mistakes — review imported details in the Edit tab.
        </Typography.Text>
      </div>
    </Flex>
  );
}
