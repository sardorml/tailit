// Wraps @preview/pro-academic-cv. The package is markup-driven: a `resume.with`
// show rule that takes an `author-info` dict of content rows, plus `== Section`
// headings rendered with `r2c2-entry-list`, `single-line-entry`,
// `multi-line-list`, and `multi-line-text`. We build that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/pro-academic-cv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// --- Header contact rows -------------------------------------------------
// primary-info: phone | email | website
#let primary = {
  let parts = ()
  if f(data, "phone") != "" { parts.push(data.phone) }
  if f(data, "email") != "" {
    parts.push(link("mailto:" + data.email)[#data.email])
  }
  if f(data, "site") != "" {
    let url = f(data, "siteUrl")
    if url == "" { url = "https://" + data.site }
    parts.push(link(url)[#data.site])
  }
  parts.join("  |  ")
}

// secondary-info: linkable profile handles (linkedin | github | ...)
#let secondary = {
  let profs = rows("profiles")
  let parts = profs.map(p => link(f(p, "url"))[#f(p, "label")])
  if parts.len() > 0 { parts.join("  |  ") } else { none }
}

// tertiary-info: target role + location
#let tertiary = {
  let parts = ()
  if f(data, "label") != "" { parts.push(data.label) }
  if f(data, "location") != "" { parts.push(data.location) }
  if parts.len() > 0 { parts.join("  ·  ") } else { none }
}

#show: resume.with(
  author-info: (
    name: f(data, "name"),
    primary-info: primary,
    secondary-info: if secondary == none { [] } else { secondary },
    tertiary-info: if tertiary == none { [] } else { tertiary },
  ),
  author-position: center,
)

#if f(data, "summary") != "" [
  == Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Experience
  #r2c2-entry-list(
    ..work-rows.map(w => (
      entry-header-args: (
        top-left: if f(w, "companyUrl") != "" { link(w.companyUrl)[#f(w, "company")] } else { [#f(w, "company")] },
        top-right: [#f(w, "dates")],
        bottom-left: [#f(w, "title")],
        bottom-right: [#f(w, "location")],
      ),
      list-items: w.at("highlights", default: ()).map(h => [#h]),
    )),
  )
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  == Education
  #r2c2-entry-list(
    ..edu-rows.map(e => (
      entry-header-args: (
        top-left: if f(e, "institutionUrl") != "" { link(e.institutionUrl)[#f(e, "institution")] } else { [#f(e, "institution")] },
        top-right: [#f(e, "dates")],
        bottom-left: [#f(e, "degree")],
        bottom-right: [#f(e, "location")],
      ),
      list-items: e.at("highlights", default: ()).map(h => [#h]),
    )),
  )
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #r2c2-entry-list(
    ..project-rows.map(p => (
      entry-header-args: (
        top-left: [#f(p, "name")],
        top-right: [#f(p, "dates")],
        bottom-left: if p.at("tools", default: ()).len() > 0 { [Tools: #p.tools.join(", ")] } else { [] },
        bottom-right: if f(p, "url") != "" { link(p.url)[#f(p, "urlLabel")] } else { [] },
      ),
      list-items: p.at("highlights", default: ()).map(h => [#h]),
    )),
  )
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #multi-line-list(
    ..skill-rows.map(s => single-line-entry([#f(s, "label")], [#f(s, "items")], [])),
  )
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #multi-line-list(
    ..cert-rows.map(c => single-line-entry([#f(c, "name")], [], [#f(c, "date")])),
  )
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #multi-line-text(
    ..lang-rows.map(l => [#l]),
  )
]
