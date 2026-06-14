"use client";

import { useState } from "react";
import { AppstoreOutlined, CheckOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Pagination, Typography, theme } from "antd";
import { TEMPLATES, getTemplate, type TemplateId } from "@/lib/templates";
import { useAppStore } from "@/store/useAppStore";

// 15 templates per page. The grid's column count reflows to the modal width
// (auto-fill keeps each card ≥ MIN_CARD_W), so resizing the window never squishes
// the cards — on a full-width modal it lands on 5 columns × 3 rows.
const PER_PAGE = 15;
const MIN_CARD_W = 180; // px — drop a column rather than let cards get narrower

export function TemplatePicker() {
  const templateId = useAppStore((s) => s.templateId);
  const setTemplate = useAppStore((s) => s.setTemplate);
  const current = getTemplate(templateId);

  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);

  function openPicker() {
    // Open on the page that holds the current template.
    const idx = TEMPLATES.findIndex((t) => t.id === templateId);
    setPage(idx >= 0 ? Math.floor(idx / PER_PAGE) + 1 : 1);
    setOpen(true);
  }

  function choose(id: TemplateId) {
    setTemplate(id);
    setOpen(false);
  }

  const pageItems = TEMPLATES.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <>
      <Button icon={<AppstoreOutlined />} onClick={openPicker}>
        <Typography.Text type="secondary">Template:</Typography.Text>
        <span
          style={{
            display: "inline-block",
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: current.accent,
            marginLeft: 4,
            marginRight: 6,
            verticalAlign: "middle",
          }}
        />
        {current.name}
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width="min(1100px, 95vw)"
        title={
          <>
            Choose a template{" "}
            <span style={{ fontWeight: 400 }}>
              ·{" "}
              <a
                href="https://typst.app/universe/search/?category=cv"
                target="_blank"
                rel="noreferrer"
              >
                {TEMPLATES.length} designs from Typst Universe
              </a>
            </span>
          </>
        }
      >
        {/* A responsive grid per page, paged with antd Pagination — the column
            count reflows to the modal width so cards never squish on resize. The
            grid scrolls inside a height-capped area (the title + pagination stay
            put) so the modal always fits the viewport; at full width the 5×3 grid
            fits with no scrollbar at all. */}
        <div
          className="scrollbar-thin"
          style={{
            maxHeight: "calc(100dvh - 280px)",
            overflowY: "auto",
            padding: "8px 2px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(min(100%, ${MIN_CARD_W}px), 1fr))`,
              gap: 16,
            }}
          >
            {pageItems.map((t) => (
              <ThumbCard
                key={t.id}
                id={t.id}
                name={t.name}
                description={t.description}
                accent={t.accent}
                active={t.id === templateId}
                onSelect={() => choose(t.id)}
              />
            ))}
          </div>
        </div>
        <Flex justify="center" style={{ marginTop: 12 }}>
          <Pagination
            current={page}
            pageSize={PER_PAGE}
            total={TEMPLATES.length}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
            showLessItems
          />
        </Flex>
      </Modal>
    </>
  );
}

function ThumbCard({
  id,
  name,
  description,
  accent,
  active,
  onSelect,
}: {
  id: string;
  name: string;
  description: string;
  accent: string;
  active: boolean;
  onSelect: () => void;
}) {
  const { token } = theme.useToken();
  const [failed, setFailed] = useState(false);

  return (
    <button
      onClick={onSelect}
      title={description}
      aria-label={`Select the ${name} template`}
      className="tpl-card"
      style={{
        display: "block",
        width: "100%",
        padding: 0,
        textAlign: "left",
        verticalAlign: "top",
        overflow: "hidden",
        borderRadius: token.borderRadius,
        border: `1px solid ${active ? token.colorPrimary : token.colorBorder}`,
        boxShadow: active ? `0 0 0 2px ${token.colorPrimaryBg}` : undefined,
        background: token.colorBgContainer,
        cursor: "pointer",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 150,
          overflow: "hidden",
          borderBottom: `1px solid ${token.colorBorder}`,
          background: "#fff",
        }}
      >
        {failed ? (
          <Flex
            align="center"
            justify="center"
            style={{ height: "100%" }}
          >
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Preview unavailable
            </Typography.Text>
          </Flex>
        ) : (
          // Pre-generated static thumbnail (scripts/gen-thumbs.mjs) — eager so
          // all cards on a page fetch on open (each ~32KB, then cached), leaving
          // no block to flash in when paging. Container is white, so even an
          // in-flight image shows paper, never a dark placeholder.
          // Decorative — the button's aria-label already names the template.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/thumbs/${id}.webp`}
            alt=""
            loading="eager"
            decoding="async"
            onError={() => setFailed(true)}
            style={{
              pointerEvents: "none",
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
            }}
          />
        )}
        {active && (
          <span
            style={{
              position: "absolute",
              right: 8,
              top: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: token.colorPrimary,
              color: token.colorTextLightSolid,
              boxShadow: token.boxShadowSecondary,
            }}
          >
            <CheckOutlined style={{ fontSize: 14 }} />
          </span>
        )}
      </div>
      <Flex
        align="center"
        justify="center"
        gap={8}
        style={{ padding: "8px 10px" }}
      >
        <span
          style={{
            flexShrink: 0,
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: accent,
          }}
        />
        <Typography.Text
          style={{
            fontSize: 12,
            fontWeight: 500,
            maxWidth: "100%",
          }}
          ellipsis
        >
          {name}
        </Typography.Text>
      </Flex>
    </button>
  );
}
