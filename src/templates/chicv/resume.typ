// Wraps @preview/chicv. The package is markup-driven: its template is plain
// Typst (a `= Name` heading + contact line, then `== Section` blocks each
// preceded by `#chiline()`, with `*Title* #h(1fr) dates` rows). We reproduce
// that exact structure from the injected JSON (shaped by ./adapter.ts).
#import "@preview/chicv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// --- chicv look & feel (mirrors template/cv.typ) ---
#show heading: set text(font: "Linux Biolinum")
#show link: underline
#set page(margin: (x: 0.9cm, y: 1.3cm))
#set par(justify: true)
#let chiline() = { v(-3pt); line(length: 100%); v(-5pt) }

// --- Header ---
= #f(data, "name")

#let contacts = (
  (f(data, "email"), f(data, "phone"), f(data, "location"))
    + rows("links")
    + (f(data, "site"),)
).filter(c => c != "")
#contacts.join(" | ")

// --- Summary ---
#if f(data, "summary") != "" [
  == Summary
  #chiline()
  #data.summary
]

// --- Work Experience ---
#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Work Experience
  #chiline()
  #for w in work-rows [
    *#f(w, "title")* #h(1fr) #f(w, "dates") \
    #f(w, "company")#if f(w, "location") != "" [ #h(1fr) #f(w, "location")] \
    #for h in w.at("highlights", default: ()) [- #h
    ]
  ]
]

// --- Education ---
#let education = rows("education")
#if education.len() > 0 [
  == Education
  #chiline()
  #for e in education [
    #if f(e, "url") != "" [#link("https://" + f(e, "url"))[*#f(e, "institution")*]] else [*#f(e, "institution")*] #h(1fr) #f(e, "dates") \
    #if f(e, "degree") != "" [#f(e, "degree") \ ]
    #for h in e.at("highlights", default: ()) [- #h
    ]
  ]
]

// --- Projects ---
#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #chiline()
  #for p in project-rows [
    #if f(p, "url") != "" [#link("https://" + f(p, "url"))[*#f(p, "name")*]] else [*#f(p, "name")*] #h(1fr) #f(p, "dates") \
    #for h in p.at("highlights", default: ()) [- #h
    ]
  ]
]

// --- Skills ---
#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #chiline()
  #for s in skill-rows [
    #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ") \
  ]
]

// --- Certifications ---
#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #chiline()
  #for c in cert-rows [
    *#f(c, "name")*#if f(c, "issuer") != "" [ — #f(c, "issuer")] #h(1fr) #f(c, "date") \
  ]
]

// --- Languages ---
#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #chiline()
  #lang-rows.join(" | ")
]
