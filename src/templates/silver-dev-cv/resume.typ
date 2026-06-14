// Wraps @preview/silver-dev-cv. The package is markup-driven: a `cv.with` show
// rule (name, address, contacts array) plus `#section` headings and per-item
// functions (#job, #education, #project, #descript, #oneline-title-item). We
// generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/silver-dev-cv:1.0.2": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: cv.with(
  font-type: "Times New Roman",
  continue-header: "false",
  name: f(data, "name"),
  address: f(data, "address"),
  lastupdated: "false",
  pagecount: "true",
  date: none,
  contacts: data.at("contacts", default: ()),
)

#if f(data, "summary") != "" [
  #section("About Me")
  #descript(data.summary)
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
      date: f(w, "dates"),
      description: [
        #for h in w.at("highlights", default: ()) [- #h
        ]
      ],
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
      title: f(p, "name"),
      date: f(p, "dates"),
      description: [
        #if f(p, "url") != "" [#emph(p.url) \ ]
        #for h in p.at("highlights", default: ()) [- #h
        ]
      ],
    )
    #subsectionsep
  ]
  #sectionsep
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section("Skills")
  #for s in skill-rows [
    #oneline-title-item(
      title: if f(s, "label") != "" { s.label } else { "Skills" },
      content: s.at("items", default: ()).join(", "),
    )
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
      date: f(e, "dates"),
      location: f(e, "location"),
    )
    #subsectionsep
  ]
  #sectionsep
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section("Certifications")
  #for c in cert-rows [
    #award(award: f(c, "name"), institution: f(c, "issuer"), date: f(c, "date"))
  ]
  #sectionsep
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section("Languages")
  #oneline-title-item(title: "Languages", content: lang-rows.join(", "))
]
