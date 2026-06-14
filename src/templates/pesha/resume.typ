// Wraps @preview/pesha. Markup-driven: a `pesha.with(...)` show rule plus
// `=== Section` headings and `#experience(place, title, location, time)[..]`
// blocks. We generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/pesha:0.4.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let contacts = rows("contacts").map(c => [#c])

#show: pesha.with(
  name: f(data, "name"),
  address: f(data, "address"),
  contacts: contacts,
  footer-text: [#f(data, "name") --- Page#sym.space],
)

// One experience-style block: place + time, optional title/location, then bullets.
#let entry(item) = {
  let title = f(item, "title")
  let location = f(item, "location")
  experience(
    place: f(item, "place"),
    title: if title != "" { title } else { none },
    location: if location != "" { location } else { none },
    time: f(item, "time"),
  )[
    #for h in item.at("highlights", default: ()) [- #h]
  ]
}

#if f(data, "summary") != "" [
  === Summary
  #f(data, "summary")
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  === Experience
  #for w in work-rows { entry(w) }
]

#let education = rows("education")
#if education.len() > 0 [
  === Education
  #for e in education { entry(e) }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  === Projects
  #for p in project-rows { entry(p) }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  === Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  === Certifications
  #for c in cert-rows [
    - *#f(c, "name")*#if f(c, "issuer") != "" [ --- #f(c, "issuer")]#if f(c, "date") != "" [ (#f(c, "date"))]
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  === Languages
  #for l in lang-rows [- #l]
]
