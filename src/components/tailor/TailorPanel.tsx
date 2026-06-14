"use client";

import { useRef, useState } from "react";
import {
  CheckOutlined,
  HighlightOutlined,
  LinkOutlined,
  SolutionOutlined,
  ThunderboltOutlined,
  UndoOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Flex, Input, Space, Statistic, Tag, Typography, theme } from "antd";
import { useAppStore } from "@/store/useAppStore";
import { postJSON } from "@/lib/api";
import type { JobData } from "@/lib/job/schema";
import type { MatchReport } from "@/lib/tailor/schema";
import type { Resume } from "@/lib/resume/schema";

const { Title, Text, Paragraph } = Typography;

interface JobResponse {
  job: JobData;
}
interface TailorResponse {
  resume: Resume;
  report: MatchReport;
}

export default function TailorPanel() {
  const resume = useAppStore((s) => s.resume);
  const job = useAppStore((s) => s.job);
  const setJob = useAppStore((s) => s.setJob);
  const tailored = useAppStore((s) => s.tailored);
  const setTailored = useAppStore((s) => s.setTailored);
  const setResume = useAppStore((s) => s.setResume);

  const [url, setUrl] = useState(job?.sourceUrl ?? "");
  const [pasteMode, setPasteMode] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const originalRef = useRef<Resume | null>(null);

  const hasResume =
    !!resume.basics.name || resume.work.length > 0 || resume.skills.length > 0;

  async function analyze() {
    setError(null);
    setAnalyzing(true);
    try {
      const payload = pasteMode ? { text: pasteText } : { url };
      const res = await postJSON<JobResponse>("/api/job", payload);
      setJob(res.job);
      setTailored(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAnalyzing(false);
    }
  }

  async function tailor() {
    if (!job) return;
    setError(null);
    setTailoring(true);
    originalRef.current = useAppStore.getState().resume;
    try {
      const res = await postJSON<TailorResponse>("/api/tailor", { resume, job });
      setTailored(res);
      setResume(res.resume); // apply immediately so the preview updates
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setTailoring(false);
    }
  }

  function revert() {
    if (originalRef.current) {
      setResume(originalRef.current);
      setTailored(null);
    }
  }

  return (
    <Flex vertical gap={20}>
      {/* Step 1 — target job */}
      <Card>
        <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
          <SolutionOutlined />
          <Title
            level={5}
            style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Target job
          </Title>
        </Flex>

        {!pasteMode ? (
          <Space.Compact style={{ width: "100%" }}>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && url.trim() && analyze()}
              placeholder="Paste a job posting URL"
              prefix={<LinkOutlined />}
            />
            <Button
              type="primary"
              onClick={analyze}
              loading={analyzing}
              disabled={!url.trim()}
            >
              Analyze
            </Button>
          </Space.Compact>
        ) : (
          <Flex vertical gap={8}>
            <Input.TextArea
              rows={6}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste the full job description here…"
            />
            <Button
              type="primary"
              onClick={analyze}
              loading={analyzing}
              disabled={pasteText.trim().length < 50}
            >
              Analyze
            </Button>
          </Flex>
        )}

        <Button
          type="text"
          size="small"
          style={{ marginTop: 8, paddingInline: 0 }}
          onClick={() => {
            setPasteMode((v) => !v);
            setError(null);
          }}
        >
          {pasteMode ? "← Use a URL instead" : "Site blocked? Paste the description instead →"}
        </Button>

        {error && (
          <Alert type="error" showIcon message={error} style={{ marginTop: 12 }} />
        )}

        {job && <JobSummary job={job} />}
      </Card>

      {/* Step 2 — tailor */}
      {job && (
        <Card>
          <Flex align="center" justify="space-between" gap={12}>
            <div>
              <Title
                level={5}
                style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}
              >
                Tailor your resume
              </Title>
              <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
                Rewrites your summary and bullet points to match this role — truthfully, using only
                your real experience.
              </Paragraph>
            </div>
            <Button
              type="primary"
              onClick={tailor}
              loading={tailoring}
              disabled={!hasResume}
              icon={<HighlightOutlined />}
              style={{ flexShrink: 0 }}
            >
              Tailor
            </Button>
          </Flex>
          {!hasResume && (
            <Paragraph type="secondary" style={{ marginTop: 8, marginBottom: 0, fontSize: 12 }}>
              Add your experience first (AI Assistant or Edit tab) so there is something to tailor.
            </Paragraph>
          )}
        </Card>
      )}

      {/* Step 3 — match report */}
      {tailored && <ReportCard report={tailored.report} onRevert={revert} />}
    </Flex>
  );
}

