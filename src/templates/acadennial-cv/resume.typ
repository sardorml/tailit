// Wraps @preview/acadennial-cv. The package is markup-driven: a `resume.with`
// show rule plus `== Section` headings and `*-item-list` helper functions
// using a 3-column grid (c1 dates/label, c2 title, c3 location). We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/acadennial-cv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Default column configuration, bound to every helper (per the package usage).
#let col-cfg = (
  c1-len: 15%,
  c2-len: 1fr,
  c3-len: auto,
  col-gutter: 1em,
)
#let employment-head-item-list = employment-head-item-list.with(..col-cfg)
#let meta-entry-item-list = meta-entry-item-list.with(..col-cfg)

// Build the header secondary-info: contact details + linked icons.
#let contact-lines = {
  let lines = ()
  if f(data, "email") != "" {
    lines.push(link("mailto:" + data.email)[#data.email])
  }
  if f(data, "phone") != "" {
    lines.push(data.phone)
  }
  if f(data, "site") != "" {
    lines.push(link(data.at("siteUrl", default: data.site))[#data.site])
  }
  let icons = ()
  if f(data, "linkedin") != "" { icons.push(link(data.linkedin)[#linkedin-icon()]) }
  if f(data, "x") != "" { icons.push(link(data.x)[#x-icon()]) }
  if f(data, "scholar") != "" { icons.push(link(data.scholar)[#google-scholar-icon()]) }
  if f(data, "github") != "" { icons.push(link(data.github)[#github-icon()]) }
  if f(data, "orcid") != "" { icons.push(link(data.orcid)[#orcid-icon()]) }
  if icons.len() > 0 { lines.push(icons.join(h(0.4em))) }
  lines.join([ \ ])
}

#let primary-lines = data.at("primaryInfo", default: ())

#show: resume.with(
  col-args: (
    c1-len: col-cfg.c1-len,
    c2-len: col-cfg.c2-len,
    col-gutter: col-cfg.col-gutter,
  ),
  author-info: (
    name: f(data, "name"),
    primary-info: primary-lines.join([ \ ]),
    secondary-info: contact-lines,
  ),
)

#if f(data, "summary") != "" [
  == Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Experience
  #meta-entry-item-list(
    ..work-rows.map(w => (
      c1: f(w, "dates"),
      c2: f(w, "title"),
      c3: f(w, "company"),
      body: {
        let hs = w.at("highlights", default: ())
        if hs.len() > 0 { list(..hs.map(h => [#h])) }
      },
    ))
  )
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  == Education
  #employment-head-item-list(
    ..edu-rows.map(e => (
      c2: f(e, "institution"),
      c3: f(e, "location"),
      body: [#f(e, "body")],
    ))
  )
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #meta-entry-item-list(
    ..project-rows.map(p => (
      c1: f(p, "dates"),
      c2: f(p, "name"),
      c3: f(p, "url"),
      body: {
        let hs = p.at("highlights", default: ())
        if hs.len() > 0 { list(..hs.map(h => [#h])) }
      },
    ))
  )
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #meta-entry-item-list(
    c2-text-args: (weight: "regular"),
    item-spacing: 0.6em,
    ..skill-rows.map(s => (
      c1: f(s, "label"),
      c2: s.at("items", default: ()).join(", "),
    ))
  )
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #meta-entry-item-list(
    c2-text-args: (weight: "regular"),
    item-spacing: 0.6em,
    ..cert-rows.map(c => (
      c1: f(c, "date"),
      c2: f(c, "name"),
      c3: f(c, "issuer"),
    ))
  )
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #lang-rows.join(", ")
]
