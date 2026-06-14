// Wraps @preview/rendercv. The package is markup-driven: a `rendercv.with`
// show rule plus `= Name`, `#connections(...)`, `== Section` headings and
// `#regular-entry` / `#education-entry` / `#summary` per-item functions. The
// package's `group-sections` logic scans the document's TOP-LEVEL children for
// `== headings`, so every heading below is emitted at the document top level
// (not nested inside an `#if [...]` content block). We generate this markup
// from the injected JSON (shaped by ./adapter.ts).
#import "@preview/rendercv:0.3.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: rendercv.with(
  name: f(data, "name"),
  page-size: "us-letter",
  page-show-footer: false,
  page-show-top-note: false,
  colors-name: rgb(0, 79, 144),
  colors-headline: rgb(0, 79, 144),
  colors-connections: rgb(60, 60, 60),
  colors-section-titles: rgb(0, 79, 144),
  colors-links: rgb(0, 79, 144),
  typography-font-family-body: "Source Sans 3",
  typography-font-family-name: "Source Sans 3",
  typography-font-family-headline: "Source Sans 3",
  typography-font-family-connections: "Source Sans 3",
  typography-font-family-section-titles: "Source Sans 3",
  typography-bold-name: true,
  typography-bold-section-titles: true,
  header-alignment: center,
  header-connections-show-icons: false,
  section-titles-type: "with_partial_line",
)

= #f(data, "name")

#if f(data, "headline") != "" {
  headline[#data.headline]
}

#let conns = rows("connections")
#if conns.len() > 0 {
  connections(
    ..conns.map(c => {
      let href = c.at("href", default: "")
      let txt = c.at("text", default: "")
      if href != "" {
        link(href, icon: false, if-underline: false, if-color: false)[#txt]
      } else {
        [#txt]
      }
    })
  )
}

// ----- Summary -----
#if f(data, "summary") != "" [
  == Summary
]
#if f(data, "summary") != "" [
  #data.summary
]

// ----- Experience -----
#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Experience
]
#for w in work-rows {
  regular-entry(
    [
      #strong[#f(w, "company")]#if f(w, "title") != "" [, #f(w, "title")]
      #for h in w.at("highlights", default: ()) [

        - #h
      ]
    ],
    [
      #if f(w, "location") != "" [#f(w, "location")

      ]
      #f(w, "dates")
    ],
  )
}

// ----- Education -----
#let education = rows("education")
#if education.len() > 0 [
  == Education
]
#for e in education {
  education-entry(
    [
      #strong[#f(e, "institution")]#if f(e, "area") != "" [, #f(e, "area")]
      #for h in e.at("highlights", default: ()) [

        - #h
      ]
    ],
    [
      #if f(e, "location") != "" [#f(e, "location")

      ]
      #f(e, "dates")
    ],
    degree-column: if f(e, "degree") != "" { strong(f(e, "degree")) } else { none },
  )
}

// ----- Projects -----
#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
]
#for p in project-rows {
  regular-entry(
    [
      #if f(p, "url") != "" [
        #strong[#link(f(p, "url"))[#f(p, "name")]]
      ] else [
        #strong[#f(p, "name")]
      ]
      #if f(p, "summary") != "" [
        #summary[#f(p, "summary")]
      ]
      #for h in p.at("highlights", default: ()) [

        - #h
      ]
    ],
    [#f(p, "dates")],
  )
}

// ----- Skills -----
#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
]
#for s in skill-rows [
  #if f(s, "label") != "" [#strong[#s.label:] #f(s, "items")] else [#f(s, "items")]
]

// ----- Certifications -----
#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
]
#for c in cert-rows {
  regular-entry(
    [
      #strong[#f(c, "name")]#if f(c, "issuer") != "" [ -- #f(c, "issuer")]
    ],
    [#f(c, "date")],
  )
}

// ----- Languages -----
#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
]
#for l in lang-rows [
  - #l
]
