// Wraps @preview/metronic. Markup-driven: a `resume-page` show rule whose
// `sidebar` holds the name/role/summary/contact + sidebar sections, and the
// body holds Experience/Projects via `#section`. We generate that markup from
// the injected JSON (shaped by ./adapter.ts).
#import "@preview/metronic:1.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let contact-data = data.at("contact", default: (:))
#let education = rows("education")
#let skills = rows("skills")
#let languages = rows("languages")
#let work-rows = rows("work")
#let project-rows = rows("projects")

#theme(
  accent-color: rgb("#2F6F8F"),
  background-color: rgb("#F2F0EF"),
)

#show: resume-page.with(
  sidebar: [
    = #f(data, "name")

    #if f(data, "role") != "" [
      #medium(f(data, "role"))
      #v(5pt)
    ]

    #if f(data, "summary") != "" [
      #f(data, "summary")
      #v(5pt)
    ]

    #contact(
      email: contact-data.at("email", default: ""),
      phone: contact-data.at("phone", default: ""),
      location: contact-data.at("location", default: ""),
      github: contact-data.at("github", default: ""),
      linkedin: contact-data.at("linkedin", default: ""),
      website: contact-data.at("website", default: ""),
      x: contact-data.at("x", default: ""),
    )

    #v(5pt)

    #if education.len() > 0 [
      #section(icon: "graduation-cap", "Education")[
        #small()[
          #for e in education [
            #if f(e, "degree") != "" [*#f(e, "degree")* \ ]
            #f(e, "institution")#if f(e, "dates") != "" [ (#f(e, "dates"))]

            #v(4pt)
          ]
        ]
      ]
    ]

    #if skills.len() > 0 [
      #section(icon: "check-double", "Skills")[
        #tags(..skills)
      ]
    ]

    #if languages.len() > 0 [
      #section(icon: "language", "Languages")[
        #tags(..languages)
      ]
    ]
  ]
)

#if work-rows.len() > 0 [
  #section(icon: "briefcase", "Professional Experience")[
    #for w in work-rows [
      === #f(w, "title")
      #{
        let meta = (f(w, "company"), f(w, "location"), f(w, "dates")).filter(s => s != "")
        if meta.len() > 0 [#meta.join(" • ")]
      }

      #for h in w.at("highlights", default: ()) [- #h]

      #v(10pt)
    ]
  ]
]

#if project-rows.len() > 0 [
  #section(icon: "lightbulb", "Projects")[
    #for p in project-rows [
      === #f(p, "name")
      #{
        let meta = (f(p, "url"), f(p, "dates")).filter(s => s != "")
        if meta.len() > 0 [#meta.join(" • ")]
      }

      #for h in p.at("highlights", default: ()) [- #h]

      #{
        let kw = p.at("keywords", default: ())
        if kw.len() > 0 [#tags(..kw)]
      }

      #v(10pt)
    ]
  ]
]
