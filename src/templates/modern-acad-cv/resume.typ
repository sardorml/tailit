// Wraps @preview/modern-acad-cv. This is a data-driven academic-CV package:
// `modern-acad-cv(metadata, multilingual, ...)` takes a metadata dict (colors +
// personal name/socials) and a multilingual dict (header labels per language),
// then renders a header + footer. The body is built with the package's column
// helpers (`cv-cols`, `cv-entry`). We construct metadata/multilingual in
// adapter.ts and drive every section from the injected JSON.
#import "@preview/modern-acad-cv:0.1.5": modern-acad-cv, cv-cols, cv-cols-table

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
#let labels = data.labels

// One CV item: a date in the left column, then bold title + emphasised
// subtitle + location, with optional highlight bullets underneath.
#let item(e) = {
  let head = ()
  if f(e, "title") != "" { head.push(strong(f(e, "title"))) }
  if f(e, "subtitle") != "" { head.push(emph(f(e, "subtitle"))) }
  if f(e, "location") != "" { head.push(f(e, "location")) }
  let bullets = e.at("highlights", default: ())
  // cv-cols wraps the right column in par() which swallows block-level lists,
  // so use cv-cols-table (plain left-align) whenever there are bullets.
  if bullets.len() > 0 {
    cv-cols-table(
      f(e, "left"),
      [
        #head.join(", ")
        #list(..bullets.map(h => [#h]))
      ],
    )
  } else {
    cv-cols(f(e, "left"), head.join(", "))
  }
}

#show: modern-acad-cv.with(
  data.metadata,
  data.multilingual,
  lang: "en",
  font: ("Fira Sans", "Roboto", "Helvetica Neue", "Arial"),
  show-date: false,
)

#if f(data, "summary") != "" [
  = #labels.summary
  #cv-cols("", data.summary)
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = #labels.work
  #for w in work-rows { item(w) }
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  = #labels.education
  #for e in education-rows { item(e) }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = #labels.projects
  #for p in project-rows { item(p) }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = #labels.skills
  #for s in skill-rows {
    cv-cols(
      strong(f(s, "category")),
      s.at("items", default: ()).join(", "),
    )
  }
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = #labels.certificates
  #for c in cert-rows { item(c) }
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = #labels.languages
  #for l in lang-rows {
    cv-cols(f(l, "level"), strong(f(l, "name")))
  }
]
