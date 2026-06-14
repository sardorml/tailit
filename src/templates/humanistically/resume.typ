// Wraps @preview/humanistically. Markup-driven academic-CV template: a
// `humanistically.with` show rule, `= Section` headings, and per-item
// `experience` / `paper` calls. We generate that markup from the injected
// JSON (shaped by ./adapter.ts).
#import "@preview/humanistically:0.1.0": humanistically, experience, paper

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let contacts = rows("contacts").map(c => [#c])

#show: humanistically.with(
  name: f(data, "name"),
  address: f(data, "address"),
  updated: f(data, "updated"),
  contacts: contacts,
  footer-text: [#f(data, "footer")#sym.space],
)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education [
    #experience(
      place: [#f(e, "place")#if f(e, "institution") != "" [, #f(e, "institution")]],
      time: [#f(e, "time")],
    )[
      #for h in e.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Professional Experience
  #for w in work-rows [
    #experience(
      place: [#f(w, "place")],
      title: f(w, "title"),
      location: f(w, "location"),
      time: [#f(w, "time")],
    )[
      #for h in w.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #experience(
      place: [#f(p, "place")],
      title: f(p, "title"),
      time: [#f(p, "time")],
    )[
      #for h in p.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    #paper(
      venue: [#f(c, "venue")],
      title: [#f(c, "title")],
      date: [#f(c, "date")],
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#f(s, "items")
  ]
]

#if f(data, "languages") != "" [
  = Languages
  #data.languages
]
