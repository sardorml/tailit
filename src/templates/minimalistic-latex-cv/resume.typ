// Wraps @preview/minimalistic-latex-cv. Markup-driven: a `cv.with` show rule
// (header from `name` + a `metadata` dict) plus `= Section` headings and
// `#entry(...)` item calls. We generate that markup from the injected JSON
// (shaped by ./adapter.ts). No photo is passed, so it renders a centered
// header with the metadata joined as "value | value".
#import "@preview/minimalistic-latex-cv:0.1.1": cv, entry

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the header metadata dict. The package renders it (no photo) as
// `metadata.values().join(" | ")`, so we pre-format each value as
// "Label: value" and key by index to keep entries unique and ordered.
#let meta-rows = rows("metadata")
#let metadata = (:)
#for (i, m) in meta-rows.enumerate() {
  let label = upper(f(m, "label").slice(0, 1)) + f(m, "label").slice(1)
  metadata.insert(str(i), label + ": " + f(m, "value"))
}

#show: cv.with(
  name: f(data, "name"),
  metadata: metadata,
  lang: "en",
)

#if f(data, "headline") != "" [
  #align(center, text(1.1em, style: "italic", data.headline))
  #v(4pt)
]

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Professional Experience
  #for w in work-rows [
    #entry(
      title: f(w, "title"),
      name: f(w, "name"),
      date: f(w, "date"),
      location: f(w, "location"),
    )
    #for h in w.at("highlights", default: ()) [- #h]
  ]
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education
  #for e in edu-rows [
    #entry(
      title: f(e, "title"),
      name: f(e, "name"),
      date: f(e, "date"),
      location: f(e, "location"),
    )
    #for h in e.at("highlights", default: ()) [- #h]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #entry(
      title: f(p, "title"),
      name: f(p, "name"),
      date: f(p, "date"),
      location: f(p, "location"),
    )
    #for h in p.at("highlights", default: ()) [- #h]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows [
    #if f(s, "label") != "" [*#s.label:* #s.at("items", default: "")] else [#s.at("items", default: "")]
    #parbreak()
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    #if f(c, "meta") != "" [*#c.name* #h(1fr) #c.meta] else [*#c.name*]
    #parbreak()
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #lang-rows.join(" | ")
]
