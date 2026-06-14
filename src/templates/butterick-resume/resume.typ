// Wraps @preview/butterick-resume. Markup-driven: a `template` show rule, an
// `introduction(name:, details:)` header, `= Section` headings and
// `two-grid(left:, right:)` entry rows. We generate that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/butterick-resume:0.1.1": template, introduction, two-grid

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: template

// Header: name + label + detail lines.
#let header-name = if f(data, "label") != "" [
  #f(data, "name") \
  #f(data, "label")
] else [#f(data, "name")]

#let detail-lines = data.at("details", default: ())
#introduction(
  name: header-name,
  details: detail-lines.map(d => [#d]).join([ \ ]),
)

// One entry: a two-grid header, optional subtitle line, then bullet highlights.
#let entry(item) = {
  two-grid(left: [#f(item, "left")], right: [#f(item, "right")])
  if f(item, "subtitle") != "" [_#f(item, "subtitle")_]
  for h in item.at("highlights", default: ()) [- #h]
}

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows { entry(w) }
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education { entry(e) }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows { entry(p) }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows { entry(c) }
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [- #l]
]
