// Wraps @preview/ats-friendly-resume. The package is markup-driven: a
// `resume.with` show rule plus `== Section` headings and #work/#project/#edu
// calls. We generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/ats-friendly-resume:0.1.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume.with(
  author: f(data, "name"),
  author-position: center,
  location: f(data, "location"),
  email: f(data, "email"),
  phone: f(data, "phone"),
  github: f(data, "github"),
  linkedin: f(data, "linkedin"),
  portfolio: f(data, "portfolio"),
  personal-info-position: center,
  color-enabled: true,
  text-color: "#26428b",
  font: "New Computer Modern",
  paper: "us-letter",
  author-font-size: 20pt,
  font-size: 10pt,
  lang: "en",
)

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Experience
  #for w in work-rows [
    #work(
      company: f(w, "company"),
      role: f(w, "role"),
      dates: f(w, "dates"),
      location: f(w, "location"),
    )
    #for h in w.at("highlights", default: ()) [- #h]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #for p in project-rows [
    #project(
      name: f(p, "name"),
      dates: f(p, "dates"),
      tech-used: f(p, "techUsed"),
      url: f(p, "url"),
    )
    #for h in p.at("highlights", default: ()) [- #h]
  ]
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  == Education
  #for e in edu-rows [
    #edu(
      institution: f(e, "institution"),
      location: f(e, "location"),
      degree: f(e, "degree"),
      dates: f(e, "dates"),
    )
  ]
]
