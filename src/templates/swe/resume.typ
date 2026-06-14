// Entry point compiled by src/lib/typst/compile.ts (template id "swe").
// Adapted from sardorml/swe-cv-typst's template/main.typ: the resume is injected
// as a JSON string via sys.inputs (shaped by src/templates/swe/adapter.ts) instead of
// read from configuration.yaml. Layout/styling is unchanged.
#import "lib.typ": *

#let data = json(bytes(sys.inputs.resume))
#let field(d, key) = d.at(key, default: "")
#let rows(key) = if key in data and type(data.at(key)) == array { data.at(key) } else { () }

#set page(margin: (left: 1.5cm, right: 1.5cm, top: 2cm, bottom: 2cm))
#set text(size: 9pt)

#let header = data.at("header", default: (:))

// Main header — contact left, name/site centre, profiles right.
#grid(
  columns: (1fr, 1fr, 1fr),
  align(left)[
    #if field(header, "email") != "" [#link(header.email)[#field(header, "emailDisplay")] \ ]
    #if field(header, "phone") != "" [#header.phone \ ]
  ],
  align(center)[
    #text(weight: "semibold", size: 2em)[#field(header, "name")] \
    #if field(header, "website") != "" [#link(header.website)[#field(header, "websiteDisplayName")]]
  ],
  align(right)[
    #if field(header, "github") != "" [#header.github \ ]
    #if field(header, "linkedin") != "" [#header.linkedin \ ]
  ],
)

#if field(data, "summary") != "" [
  #block(above: 0.8em, below: 0.4em)[#data.summary]
]

#let education = rows("education")
#if education.len() > 0 {
  section([Education])
  for ed in education [
    #exp-header((left: field(ed, "location"), center: field(ed, "name"), right: field(ed, "date")))
    #if field(ed, "degree") != "" [- #ed.degree]
  ]
  block(below: 1em)
}

#let employment = rows("employment")
#if employment.len() > 0 {
  section([Employment])
  for exp in employment [
    #exp-header((left: field(exp, "location"), center: field(exp, "company"), right: field(exp, "date")))
    #if field(exp, "position") != "" [#emph(exp.position) \ ]
    #for responsibility in exp.at("responsibilities", default: ()) [
      - #responsibility
    ]
  ]
  block(below: 1em)
}

#let projects = rows("projects")
#if projects.len() > 0 {
  section([Projects])
  for project in projects [
    #if field(project, "website") != "" [
      #project-header((title: field(project, "title"), website: project.website))
    ] else [
      #block(above: 1em, below: 1em)[#text(weight: "semibold", size: 1.25em)[#field(project, "title")]]
    ]
    #for contribution in project.at("contributions", default: ()) [
      - #contribution
    ]
  ]
  block(below: 1em)
}

#let skills = rows("skills")
#if skills.len() > 0 {
  section([Technical Skills])
  for group in skills [
    #if group.at("items", default: ()).len() > 0 [
      - #if field(group, "label") != "" [*#group.label:* ] #group.at("items", default: ()).join(", ")
    ]
  ]
  block(below: 1em)
}

#let languages = rows("languages")
#if languages.len() > 0 {
  section([Languages])
  for l in languages [- #l]
  block(below: 1em)
}

#let certificates = rows("certificates")
#if certificates.len() > 0 {
  section([Certifications])
  for c in certificates [
    - *#field(c, "name")*#if field(c, "description") != "" [ — #c.description]
  ]
}
