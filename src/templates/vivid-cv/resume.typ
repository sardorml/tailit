// Wraps @preview/vivid-cv. The package is markup-driven (based on basic-resume):
// a `resume.with` show rule plus `== Section` headings and #work/#edu/#project/
// #certificates helpers. We generate that markup from the injected JSON (shaped
// by ./adapter.ts). The profile photo is disabled (no image asset is supplied).
#import "@preview/vivid-cv:0.1.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume.with(
  author: f(data, "name"),
  title: f(data, "title"),
  location: f(data, "location"),
  email: f(data, "email"),
  phone: f(data, "phone"),
  github: f(data, "github"),
  linkedin: f(data, "linkedin"),
  personal-site: f(data, "site"),
  show-photo: false,
  photo: [],
  about-title: if f(data, "summary") != "" { "About me" } else { "" },
  about-beside: if f(data, "summary") != "" [#data.summary] else [],
  header-color: "#06332a",
  name-color: "#ffdf2b",
  heading-color: "#06332a",
  text-color: "#303f3c",
  font: "Avenir Next",
  lang: "en",
)

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

#let education = rows("education")
#if education.len() > 0 [
  == Education
  #for e in education [
    #edu(
      institution: f(e, "institution"),
      location: f(e, "location"),
      dates: f(e, "dates"),
      degree: f(e, "degree"),
      consistent: true,
    )
    #for h in e.at("highlights", default: ()) [- #h]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #for s in skill-rows [
    #if f(s, "label") != "" [*#s.label:* ]#s.at("items", default: ()).join(", ") \
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
