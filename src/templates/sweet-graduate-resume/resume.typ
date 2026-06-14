// Wraps @preview/sweet-graduate-resume. The package is markup-driven: a
// `preamble` show rule, a `header`, `section-header` headings, and the
// `education` / `points` / `dual` / `dated-section` item helpers. We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/sweet-graduate-resume:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: doc => preamble(doc)

// Header links. We avoid the package's bundled SVGs (not shipped here) by
// rendering each link's label as plain text with no icon glyph.
#let header-urls = rows("urls").map(u => (
  name: f(u, "name"),
  url: f(u, "url"),
  svg: "",
  fa: false,
  brand: false,
  solid: false,
))

#header(f(data, "name"), f(data, "roll"), f(data, "school"), header-urls)

#if f(data, "summary") != "" [
  #section-header("Summary")
  #data.summary
]

#let edu = rows("education")
#if edu.len() > 0 [
  #section-header("Education")
  #education(edu.map(e => (
    prog: f(e, "prog"),
    school: f(e, "school"),
    grade: f(e, "grade"),
  )))
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section-header("Professional Experience")
  #for w in work-rows {
    dated-section(
      f(w, "title"),
      f(w, "subtitle"),
      date-start: if f(w, "start") != "" { f(w, "start") } else { none },
      date-end: if f(w, "end") != "" { f(w, "end") } else { none },
      ongoing: w.at("ongoing", default: false),
      points: w.at("points", default: ()).map(p => [#p]),
    )
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section-header("Projects")
  #for p in project-rows {
    dated-section(
      f(p, "title"),
      f(p, "subtitle"),
      date-start: if f(p, "start") != "" { f(p, "start") } else { none },
      date-end: if f(p, "end") != "" { f(p, "end") } else { none },
      ongoing: p.at("ongoing", default: false),
      points: p.at("points", default: ()).map(x => [#x]),
    )
  }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section-header("Technical Skills")
  #points(skill-rows.map(s => [#s]))
]

#let course-rows = rows("courses")
#if course-rows.len() > 0 [
  #section-header("Relevant Coursework")
  #dual(course-rows.map(c => [#c]))
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section-header("Certifications")
  #points(cert-rows.map(c => [#c]))
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section-header("Languages")
  #points(lang-rows.map(l => [#l]))
]
