// Wraps @preview/linked-cv. Markup-driven: a `linked-cv.with` show rule plus
// `components.section` headers, `components.employer-info` + `frame.connected-frames`
// timelines, and a `components.qualification` table. We generate that markup
// from the injected JSON (shaped by ./adapter.ts).
#import "@preview/linked-cv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let socials = data.at("socials", default: (:))
#let clean-socials = (
  email: if f(socials, "email") != "" { socials.email } else { none },
  mobile: if f(socials, "mobile") != "" { socials.mobile } else { none },
  github: if f(socials, "github") != "" { socials.github } else { none },
  linkedin: if f(socials, "linkedin") != "" { socials.linkedin } else { none },
)

#show: linked-cv.with(
  firstname: f(data, "firstname"),
  lastname: f(data, "lastname"),
  socials: clean-socials,
  accent-colour: rgb("#6694A5"),
  // The package sets `fallback: false`, so unavailable fonts render NOTHING.
  // "PT Sans" is bundled with the project and is sans-serif like the LinkedIn
  // aesthetic this template emulates.
  fonts: (
    headings: "PT Sans",
    body: "PT Sans",
  ),
)

#set text(size: 8.5pt, hyphenate: false)
#set par(justify: true, leading: 0.52em)

#if f(data, "summary") != "" [
  #typography.summary(data.summary)
  #v(0.5em)
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #components.section("Experience")
  #for w in work-rows [
    #components.employer-info(
      none,
      name: f(w, "company"),
      duration: w.at("duration", default: ("01-2020", "current")),
    )
    #frame.connected-frames(
      "job-" + f(w, "company"),
      (
        title: f(w, "title"),
        duration: w.at("duration", default: ("01-2020", "current")),
        body: [
          #for h in w.at("highlights", default: ()) [- #h]
        ],
      ),
    )
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #components.section("Projects")
  #for p in project-rows [
    #grid(
      columns: (1fr, auto),
      align: (left, right + horizon),
      typography.project(f(p, "name")),
      if f(p, "url") != "" { typography.date(p.url) },
    )
    #for h in p.at("highlights", default: ()) [- #h]
    #v(0.5em)
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #components.section("Skills")
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
  #v(0.5em)
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  #components.section("Education")
  #table(
    columns: (40%, 12%, 18%, 30%),
    align: (left, left, left, right),
    stroke: none,
    ..(("Qualification", "Grade", "Date", "Institution").map(typography.table-header)),
    table.hline(stroke: 0.5pt + colours.gray.lighten(60%)),
    ..(for e in edu-rows {
      components.qualification(f(e, "degree"), f(e, "grade"), f(e, "date"), f(e, "institution"))
    })
  )
  #v(0.5em)
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #components.section("Certifications")
  #for c in cert-rows [
    - *#f(c, "name")*#if f(c, "issuer") != "" [ — #c.issuer]#if f(c, "date") != "" [ (#c.date)]
  ]
  #v(0.5em)
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #components.section("Languages")
  #for l in lang-rows [- #l]
]
