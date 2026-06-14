// Wraps @preview/gloat. The package is markup-driven: a `cv.with` show rule
// plus `= Section` headings and #edu/#exp/#award/#skills calls. We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/gloat:0.1.0": cv, edu, exp, award, skills

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build contact chips as links (or plain text when no href).
#let contacts = rows("contacts").map(c => {
  let href = f(c, "href")
  let label = f(c, "text")
  if href != "" { link(href)[#label] } else { label }
})

#show: cv.with(
  author: f(data, "name"),
  address: f(data, "address"),
  contacts: contacts,
  updated: datetime.today(),
)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows [
    #exp(
      role: f(w, "role"),
      org: f(w, "org"),
      location: f(w, "location"),
      start: f(w, "start"),
      end: f(w, "end"),
      summary: f(w, "summary"),
      details: {
        for h in w.at("highlights", default: ()) [- #h]
      },
    )
  ]
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education
  #for e in edu-rows [
    #edu(
      institution: f(e, "institution"),
      location: f(e, "location"),
      date: f(e, "date"),
      degrees: e.at("degrees", default: ()).map(d => [#d]),
      gpa: f(e, "gpa"),
      details: {
        for h in e.at("highlights", default: ()) [- #h]
      },
    )
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #exp(
      role: f(p, "role"),
      org: f(p, "org"),
      location: f(p, "location"),
      start: f(p, "start"),
      end: f(p, "end"),
      summary: f(p, "summary"),
      details: {
        for h in p.at("highlights", default: ()) [- #h]
      },
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #skills(skill-rows.map(s => (
    f(s, "label"),
    s.at("items", default: ()).map(i => [#i]),
  )))
]

#let award-rows = rows("awards")
#if award-rows.len() > 0 [
  = Certifications
  #for a in award-rows [
    #award(
      name: f(a, "name"),
      from: f(a, "from"),
      date: f(a, "date"),
    )
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #skills(((
    "Languages",
    lang-rows.map(l => [#l]),
  ),))
]
