// Wraps @preview/habaneraa-one-page-resume-zh. The package is markup-driven:
// `setup-styles()` returns `resume-header` (a show rule) and `resume-entry`,
// then `= Section` headings + `resume-entry(...)` build the body. We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/habaneraa-one-page-resume-zh:0.1.0": setup-styles

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let (resume-header, resume-entry) = setup-styles(
  accent-color: rgb("#179299"),
  font-size: 10pt,
  element-spaciness: 1.00,
)

#show: resume-header.with(
  author: f(data, "name"),
  basic-info: data.at("basicInfo", default: ()),
  telephone: f(data, "telephone"),
  email: f(data, "email"),
  github-id: f(data, "github"),
  other-link: f(data, "otherLink"),
  location: f(data, "location"),
)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Work Experience
  #for w in work-rows {
    resume-entry(
      title: f(w, "title"),
      subtitle: f(w, "subtitle"),
      date: f(w, "date"),
    )[
      #for h in w.at("highlights", default: ()) [- #h]
    ]
  }
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education
  #for e in edu-rows {
    resume-entry(
      title: f(e, "title"),
      subtitle: f(e, "subtitle"),
      date: f(e, "date"),
    )[
      #for h in e.at("highlights", default: ()) [- #h]
    ]
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows {
    resume-entry(
      title: f(p, "title"),
      subtitle: f(p, "subtitle"),
      date: f(p, "date"),
    )[
      #for h in p.at("highlights", default: ()) [- #h]
    ]
  }
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
  #for c in cert-rows {
    resume-entry(
      title: f(c, "title"),
      subtitle: f(c, "subtitle"),
      date: f(c, "date"),
    )[]
  }
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #lang-rows.join(" · ")
]
