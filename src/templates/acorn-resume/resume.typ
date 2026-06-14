// Wraps @preview/acorn-resume. Markup-driven: a `resume.with` show rule plus
// `#header`, `#exp`, `#project`, `#edu` calls and `== Section` headings. We
// generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/acorn-resume:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume.with(
  author: f(data, "name"),
  font: "New Computer Modern",
  font-size: 11pt,
  link-style: (
    underline: true,
    color: black,
  ),
)

// Header: contacts is an array of (url, label) pairs. Drop the link when
// url is empty (e.g. a plain location string).
#let contact-pairs = rows("contacts").map(c => {
  let url = c.at(0, default: "")
  let label = c.at(1, default: "")
  if url == "" { label } else { link(url)[#label] }
})

#align(center, [
  = #f(data, "name")
  #contact-pairs.join(" | ")
])

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Experience
  #for w in work-rows [
    #exp(
      role: f(w, "role"),
      date: f(w, "date"),
      organization: f(w, "organization"),
      location: f(w, "location"),
      details: [
        #for h in w.at("highlights", default: ()) [- #h]
      ],
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #pad(
    top: 0.15em,
    [
      #for s in skill-rows [
        #if f(s, "label") != "" [*#s.label:* ]#s.at("items", default: ()).join(", ") \
      ]
    ],
  )
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #for p in project-rows [
    #project(
      name: f(p, "name"),
      technologies: p.at("technologies", default: ()),
      live-url: if f(p, "liveUrl") != "" { f(p, "liveUrl") } else { none },
      repo-url: if f(p, "repoUrl") != "" { f(p, "repoUrl") } else { none },
      details: [
        #for h in p.at("highlights", default: ()) [- #h]
      ],
    )
  ]
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  == Education
  #for e in education-rows [
    #edu(
      degree: f(e, "degree"),
      date: f(e, "date"),
      institution: f(e, "institution"),
      gpa: if f(e, "gpa") != "" { f(e, "gpa") } else { none },
      location: f(e, "location"),
    )
    #for h in e.at("highlights", default: ()) [- #h]
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #pad(
    top: 0.15em,
    [
      #for c in cert-rows [
        *#f(c, "name")* #if f(c, "issuer") != "" [— #c.issuer] #if f(c, "date") != "" [(#c.date)] \
      ]
    ],
  )
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #pad(top: 0.15em, lang-rows.join(", "))
]
