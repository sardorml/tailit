// Wraps @preview/modern-cv. The package is markup-driven: a `resume.with`
// show rule (fed an `author` dict) plus `= Section` headings and per-item
// functions (#resume-entry / #resume-item / #resume-skill-item /
// #resume-certification). We build the author dict and generate that markup
// from the injected JSON (shaped by ./adapter.ts).
#import "@preview/modern-cv:0.10.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the author dict, including only contact keys that have a value — the
// package keys off `"<field>" in author` to decide what to render.
#let raw-author = data.author
#let author = (
  firstname: f(raw-author, "firstname"),
  lastname: f(raw-author, "lastname"),
  positions: raw-author.at("positions", default: ()),
)
#for key in ("email", "phone", "address", "homepage", "github", "linkedin") {
  let v = raw-author.at(key, default: "")
  if v != "" { author.insert(key, v) }
}

#show: resume.with(
  author: author,
  profile-picture: none,
  accent-color: "#262F99",
  colored-headers: true,
  show-footer: false,
  paper-size: "a4",
)

#let summary = f(data, "summary")
#if summary != "" [
  = Summary
  #resume-item[#summary]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows [
    #resume-entry(
      title: f(w, "title"),
      location: f(w, "location"),
      date: f(w, "dates"),
      description: f(w, "company"),
    )
    #let hl = w.at("highlights", default: ())
    #if hl.len() > 0 [
      #resume-item[
        #for h in hl [- #h]
      ]
    ]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #resume-entry(
      title: f(p, "name"),
      location: f(p, "url"),
      date: f(p, "dates"),
    )
    #let hl = p.at("highlights", default: ())
    #if hl.len() > 0 [
      #resume-item[
        #for h in hl [- #h]
      ]
    ]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows {
    let label = f(s, "label")
    let items = s.at("items", default: ())
    if label != "" {
      resume-skill-item(label, items)
    } else if items.len() > 0 {
      resume-skill-item("", items)
    }
  }
  // spacing fix per the package template
  #block(below: 0.65em)
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #resume-skill-item("Languages", lang-rows)
  #block(below: 0.65em)
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education
  #for e in edu-rows [
    #resume-entry(
      title: f(e, "institution"),
      location: f(e, "location"),
      date: f(e, "dates"),
      description: f(e, "degree"),
    )
    #let hl = e.at("highlights", default: ())
    #if hl.len() > 0 [
      #resume-item[
        #for h in hl [- #h]
      ]
    ]
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows {
    let name = f(c, "name")
    let issuer = f(c, "issuer")
    let date = f(c, "date")
    let label = if issuer != "" { name + " — " + issuer } else { name }
    resume-certification(label, date)
  }
]
