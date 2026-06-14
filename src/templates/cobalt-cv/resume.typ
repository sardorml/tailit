// Wraps @preview/cobalt-cv. That package's entrypoint is a full example
// document (no reusable lib module), so we reproduce its structure here:
// a centered name + Font Awesome contact icons, an optional summary between
// accent rules, and a two-column grid — a shaded sidebar (education + skills)
// beside a main column (work experience). Every value is driven by `data`,
// shaped by ./adapter.ts.
#import "@preview/fontawesome:0.6.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// ─── Configuration (mirrors the package's config block) ─────────────────────
#let name         = f(data, "name")
#let accent       = rgb("#002366")
#let sidebar-fill = rgb("#eef0f5")
#let sans-font    = "Noto Sans"
#let serif-font   = "Noto Serif"
#let col-ratio    = (3fr, 7fr)

#set document(title: upper(name))
#set text(size: 10pt)
#show heading.where(level: 1): set text(font: sans-font, tracking: 0.1em, weight: 500, fill: accent)
#show heading.where(level: 2): set text(size: 12pt)
#set page(margin: (top: 1cm, left: 1cm, right: 1cm, bottom: 1cm))

// ─── Helper functions (copied from the package) ─────────────────────────────
#let resume-title() = text(
  font: serif-font,
  tracking: 0.1em,
  weight: 500,
  size: 28pt,
  fill: accent,
)[#upper(name)]

#let experience(company, role, location, dates, bullets) = [
  == #text(fill: accent)[#company]

  #grid(
    columns: (1fr, 1fr),
    align: (left, right),
    [ #emph[#role] ], [ #emph[#{ if location != "" and dates != "" [#location | #dates] else [#location#dates] }] ],
  )

  #for bullet in bullets {
    [- #bullet]
  }
]

#let education-entry(institution, location, dates, degrees) = [
  == #institution

  #{
    if location != "" and dates != "" [#location | #dates \ ]
    else if location != "" [#location \ ]
    else if dates != "" [#dates \ ]
  }
  #for degree in degrees {
    [ #text(weight: "bold")[#degree] \ ]
  }
]

#let skill-category(category, items) = [
  == #category

  #items.join(" | ")
]

// ─── Header ─────────────────────────────────────────────────────────────────
#let contact-cells = ()
#if f(data, "site") != "" {
  contact-cells.push([ #text(fill: accent)[#fa-icon("globe", font: "Font Awesome 7 Free Solid")] #link(f(data, "siteUrl"))[#f(data, "site")] ])
}
#if f(data, "email") != "" {
  contact-cells.push([ #text(fill: accent)[#fa-icon("envelope", font: "Font Awesome 7 Free Solid")] #link("mailto:" + f(data, "email"))[#f(data, "email")] ])
}
#if f(data, "github") != "" {
  contact-cells.push([ #text(fill: accent)[#fa-icon("github", font: "Font Awesome 7 Brands")] #link(f(data, "githubUrl"))[#f(data, "github")] ])
}
#if f(data, "linkedin") != "" {
  contact-cells.push([ #text(fill: accent)[#fa-icon("linkedin", font: "Font Awesome 7 Brands")] #link(f(data, "linkedinUrl"))[#f(data, "linkedin")] ])
}

#align(center)[
  #resume-title()
  #set text(size: 10pt)
  #if contact-cells.len() > 0 {
    grid(
      columns: (1fr,) * contact-cells.len(),
      align: center,
      ..contact-cells,
    )
  }
]

#line(length: 100%, stroke: accent)

#if f(data, "summary") != "" [
  #f(data, "summary")

  #line(length: 100%, stroke: accent)
]

// ─── Body ─────────────────────────────────────────────────────────────────
#let education-rows = rows("education")
#let skill-rows = rows("skills")
#let work-rows = rows("work")

#grid(
  columns: col-ratio,
  rows: auto,
  fill: (sidebar-fill, none),
  inset: 5pt,
  column-gutter: 0.5cm,
  [
    // ── Sidebar ──
    #if education-rows.len() > 0 [
      = #upper("Education")

      #for e in education-rows {
        education-entry(
          f(e, "institution"),
          f(e, "location"),
          f(e, "dates"),
          e.at("degrees", default: ()),
        )
      }
    ]

    #if education-rows.len() > 0 and skill-rows.len() > 0 [
      #line(stroke: (dash: "dashed", paint: accent), length: 90%)
    ]

    #if skill-rows.len() > 0 [
      = #upper("Skills")

      #for s in skill-rows {
        skill-category(f(s, "category"), s.at("items", default: ()))
      }
    ]
  ],
  [
    // ── Main content ──
    #if work-rows.len() > 0 [
      = #upper("Work Experience")

      #for w in work-rows {
        experience(
          f(w, "company"),
          f(w, "role"),
          f(w, "location"),
          f(w, "dates"),
          w.at("bullets", default: ()),
        )
      }
    ]
  ],
)

#line(length: 100%, stroke: accent)
