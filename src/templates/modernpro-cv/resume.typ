// Wraps @preview/modernpro-cv (Deedy-inspired, markup-driven): a `cv-single`
// show rule for the header, then `#section` headings plus per-item helpers
// (#job / #education / #project / #oneline-title-item / #award). We drive every
// value from the injected JSON (shaped by ./adapter.ts) and pass plain-text
// contacts so no fontawesome dependency is needed.
#import "@preview/modernpro-cv:1.3.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let contacts = rows("contacts").map(c => {
  if f(c, "link") != "" {
    (text: f(c, "text"), link: c.link)
  } else {
    (text: f(c, "text"))
  }
})

#show: cv-single.with(
  font-type: "Times New Roman",
  continue-header: "false",
  margin: (left: 1.5cm, right: 1.5cm, top: 1.2cm, bottom: 1.2cm),
  name: [#f(data, "name")],
  address: if f(data, "address") != "" { [#data.address] } else { none },
  lastupdated: "false",
  pagecount: "true",
  contacts: contacts,
)

#if f(data, "summary") != "" [
  #section("Summary")
  #descript[#data.summary]
  #sectionsep
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section("Experience")
  #for w in work-rows [
    #job(
      position: f(w, "position"),
      institution: f(w, "institution"),
      location: f(w, "location"),
      date: f(w, "date"),
      description: if w.at("highlights", default: ()).len() > 0 {
        list(..w.highlights.map(h => [#h]))
      } else { none },
    )
    #subsectionsep
  ]
  #sectionsep
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section("Projects")
  #for p in project-rows [
    #project(
      f(p, "name") + if f(p, "url") != "" [ (#f(p, "url"))] else [],
      f(p, "date"),
      if p.at("highlights", default: ()).len() > 0 {
        list(..p.highlights.map(h => [#h]))
      } else { none },
    )
    #subsectionsep
  ]
  #sectionsep
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  #section("Education")
  #for e in education-rows [
    #education(
      institution: f(e, "institution"),
      major: f(e, "major"),
      date: f(e, "date"),
      location: if f(e, "location") != "" { f(e, "location") } else { none },
      description: if e.at("highlights", default: ()).len() > 0 {
        list(..e.highlights.map(h => [#h]))
      } else { none },
    )
    #subsectionsep
  ]
  #sectionsep
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section("Skills")
  #for s in skill-rows [
    #oneline-title-item(title: f(s, "label"), content: f(s, "items"))
  ]
  #sectionsep
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section("Certifications")
  #for c in cert-rows [
    #award(
      award: f(c, "name"),
      institution: f(c, "issuer"),
      date: f(c, "date"),
    )
  ]
  #sectionsep
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section("Languages")
  #oneline-title-item(title: "Languages", content: lang-rows.join(", "))
  #sectionsep
]
