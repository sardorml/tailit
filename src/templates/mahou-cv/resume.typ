// Wraps @preview/mahou-cv. The package is a composable, markup-driven template:
// `set-theme`, then `#show: cv(name, bio, main, aside)` where `main` and `aside`
// are content columns built from `section()`, `label()`, and `item()`. We
// generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/mahou-cv:0.1.0": cv, item, label, section, set-theme

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#set-theme((
  color: (
    accent: rgb("#E16B8C"),
    header: (
      accent: rgb("#64363C"),
      body: black,
    ),
  ),
))

// ---- main column: summary, work, education, projects ----
#let main = {
  if f(data, "summary") != "" {
    section("Profile")[#data.summary]
  }

  let work-rows = rows("work")
  if work-rows.len() > 0 {
    section("Experience")[
      #for w in work-rows {
        label(f(w, "dates"))[
          #item(f(w, "title"), caption: f(w, "company"))[
            #if f(w, "location") != "" [#emph(w.location) #linebreak()]
            #for h in w.at("highlights", default: ()) [- #h]
          ]
        ]
        v(4pt)
      }
    ]
  }

  let edu-rows = rows("education")
  if edu-rows.len() > 0 {
    section("Education")[
      #for e in edu-rows {
        label(f(e, "dates"))[
          #item(f(e, "degree"), caption: f(e, "institution"))[
            #for h in e.at("highlights", default: ()) [- #h]
          ]
        ]
        v(4pt)
      }
    ]
  }

  let project-rows = rows("projects")
  if project-rows.len() > 0 {
    section("Projects")[
      #for p in project-rows {
        label(f(p, "dates"))[
          #item(f(p, "name"), caption: f(p, "url"))[
            #for h in p.at("highlights", default: ()) [- #h]
          ]
        ]
        v(4pt)
      }
    ]
  }
}

// ---- aside column: contact, skills, certificates, languages ----
#let aside = {
  let contact-rows = rows("contact")
  if contact-rows.len() > 0 {
    section("Contact")[
      #for c in contact-rows {
        label(f(c, "label"))[#c.at("value", default: "")]
      }
    ]
  }

  let skill-rows = rows("skills")
  if skill-rows.len() > 0 {
    section("Skills")[
      #for s in skill-rows {
        if f(s, "label") != "" {
          label(f(s, "label"))[#s.at("items", default: "")]
        } else {
          label("")[#s.at("items", default: "")]
        }
      }
    ]
  }

  let cert-rows = rows("certificates")
  if cert-rows.len() > 0 {
    section("Certifications")[
      #for c in cert-rows {
        label(f(c, "date"))[
          #item(f(c, "name"), caption: f(c, "issuer"))[]
        ]
        v(3pt)
      }
    ]
  }

  let lang-rows = rows("languages")
  if lang-rows.len() > 0 {
    section("Languages")[
      #for l in lang-rows [- #l]
    ]
  }
}

#show: cv(
  f(data, "name"),
  f(data, "bio"),
  main,
  aside,
)
