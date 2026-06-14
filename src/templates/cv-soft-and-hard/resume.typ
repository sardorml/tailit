// Wraps @preview/cv-soft-and-hard. Markup-driven package: a `styling` show
// rule, a hand-rolled centered header, then `#section(title)` headings with
// `#entry(left, right)` two-column rows. We generate that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/cv-soft-and-hard:0.1.0": styling, section, entry

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#set document(author: f(data, "name"), title: f(data, "name"))
// NOTE: styling.with(accent-color:) is buggy upstream (its state update returns
// none), so we use the default styling — its accent color is black.
#show: styling

// Header: name, target role, then contact links separated by " | ".
#let contacts = rows("contacts")
#let contact-links = contacts.map(c => link(c.at("href", default: ""), c.at("label", default: "")))
#align(center)[
  #heading(level: 1, [#f(data, "name") --- #f(data, "title")])
  #if contact-links.len() > 0 [
    #linebreak()
    #contact-links.join(" | ")
  ]
]

#if f(data, "summary") != "" [
  #section("Profile")
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section("Experience")
  #for w in work-rows [
    #entry(
      [
        *#f(w, "title")*#if f(w, "company") != "" [ (_#f(w, "company")_)]#if f(w, "location") != "" [, #f(w, "location")]
        #for h in w.at("highlights", default: ()) [
          - #h
        ]
      ],
      [_#f(w, "dates")_],
    )
  ]
]

#let education = rows("education")
#if education.len() > 0 [
  #section("Education")
  #for e in education [
    #entry(
      [
        *#f(e, "institution")*#if f(e, "degree") != "" [\
        #f(e, "degree")]
        #for h in e.at("highlights", default: ()) [
          - #h
        ]
      ],
      [_#f(e, "dates")_],
    )
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section("Selected Projects")
  #for p in project-rows [
    #entry(
      [
        #if f(p, "href") != "" [*#link(f(p, "href"), f(p, "name"))*] else [*#f(p, "name")*]
        #for h in p.at("highlights", default: ()) [
          - #h
        ]
      ],
      [_#f(p, "dates")_],
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section("Skills")
  #table(
    align: left,
    columns: (auto, 1fr),
    stroke: none,
    row-gutter: 0pt,
    column-gutter: 5pt,
    inset: (left: 0pt, top: 2pt),
    ..skill-rows.map(s => (text(f(s, "label"), weight: 600), [#f(s, "items")])).flatten(),
  )
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section("Certifications")
  #for c in cert-rows [
    #entry(
      [*#f(c, "name")*#if f(c, "issuer") != "" [ (_#f(c, "issuer")_)]],
      [_#f(c, "dates")_],
    )
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section("Languages")
  #lang-rows.join(", ")
]
