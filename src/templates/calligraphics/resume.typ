// Wraps @preview/calligraphics. Markup-driven: a `#resume(author: ...)[left][right]`
// call. The left column holds the aside (skills, languages); the right column
// holds summary, experience, projects, education and certifications. We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/calligraphics:1.0.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let author = data.at("author", default: (:))

// Some required fields must always be present for the package.
#let author = (
  firstname: author.at("firstname", default: "Name"),
  lastname: author.at("lastname", default: "Your"),
  positions: author.at("positions", default: ()),
) + author

#let entry(e) = {
  resume-entry(
    title: f(e, "title"),
    location: f(e, "location"),
    date: f(e, "date"),
    description: f(e, "description"),
  )
  let hl = e.at("highlights", default: ())
  if hl.len() > 0 {
    resume-item[
      #for h in hl [- #h]
    ]
  }
}

#resume(
  author: author,
  main-color: rgb("#a658b8"),
)[
  // ---- Left column (aside) ----
  #let skills = rows("skills")
  #if skills.len() > 0 [
    = Skills
    #for s in skills [
      #aside-skill-item(f(s, "category"), s.at("items", default: ()))
    ]
  ]

  #let langs = rows("languages")
  #if langs.len() > 0 [
    = Languages
    #aside-skill-item("Languages", langs)
  ]
][
  // ---- Right column (main) ----
  #if f(data, "summary") != "" [
    = Profile
    // resume-entry sections below get 1.5em above; resume-item only gives 0.5em,
    // so the summary hugged the banner. Match the entry spacing here.
    #block(above: 1.5em)[#resume-item[#data.summary]]
  ]

  #let work-rows = rows("work")
  #if work-rows.len() > 0 [
    = Experience
    #for w in work-rows [ #entry(w) ]
  ]

  #let project-rows = rows("projects")
  #if project-rows.len() > 0 [
    = Projects
    #for p in project-rows [
      #resume-entry(
        title: f(p, "title"),
        location: if f(p, "url") != "" { link(f(p, "url"))[#f(p, "urlLabel")] } else { "" },
        date: f(p, "date"),
        description: f(p, "description"),
      )
      #let hl = p.at("highlights", default: ())
      #if hl.len() > 0 [
        #resume-item[#for h in hl [- #h]]
      ]
    ]
  ]

  #let edu-rows = rows("education")
  #if edu-rows.len() > 0 [
    = Education
    #for e in edu-rows [ #entry(e) ]
  ]

  #let cert-rows = rows("certificates")
  #if cert-rows.len() > 0 [
    = Certifications
    #for c in cert-rows [ #entry(c) ]
  ]
]
