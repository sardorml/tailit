// Wraps @preview/golixp-resume-zh-cn. The package is markup-driven: a
// `resume-doc` show rule plus #section-header / #work-item / #education-item /
// #project-item / #skill-category / #award-item calls. We generate that markup
// from the injected JSON (shaped by ./adapter.ts). Section headings are emitted
// in English to neutralize the template's Chinese defaults.
#import "@preview/golixp-resume-zh-cn:0.1.2": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
// Empty string -> none so the package's optional-arg guards (`if x != none`) skip it.
#let opt(s) = if s == "" { none } else { s }

#show: resume-doc.with(
  overrides: (
    // Render English-only; the template otherwise sets lang/region to zh-cn.
  ),
)

// Force Latin language tagging without touching the package's font config.
#set text(lang: "en", region: "us")

// ---- Header: name + contact line ----
#personal-header(
  f(data, "name"),
  rows("contacts").map(c => {
    let item = (icon: c.at("icon", default: "link"), content: c.at("content", default: ""))
    if "link" in c { item.insert("link", c.at("link")) }
    item
  }),
)

#if f(data, "label") != "" [
  #v(0.2em)
  #text(weight: "medium")[#data.label]
]

// ---- Summary ----
#if f(data, "summary") != "" [
  #section-header("Summary", icon-name: "lightbulb")
  #summary-paragraph[#data.summary]
]

// ---- Work Experience ----
#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section-header("Work Experience", icon-name: "work")
  #for w in work-rows [
    #work-item(
      f(w, "period"),
      f(w, "company"),
      position: opt(f(w, "position")),
      location: opt(f(w, "location")),
      responsibilities: w.at("responsibilities", default: ()),
    )
  ]
]

// ---- Education ----
#let education-rows = rows("education")
#if education-rows.len() > 0 [
  #section-header("Education", icon-name: "graduation")
  #for e in education-rows [
    #education-item(
      f(e, "period"),
      f(e, "school"),
      f(e, "degree"),
      f(e, "major"),
      gpa: opt(f(e, "gpa")),
      honors: e.at("honors", default: ()),
    )
  ]
]

// ---- Projects ----
#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section-header("Projects", icon-name: "project")
  #for p in project-rows [
    #project-item(
      f(p, "name"),
      [#f(p, "description")],
      link: opt(f(p, "link")),
      period: opt(f(p, "period")),
      responsibilities: p.at("responsibilities", default: ()),
    )
  ]
]

// ---- Skills ----
#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section-header("Skills", icon-name: "code")
  #for s in skill-rows [
    #skill-category(f(s, "category"), s.at("items", default: ()))
  ]
]

// ---- Certifications ----
#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section-header("Certifications", icon-name: "award")
  #for c in cert-rows [
    #award-item(
      f(c, "name"),
      f(c, "date"),
      issuer: opt(f(c, "issuer")),
    )
  ]
]

// ---- Languages ----
#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section-header("Languages", icon-name: "user")
  #list-view(lang-rows)
]
