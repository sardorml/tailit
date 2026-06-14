// Wraps @preview/neat-cv. Markup-driven: a `cv.with(author: ...)` show rule
// plus a two-column `cv-with-side[sidebar][body]` layout built from `= Section`
// headings and `#entry(...)` calls. We generate that markup from the injected
// JSON (shaped by ./adapter.ts). No profile picture (it is optional).
#import "@preview/neat-cv:1.1.0": (
  contact-info, cv, cv-with-side, entry, item-pills, social-links,
)

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#set text(lang: "en")

#show: cv.with(
  author: data.author,
  accent-color: rgb("#4682b4"),
  header-color: rgb("#35414d"),
)

// Reusable entry renderer: title/date/institution/location + bullet highlights.
#let render-entry(e) = {
  let hl = e.at("highlights", default: ())
  let score = e.at("score", default: "")
  entry(
    title: f(e, "title"),
    date: f(e, "date"),
    institution: f(e, "institution"),
    location: f(e, "location"),
  )[
    #if score != "" [#emph(score)]
    #if hl.len() > 0 [
      #for h in hl [- #h]
    ]
  ]
}

#cv-with-side[
  // ---- Sidebar ----
  #if f(data, "summary") != "" [
    = About
    #data.summary
  ]

  = Contact
  #contact-info()

  #v(1fr)
  #social-links()

  #let skill-rows = rows("skills")
  #if skill-rows.len() > 0 [
    #colbreak()
    = Skills
    #for s in skill-rows [
      #if f(s, "label") != "" [
        #text(weight: "medium")[#s.label]
        #v(-0.3em)
      ]
      #item-pills(s.at("items", default: ()))
      #v(0.4em)
    ]
  ]

  #let lang-rows = rows("languages")
  #if lang-rows.len() > 0 [
    = Languages
    #item-pills(lang-rows)
  ]
][
  // ---- Main body ----
  #let work-rows = rows("work")
  #if work-rows.len() > 0 [
    = Experience
    #for w in work-rows [#render-entry(w)]
  ]

  #let edu-rows = rows("education")
  #if edu-rows.len() > 0 [
    = Education
    #for e in edu-rows [#render-entry(e)]
  ]

  #let project-rows = rows("projects")
  #if project-rows.len() > 0 [
    = Projects
    #for p in project-rows [#render-entry(p)]
  ]

  #let cert-rows = rows("certificates")
  #if cert-rows.len() > 0 [
    = Certifications
    #for c in cert-rows [#render-entry(c)]
  ]
]
