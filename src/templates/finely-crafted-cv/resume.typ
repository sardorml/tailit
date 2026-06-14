// Wraps @preview/finely-crafted-cv. Markup-driven package: a `resume.with`
// show rule plus `= Section` headings and #company-heading / #job-heading /
// #school-heading / #degree-heading calls. We generate that markup from the
// injected JSON (shaped by ./adapter.ts). No package icon assets are used; the
// contact header gets short text labels instead of SVG icons.
#import "@preview/finely-crafted-cv:0.3.0": resume, company-heading, job-heading, school-heading, degree-heading

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the contact header tuples: ( label-as-icon , linked-or-plain value ).
#let contacts = rows("contacts")
#let contact-header = contacts.map(c => {
  let label = text(weight: "bold")[#f(c, "label")]
  let value = if f(c, "url") != "" { link(f(c, "url"), f(c, "text")) } else { f(c, "text") }
  (label, value)
})

#show: resume.with(
  name: f(data, "name"),
  tagline: f(data, "tagline"),
  keywords: f(data, "keywords"),
  icon-contact-header: if contact-header.len() > 0 { contact-header } else { none },
)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let location = f(data, "location")
#if location != "" [
  = Location
  #location
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows {
    company-heading(f(w, "company"), start: f(w, "start"), end: none)[
      #job-heading(f(w, "title"), location: if f(w, "location") != "" { f(w, "location") } else { none })[
        #for h in w.at("highlights", default: ()) [- #h]
      ]
    ]
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows {
    company-heading(f(p, "name"), start: f(p, "dates"), end: none)[
      #job-heading(if f(p, "url") != "" { f(p, "url") } else { " " })[
        #for h in p.at("highlights", default: ()) [- #h]
      ]
    ]
  }
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education
  #for e in edu-rows {
    school-heading(f(e, "institution"), start: f(e, "dates"), end: none)[
      #degree-heading(if f(e, "degree") != "" { f(e, "degree") } else { " " })[
        #for h in e.at("highlights", default: ()) [- #h]
      ]
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
  #for c in cert-rows [
    - *#f(c, "name")*#if f(c, "issuer") != "" [ — #f(c, "issuer")]#if f(c, "date") != "" [ (#f(c, "date"))]
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [- #l]
]
