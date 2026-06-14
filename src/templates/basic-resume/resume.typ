// Wraps @preview/basic-resume. The package is markup-driven: a `resume.with`
// show rule plus `== Section` headings and #edu/#work/#project calls. We
// generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/basic-resume:0.2.9": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume.with(
  author: f(data, "name"),
  location: f(data, "location"),
  email: f(data, "email"),
  github: f(data, "github"),
  linkedin: f(data, "linkedin"),
  phone: f(data, "phone"),
  personal-site: f(data, "site"),
  accent-color: "#26428b",
  font: "New Computer Modern",
)

#if f(data, "summary") != "" [
  == Summary
  #data.summary
]

#let education = rows("education")
#if education.len() > 0 [
  == Education
  #for e in education [
    #edu(
      institution: f(e, "institution"),
      location: f(e, "location"),
      dates: f(e, "dates"),
      degree: f(e, "degree"),
    )
    #for h in e.at("highlights", default: ()) [- #h]
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Work Experience
  #for w in work-rows [
    #work(
      title: f(w, "title"),
      company: f(w, "company"),
      location: f(w, "location"),
      dates: f(w, "dates"),
    )
    #for h in w.at("highlights", default: ()) [- #h]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #for p in project-rows [
    #project(name: f(p, "name"), role: f(p, "role"), dates: f(p, "dates"), url: f(p, "url"))
    #for h in p.at("highlights", default: ()) [- #h]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #for c in cert-rows [
    #certificates(name: f(c, "name"), issuer: f(c, "issuer"), date: f(c, "date"))
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #for l in lang-rows [- #l]
]
