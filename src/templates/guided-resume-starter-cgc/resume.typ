// Wraps @preview/guided-resume-starter-cgc. Markup-driven: a `resume.with`
// show rule plus `= Section` headings and #edu / #skills / #exp calls. We
// generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/guided-resume-starter-cgc:2.0.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume.with(
  author: f(data, "author"),
  location: f(data, "location"),
  contacts: rows("contacts").map(c => link(c.at("url", default: ""))[#c.at("label", default: "")]),
)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education {
    edu(
      institution: f(e, "institution"),
      date: f(e, "date"),
      location: f(e, "location"),
      gpa: f(e, "gpa"),
      degrees: e.at("degrees", default: ()).map(d => (d.at(0, default: ""), d.at(1, default: ""))),
    )
  }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #skills(skill-rows.map(s => (
    s.at("label", default: ""),
    s.at("items", default: ()).map(i => [#i]),
  )))
]

#let experience = rows("experience")
#if experience.len() > 0 [
  = Experience
  #for x in experience {
    exp(
      role: f(x, "role"),
      project: f(x, "project"),
      date: f(x, "date"),
      location: f(x, "location"),
      summary: f(x, "summary"),
      details: {
        for d in x.at("details", default: ()) [- #d]
      },
    )
  }
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    *#f(c, "name")* #if f(c, "issuer") != "" [— #emph[#c.issuer]] #if f(c, "date") != "" [(#c.date)] \
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #lang-rows.join("  |  ")
]
