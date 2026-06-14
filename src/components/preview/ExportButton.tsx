"use client";

import { useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { App, Button } from "antd";
import type { Resume } from "@/lib/resume/schema";
import type { TemplateId } from "@/lib/templates";

export default function ExportButton({
  resume,
  templateId,
}: {
  resume: Resume;
  templateId: TemplateId;
}) {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume, templateId }),
      });
      if (!res.ok) {
        const msg = await res.json().catch(() => null);
        throw new Error(msg?.error || `Export failed (${res.status}).`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${(resume.basics.name || "resume").trim().replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Export failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="primary"
      icon={<DownloadOutlined />}
      loading={loading}
      onClick={handleExport}
    >
      Download PDF
    </Button>
  );
}
