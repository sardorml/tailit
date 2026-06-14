"use client";

import { useId } from "react";
import { DeleteOutlined, DownOutlined, PlusOutlined, UpOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Input, Row, Space, Typography, theme } from "antd";
import { useAppStore } from "@/store/useAppStore";
import type { Education, Project, Skill, Work } from "@/lib/resume/schema";

/* ------------------------------- small helpers ------------------------------ */

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <Flex vertical gap={4}>
      <label htmlFor={id}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {label}
        </Typography.Text>
      </label>
      <Input
        id={id}
        type={type}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Flex>
  );
}

function SectionCard({
  title,
  onAdd,
  children,
}: {
  title: string;
  onAdd?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card
      size="small"
      title={title}
      extra={
        onAdd && (
          <Button size="small" icon={<PlusOutlined />} onClick={onAdd}>
            Add
          </Button>
        )
      }
    >
      {children}
    </Card>
  );
}

function ItemControls({
  onRemove,
  onUp,
  onDown,
  canUp,
  canDown,
}: {
  onRemove: () => void;
  onUp: () => void;
  onDown: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <Space size={4}>
      <Button
        type="text"
        size="small"
        icon={<UpOutlined />}
        onClick={onUp}
        disabled={!canUp}
        title="Move up"
      />
      <Button
        type="text"
        size="small"
        icon={<DownOutlined />}
        onClick={onDown}
        disabled={!canDown}
        title="Move down"
      />
      <Button
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={onRemove}
        title="Remove"
      />
    </Space>
  );
}

function lines(arr: string[] | undefined): string {
  return (arr ?? []).join("\n");
}
function toLines(text: string): string[] {
  return text.split("\n");
}

/* --------------------------------- editor ---------------------------------- */

