// Wraps @preview/impressive-impression. Data-driven: build an aside (persona,
// contact, social, languages, skills) and a main column (summary, work,
// education, projects, certificates) from the injected JSON (shaped by
// ./adapter.ts) and hand them to the package's `cv()` function. We omit the
// optional profile photo and FontAwesome icons used in the package's own
// demo template — neither is part of the package itself.
#import "@preview/impressive-impression:0.2.1": (
  cv,
  theme-fortyseconds,
  make-aside-persona,
  make-aside-grid,
  make-main-content-block-with-timeline,
)

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// The package's exported `theme-fortyseconds` omits the
// `aside-heading-line-opposite-cap` key that cv.typ's aside-heading show rule
// reads, so add it (mirroring the template's own theme.typ).
#let theme = theme-fortyseconds + (
  aside-heading-line-opposite-cap: "butt",
)

// A timeline tuple from start/end strings: ([end], [start]) when both exist,
// a single [time] when only one is present.
#let time-of(item) = {
  let s = f(item, "start")
  let e = f(item, "end")
  if s != "" and e != "" { ([#e], [#s]) }
  else if e != "" { [#e] }
  else if s != "" { [#s] }
  else { [] }
}

#let linked(text-body, url) = {
  if url != "" { link(url, text-body) } else { text-body }
}

#let main-entry(item, supplement) = {
  make-main-content-block-with-timeline(
    time-of(item),
    f(item, "title"),
    {
      let hs = item.at("highlights", default: ())
      if hs.len() > 0 {
        for h in hs [- #h]
      }
    },
    supplement: supplement,
    theme: theme,
  )
}

// ---- Main column ----
#let main-content = [
  #if f(data, "summary") != "" [
    == Introduction
    #block([
      #set par(justify: true)
      #data.summary
    ])
  ]

  #let work-rows = rows("work")
  #if work-rows.len() > 0 [
    == Work Experience
    #for w in work-rows [
      #main-entry(w, linked([#f(w, "company")], f(w, "url")))
    ]
  ]

  #let education-rows = rows("education")
  #if education-rows.len() > 0 [
    == Education
    #for e in education-rows [
      #main-entry(e, linked([#f(e, "institution")], f(e, "url")))
    ]
  ]

  #let project-rows = rows("projects")
  #if project-rows.len() > 0 [
    == Projects
    #for p in project-rows [
      #main-entry(p, linked([#f(p, "url")], f(p, "url")))
    ]
  ]

  #let cert-rows = rows("certificates")
  #if cert-rows.len() > 0 [
    == Certifications
    #for c in cert-rows [
      #make-main-content-block-with-timeline(
        [#f(c, "date")],
        f(c, "title"),
        [],
        supplement: [#f(c, "issuer")],
        title-as-heading: true,
        timeline-line-gap: 0pt,
        theme: theme,
      )
    ]
  ]
]

// ---- Aside column ----
#let contact-rows = rows("contact")
#let social-rows = rows("social")
#let language-rows = rows("languages")
#let skill-rows = rows("skills")

#let aside-content = [
  #make-aside-persona(
    f(data, "name"),
    short-description: f(data, "role"),
    theme: theme,
  )

  #if contact-rows.len() > 0 [
    == Contact
    #make-aside-grid(
      columns: 2,
      theme: theme,
      ..contact-rows.map(c => (
        text(f(c, "label") + ":", weight: "semibold"),
        linked([#f(c, "text")], f(c, "url")),
      )).flatten()
    )
  ]

  #if social-rows.len() > 0 [
    == Social Network
    #make-aside-grid(
      columns: 2,
      theme: theme,
      ..social-rows.map(s => (
        text(f(s, "label") + ":", weight: "semibold"),
        linked([#f(s, "text")], f(s, "url")),
      )).flatten()
    )
  ]

  #if language-rows.len() > 0 [
    == Languages
    #make-aside-grid(
      columns: 1,
      align: (left + horizon,),
      theme: theme,
      ..language-rows.map(l => [#l])
    )
  ]

  #if skill-rows.len() > 0 [
    == Skills
    #make-aside-grid(
      columns: 1,
      align: (left + horizon,),
      theme: theme,
      ..skill-rows.map(s => [#s])
    )
  ]
]

#cv(
  theme: theme,
  paper: "a4",
  pages-content: (
    ("left": aside-content, "main": main-content),
  ),
)
