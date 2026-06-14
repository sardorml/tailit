// Wraps @preview/lavandula. Markup-driven: a `lavandula-theme` show rule plus
// a two-column `#cv(sidebar:, main-content:)`. We generate sidebar + main
// markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/lavandula:0.1.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: lavandula-theme

#set text(lang: "en")
#set document(title: f(data, "name"), author: f(data, "name"))

#let contacts = rows("contacts")
#let skills = rows("skills")
#let languages = rows("languages")
#let work = rows("work")
#let projects = rows("projects")
#let education = rows("education")
#let certificates = rows("certificates")

#cv(
  sidebar-position: "left",
  sidebar: [
    = #f(data, "name")
    #if f(data, "label") != "" [
      ==== #f(data, "label")
    ]

    #if contacts.len() > 0 [
      #contact-list(
        contacts.map(c => {
          let label = f(c, "text")
          let url = f(c, "url")
          (
            icon: f(c, "icon"),
            icon-solid: c.at("solid", default: false),
            text: if url != "" { link(url)[#label] } else { label },
          )
        })
      )
    ]

    #if f(data, "summary") != "" [
      #sidebar-section(title: "About")[
        #set par(justify: true)
        #show par: it => block(width: 100%, it)
        #f(data, "summary")
      ]
    ]

    #if skills.len() > 0 [
      #sidebar-section(title: "Skills")[
        #for s in skills [
          #skill-group(
            name: f(s, "name"),
            icon: f(s, "icon"),
            icon-solid: s.at("solid", default: false),
            skills: s.at("items", default: ()),
          )
        ]
      ]
    ]

    #if languages.len() > 0 [
      #sidebar-section(title: "Languages")[
        #icon-list(
          languages.map(l => (icon: "language", icon-solid: true, text: l))
        )
      ]
    ]
  ],
  main-content: [
    #if work.len() > 0 [
      #section(title: "Experience")[
        #for w in work [
          #section-element(
            title: f(w, "title"),
            info: [_#f(w, "info")_],
            [
              #if f(w, "summary") != "" [ #f(w, "summary") ]
              #let hl = w.at("highlights", default: ())
              #if hl.len() > 0 [
                #set text(size: sizes.text-s2)
                #icon-list(hl.map(h => (icon: "angle-right", icon-solid: true, text: h)))
              ]
            ],
          )
        ]
      ]
    ]

    #if projects.len() > 0 [
      #section(title: "Projects")[
        #for p in projects [
          #section-element(
            title: f(p, "title"),
            info: [_#f(p, "info")_],
            [
              #if f(p, "url") != "" [ #text(size: sizes.text-s2)[#f(p, "url")] \ ]
              #if f(p, "summary") != "" [ #f(p, "summary") ]
              #let hl = p.at("highlights", default: ())
              #if hl.len() > 0 [
                #set text(size: sizes.text-s2)
                #icon-list(hl.map(h => (icon: "star", icon-solid: true, text: h)))
              ]
            ],
          )
        ]
      ]
    ]

    #if education.len() > 0 [
      #section(title: "Education")[
        #for e in education [
          #section-element-advanced(
            title: f(e, "title"),
            info-top-left: f(e, "info"),
            icon: fa-icon("graduation-cap"),
            [
              #set text(size: sizes.text-s2)
              #if f(e, "degree") != "" [ _#f(e, "degree")_ ]
              #let courses = e.at("courses", default: ())
              #if courses.len() > 0 [
                #icon-list(((icon: "book", icon-solid: true, text: courses.join(", ")),))
              ]
            ],
          )
        ]
      ]
    ]

    #if certificates.len() > 0 [
      #section(title: "Certifications")[
        #for c in certificates [
          #section-element(
            title: f(c, "title"),
            info: [_#f(c, "date")_],
            [
              #set text(size: sizes.text-s2)
              #if f(c, "issuer") != "" [ #f(c, "issuer") ]
            ],
          )
        ]
      ]
    ]
  ],
)
