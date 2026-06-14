// Wraps @preview/bone-resume. The package is markup-driven: a `resume-init`
// show rule, `= Section` headings, and `resume-section(name, decs)[body]`
// boxes. We generate that markup from the injected JSON (shaped by ./adapter.ts).
// The header is built manually (the package's `info` helper needs a photo).
#import "@preview/bone-resume:0.3.1": resume-init, resume-section

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
#let chip(c) = if f(c, "url") != "" [#c.label: #link(c.url)[#c.value]] else [#c.label: #c.value]

#show: resume-init.with(
  author: f(data, "name"),
  footer: [Powered by #link(
      "https://github.com/typst/packages/tree/main/packages/preview/bone-resume",
    )[BoneResume]],
)

#let contacts = rows("contacts")
#let links = rows("links")
#stack(
  dir: ltr,
  spacing: 1fr,
  {
    text(24pt)[*#f(data, "name")*]
    if f(data, "label") != "" {
      linebreak()
      v(0.4em, weak: true)
      text(12pt, fill: rgb("#448"))[#data.label]
    }
  },
  if contacts.len() > 0 {
    stack(spacing: 0.75em, ..contacts.map(chip))
  },
  if links.len() > 0 {
    stack(spacing: 0.75em, ..links.map(chip))
  },
)

// Tighten the gap below the header. With a job title the name column gains a
// second line, so pull up less — otherwise the first section overlaps it.
#if f(data, "label") != "" { v(-0.5em) } else { v(-2em) }

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education [
    #f(e, "institution") #h(1cm) #emph(f(e, "degree")) #h(1fr) #f(e, "dates") \
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Work Experience
  #for w in work-rows [
    #resume-section(
      [#f(w, "title") #h(0.6em) #emph[#f(w, "company")]],
      f(w, "detail"),
    )[
      #for h in w.at("highlights", default: ()) [- #h]
    ]
    #v(0.4em, weak: true)
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #let head = if f(p, "url") != "" {
      link(p.url)[#f(p, "name")]
    } else { f(p, "name") }
    #resume-section(
      head,
      f(p, "dates"),
    )[
      #for h in p.at("highlights", default: ()) [- #h]
    ]
    #v(0.4em, weak: true)
  ]
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
    - #f(c, "name")#if f(c, "issuer") != "" [ — #c.issuer]#if f(c, "date") != "" [ #h(1fr) #c.date]
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [- #l]
]