function JobSummary({ job }: { job: JobData }) {
  return (
    <Card size="small" style={{ marginTop: 16 }}>
      <Text strong>
        {job.title || "Role"}
        {job.company ? <Text type="secondary"> · {job.company}</Text> : null}
      </Text>
      {job.summary && (
        <Paragraph type="secondary" style={{ marginTop: 4, marginBottom: 0 }}>
          {job.summary}
        </Paragraph>
      )}
      {job.keywords.length > 0 && (
        <div style={{ marginTop: 12 }}>
          <Text type="secondary" style={{ display: "block", marginBottom: 6, fontSize: 12 }}>
            Key terms it looks for
          </Text>
          <Flex wrap gap={6}>
            {job.keywords.slice(0, 16).map((k) => (
              <Tag key={k} style={{ margin: 0 }}>
                {k}
              </Tag>
            ))}
          </Flex>
        </div>
      )}
    </Card>
  );
}

function ReportCard({ report, onRevert }: { report: MatchReport; onRevert: () => void }) {
  const { token } = theme.useToken();

  function scoreColor(score: number): string {
    if (score >= 75) return token.colorSuccess;
    if (score >= 50) return token.colorWarning;
    return token.colorError;
  }

  return (
    <Card>
      <Flex align="center" justify="space-between" style={{ marginBottom: 16 }}>
        <Flex align="center" gap={8}>
          <ThunderboltOutlined />
          <Title
            level={5}
            style={{ margin: 0, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            Match report
          </Title>
        </Flex>
        <Button type="text" icon={<UndoOutlined />} onClick={onRevert}>
          Revert
        </Button>
      </Flex>

      <Flex align="center" gap={16}>
        <Statistic
          value={Math.round(report.score)}
          suffix="/100"
          valueStyle={{ color: scoreColor(report.score), fontWeight: 700 }}
        />
        <Paragraph type="secondary" style={{ margin: 0 }}>
          Your resume is now applied to the preview. Review it in the Edit tab — everything stays
          truthful to what you provided.
        </Paragraph>
      </Flex>

      {report.coveredKeywords.length > 0 && (
        <Section title="Now covered">
          <Flex wrap gap={6}>
            {report.coveredKeywords.map((k) => (
              <Tag key={k} color="success" icon={<CheckOutlined />} style={{ margin: 0 }}>
                {k}
              </Tag>
            ))}
          </Flex>
        </Section>
      )}

      {report.missingKeywords.length > 0 && (
        <Section title="Honest gaps (not added to your resume)">
          <Flex wrap gap={6}>
            {report.missingKeywords.map((k) => (
              <Tag key={k} color="error" style={{ margin: 0 }}>
                {k}
              </Tag>
            ))}
          </Flex>
        </Section>
      )}

      {report.changes.length > 0 && (
        <Section title="What changed">
          <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc" }}>
            {report.changes.map((c, i) => (
              <li key={i}>
                <Text type="secondary">{c}</Text>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </Card>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 16 }}>
      <Text type="secondary" style={{ display: "block", marginBottom: 6, fontSize: 12 }}>
        {title}
      </Text>
      {children}
    </div>
  );
}
