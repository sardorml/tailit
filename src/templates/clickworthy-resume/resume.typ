// Wraps @preview/clickworthy-resume. The package is markup-driven: a
// `resume.with` show rule plus `= Section` headings and #edu/#exp/#skills
// calls. We generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/clickworthy-resume:1.0.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the centered contacts row: each entry is a link when it has an href.
#let contact-list = rows("contacts").map(c => {
  let href = c.at("href", default: "")
  let txt = c.at("text", default: "")
  if href != "" [#link(href)[#txt]] else [#txt]
})

#show: resume.with(
  author: f(data, "name"),
  location: f(data, "location"),
  contacts: contact-list,
  summary: f(data, "summary"),
  theme-color: rgb("#26428b"),
  font: "New Computer Modern",
  font-size: 11pt,
  lang: "en",
  margin: (top: 1cm, bottom: 1cm, left: 1cm, right: 1cm),
)

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education [
    #edu(
      institution: f(e, "institution"),
      date: f(e, "date"),
      location: f(e, "location"),
      degrees: e.at("degrees", default: ()).map(d => (d.at(0, default: ""), d.at(1, default: ""))),
      gpa: f(e, "gpa"),
      extra: f(e, "extra"),
    )
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows [
    #exp(
      title: f(w, "title"),
      organization: f(w, "organization"),
      date: f(w, "date"),
      location: f(w, "location"),
      details: [#for h in w.at("highlights", default: ()) [- #h]],
    )
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #exp(
      title: f(p, "title"),
      organization: f(p, "organization"),
      date: f(p, "date"),
      location: f(p, "location"),
      details: [#for h in p.at("highlights", default: ()) [- #h]],
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #skills(skill-rows.map(s => (f(s, "label"), s.at("items", default: ()))))
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    #exp(title: f(c, "title"), organization: f(c, "organization"))
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [- #l]
]
