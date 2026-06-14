// Wraps @preview/yuan-resume. The package is markup-driven: it exposes
// `section-block`, `edu-heading`, `proj-heading`, `intern-heading`, and `award`
// helpers and expects the document to build its own header. We mirror the
// package's template/main.typ structure, driving every value from the injected
// JSON (shaped by ./adapter.ts).
#import "@preview/yuan-resume:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#set page(margin: (top: 1.2cm, bottom: 1.6cm, left: 1.8cm, right: 2.3cm))
#set text(font: "Sabon LT Std", 10pt)

// --- Header: name (+ suffix) on the left, contact lines on the right ---
#grid(
  columns: (3fr, 1fr),
  align: (left + bottom, right + bottom),
  smallcaps[
    #text(font: "Calluna", size: 30pt)[#f(data, "name")]
    #if f(data, "suffix") != "" [
      #h(1em)
      #text(font: "Calluna", size: 14.5pt)[#f(data, "suffix")]
    ]
  ],
  {
    let lines = data.at("contact", default: ())
    if lines.len() > 0 {
      lines.map(l => [#l]).join([ \ ])
    }
  },
)

#line(length: 100%, stroke: 0.4pt)
#v(8pt)

// --- Summary ---
#if f(data, "summary") != "" [
  #section-block(
    [Summary],
    [
      #set par(justify: true)
      #data.summary
    ],
  )
]

// --- Education ---
#let education = rows("education")
#if education.len() > 0 [
  #section-block(
    [Education],
    {
      for e in education {
        edu-heading(
          department: [#f(e, "department")],
          location: [#f(e, "location")],
          role: [#f(e, "role")],
          time: [#f(e, "time")],
        )
        for h in e.at("highlights", default: ()) [- #h]
        v(8pt)
      }
    },
  )
]

// --- Work Experience ---
#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section-block(
    [Experience],
    {
      for w in work-rows {
        intern-heading(
          company: [#f(w, "company")],
          location: [#f(w, "location")],
          time: [#f(w, "time")],
        )
        for h in w.at("highlights", default: ()) [- #h]
        v(8pt)
      }
    },
  )
]

// --- Projects ---
#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section-block(
    [Projects],
    {
      for p in project-rows {
        proj-heading(
          title: [#f(p, "title")],
          institution: [#f(p, "institution")],
          time: [#f(p, "time")],
        )
        for h in p.at("highlights", default: ()) [- #h]
        v(8pt)
      }
    },
  )
]

// --- Certifications / Awards ---
#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section-block(
    [Certifications],
    {
      set par(spacing: 8pt)
      for c in cert-rows {
        award(title: [#f(c, "title")], time: [#f(c, "time")])
      }
    },
  )
]

// --- Skills ---
#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section-block(
    [Skills],
    {
      set terms(separator: [: ])
      for s in skill-rows {
        terms.item([#f(s, "label")], [#f(s, "items")])
      }
    },
  )
]

// --- Languages ---
#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section-block(
    [Languages],
    [#lang-rows.join(", ")],
  )
]