export default function ResumeEditor() {
  const resume = useAppStore((s) => s.resume);
  const setResume = useAppStore((s) => s.setResume);

  const setBasics = (patch: Partial<typeof resume.basics>) =>
    setResume({ ...resume, basics: { ...resume.basics, ...patch } });
  const setLocation = (patch: Partial<NonNullable<typeof resume.basics.location>>) =>
    setResume({
      ...resume,
      basics: { ...resume.basics, location: { ...resume.basics.location, ...patch } },
    });

  // Generic array section helpers.
  function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
    const j = i + dir;
    if (j < 0 || j >= arr.length) return arr;
    const next = [...arr];
    [next[i], next[j]] = [next[j], next[i]];
    return next;
  }

  const setWork = (work: Work[]) => setResume({ ...resume, work });
  const setEducation = (education: Education[]) => setResume({ ...resume, education });
  const setSkills = (skills: Skill[]) => setResume({ ...resume, skills });
  const setProjects = (projects: Project[]) => setResume({ ...resume, projects });

  return (
    <Space orientation="vertical" size={20} style={{ width: "100%" }}>
      {/* Basics */}
      <SectionCard title="Basics">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12}>
            <Field label="Full name" value={resume.basics.name} onChange={(v) => setBasics({ name: v })} placeholder="Ada Lovelace" />
          </Col>
          <Col xs={24} sm={12}>
            <Field label="Target role / headline" value={resume.basics.label} onChange={(v) => setBasics({ label: v })} placeholder="Senior Frontend Engineer" />
          </Col>
          <Col xs={24} sm={12}>
            <Field label="Email" value={resume.basics.email} onChange={(v) => setBasics({ email: v })} placeholder="ada@example.com" />
          </Col>
          <Col xs={24} sm={12}>
            <Field label="Phone" value={resume.basics.phone} onChange={(v) => setBasics({ phone: v })} placeholder="+1 555 123 4567" />
          </Col>
          <Col xs={24} sm={12}>
            <Field label="Website / LinkedIn" value={resume.basics.url} onChange={(v) => setBasics({ url: v })} placeholder="linkedin.com/in/ada" />
          </Col>
          <Col xs={24} sm={12}>
            <Row gutter={[12, 12]}>
              <Col span={12}>
                <Field label="City" value={resume.basics.location?.city} onChange={(v) => setLocation({ city: v })} placeholder="London" />
              </Col>
              <Col span={12}>
                <Field label="Region" value={resume.basics.location?.region} onChange={(v) => setLocation({ region: v })} placeholder="UK" />
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex vertical gap={4} style={{ marginTop: 12 }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Professional summary
          </Typography.Text>
          <Input.TextArea
            autoSize={{ minRows: 3, maxRows: 3 }}
            value={resume.basics.summary ?? ""}
            onChange={(e) => setBasics({ summary: e.target.value })}
            placeholder="2–3 sentences summarizing your experience and strengths."
          />
        </Flex>
      </SectionCard>

      {/* Experience */}
      <SectionCard title="Experience" onAdd={() => setWork([...resume.work, {}])}>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {resume.work.length === 0 && <Empty>No experience yet. Click “Add”.</Empty>}
          {resume.work.map((w, i) => {
            const upd = (patch: Partial<Work>) =>
              setWork(resume.work.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
            return (
              <ItemBox key={i}>
                <Flex align="flex-start" justify="space-between" style={{ marginBottom: 8 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                    Position {i + 1}
                  </Typography.Text>
                  <ItemControls
                    canUp={i > 0}
                    canDown={i < resume.work.length - 1}
                    onUp={() => setWork(move(resume.work, i, -1))}
                    onDown={() => setWork(move(resume.work, i, 1))}
                    onRemove={() => setWork(resume.work.filter((_, idx) => idx !== i))}
                  />
                </Flex>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <Field label="Title" value={w.position} onChange={(v) => upd({ position: v })} placeholder="Software Engineer" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Company" value={w.name} onChange={(v) => upd({ name: v })} placeholder="Acme Inc." />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Start (YYYY-MM)" value={w.startDate} onChange={(v) => upd({ startDate: v })} placeholder="2021-03" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="End (YYYY-MM or blank)" value={w.endDate} onChange={(v) => upd({ endDate: v })} placeholder="Present" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Location" value={w.location} onChange={(v) => upd({ location: v })} placeholder="Remote" />
                  </Col>
                </Row>
                <Flex vertical gap={4} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Highlights (one bullet per line)
                  </Typography.Text>
                  <Input.TextArea
                    autoSize={{ minRows: 4, maxRows: 4 }}
                    value={lines(w.highlights)}
                    onChange={(e) => upd({ highlights: toLines(e.target.value) })}
                    placeholder={"Led migration to X, cutting build times 40%\nMentored 3 engineers"}
                  />
                </Flex>
              </ItemBox>
            );
          })}
        </Space>
      </SectionCard>

      {/* Projects */}
      <SectionCard title="Projects" onAdd={() => setProjects([...resume.projects, {}])}>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {resume.projects.length === 0 && <Empty>Optional. Add side projects or notable work.</Empty>}
          {resume.projects.map((p, i) => {
            const upd = (patch: Partial<Project>) =>
              setProjects(resume.projects.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
            return (
              <ItemBox key={i}>
                <Flex align="flex-start" justify="space-between" style={{ marginBottom: 8 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                    Project {i + 1}
                  </Typography.Text>
                  <ItemControls
                    canUp={i > 0}
                    canDown={i < resume.projects.length - 1}
                    onUp={() => setProjects(move(resume.projects, i, -1))}
                    onDown={() => setProjects(move(resume.projects, i, 1))}
                    onRemove={() => setProjects(resume.projects.filter((_, idx) => idx !== i))}
                  />
                </Flex>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <Field label="Name" value={p.name} onChange={(v) => upd({ name: v })} placeholder="Open-source CLI" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Link" value={p.url} onChange={(v) => upd({ url: v })} placeholder="github.com/…" />
                  </Col>
                </Row>
                <Flex vertical gap={4} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Description
                  </Typography.Text>
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 2 }}
                    value={p.description ?? ""}
                    onChange={(e) => upd({ description: e.target.value })}
                  />
                </Flex>
                <Flex vertical gap={4} style={{ marginTop: 12 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    Highlights (one per line)
                  </Typography.Text>
                  <Input.TextArea
                    autoSize={{ minRows: 2, maxRows: 2 }}
                    value={lines(p.highlights)}
                    onChange={(e) => upd({ highlights: toLines(e.target.value) })}
                  />
                </Flex>
              </ItemBox>
            );
          })}
        </Space>
      </SectionCard>

      {/* Skills */}
      <SectionCard title="Skills" onAdd={() => setSkills([...resume.skills, {}])}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          {resume.skills.length === 0 && <Empty>Add skill groups, e.g. “Languages: TS, Go”.</Empty>}
          {resume.skills.map((s, i) => {
            const upd = (patch: Partial<Skill>) =>
              setSkills(resume.skills.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
            return (
              <Flex key={i} align="flex-end" gap={8}>
                <div style={{ width: 160, flexShrink: 0 }}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Group
                    </Typography.Text>
                    <Input value={s.name ?? ""} onChange={(e) => upd({ name: e.target.value })} placeholder="Languages" />
                  </Flex>
                </div>
                <div style={{ flex: 1 }}>
                  <Flex vertical gap={4}>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      Skills (comma separated)
                    </Typography.Text>
                    <Input
                      value={(s.keywords ?? []).join(", ")}
                      onChange={(e) =>
                        upd({ keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) })
                      }
                      placeholder="TypeScript, Go, Python"
                    />
                  </Flex>
                </div>
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => setSkills(resume.skills.filter((_, idx) => idx !== i))}
                  title="Remove"
                />
              </Flex>
            );
          })}
        </Space>
      </SectionCard>

      {/* Education */}
      <SectionCard title="Education" onAdd={() => setEducation([...resume.education, {}])}>
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {resume.education.length === 0 && <Empty>Add your education history.</Empty>}
          {resume.education.map((e, i) => {
            const upd = (patch: Partial<Education>) =>
              setEducation(resume.education.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
            return (
              <ItemBox key={i}>
                <Flex align="flex-start" justify="space-between" style={{ marginBottom: 8 }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 500 }}>
                    School {i + 1}
                  </Typography.Text>
                  <ItemControls
                    canUp={i > 0}
                    canDown={i < resume.education.length - 1}
                    onUp={() => setEducation(move(resume.education, i, -1))}
                    onDown={() => setEducation(move(resume.education, i, 1))}
                    onRemove={() => setEducation(resume.education.filter((_, idx) => idx !== i))}
                  />
                </Flex>
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12}>
                    <Field label="Institution" value={e.institution} onChange={(v) => upd({ institution: v })} placeholder="MIT" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Area" value={e.area} onChange={(v) => upd({ area: v })} placeholder="Computer Science" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Degree" value={e.studyType} onChange={(v) => upd({ studyType: v })} placeholder="B.Sc." />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Score / GPA" value={e.score} onChange={(v) => upd({ score: v })} placeholder="3.9" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="Start (YYYY)" value={e.startDate} onChange={(v) => upd({ startDate: v })} placeholder="2016" />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Field label="End (YYYY)" value={e.endDate} onChange={(v) => upd({ endDate: v })} placeholder="2020" />
                  </Col>
                </Row>
              </ItemBox>
            );
          })}
        </Space>
      </SectionCard>
    </Space>
  );
}

function ItemBox({ children }: { children: React.ReactNode }) {
  const { token } = theme.useToken();
  return (
    <div
      style={{
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        background: token.colorFillQuaternary,
        padding: 16,
      }}
    >
      {children}
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <Typography.Text type="secondary">{children}</Typography.Text>;
}
