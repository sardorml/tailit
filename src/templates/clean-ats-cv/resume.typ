// Wraps @preview/clean-ats-cv. Markup-driven: a `conf.with(details: ...)` show
// rule renders the contact header, then `=`/`==` headings plus `date` /
// `date-location` helpers lay out each entry. We generate that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/clean-ats-cv:0.1.0": conf, date, date-location

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the contact `details` dict, keeping only non-empty keys (the package
// treats any present key as renderable, so empty strings would emit blank links).
#let src-details = data.at("details", default: (:))
#let details = (name: f(src-details, "name"))
#for key in ("address", "email", "phonenumber", "linkedin", "linkedin-label", "github", "github-label", "twitter", "twitter-label") {
  let v = src-details.at(key, default: "")
  if v != "" { details.insert(key, v) }
}

#show: conf.with(
  details: details,
  primary-color: rgb("#022359"),
  secondary-color: rgb("#757575"),
  link-color: rgb("#14A4E6"),
)

#let label = f(data, "label")
#if label != "" [
  #align(center, text(size: 11pt, fill: rgb("#757575"), label))
]

#let summary = f(data, "summary")
#if summary != "" [
  = Summary
  #summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Professional Experience
  #for w in work-rows [
    #let head = if f(w, "company") != "" { f(w, "title") + ", " + f(w, "company") } else { f(w, "title") }
    #if f(w, "location") != "" [
      == #head #date-location([], [#f(w, "dates")], [#f(w, "location")])
    ] else [
      == #head #date([], [#f(w, "dates")])
    ]
    #for h in w.at("highlights", default: ()) [- #h]
  ]
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education [
    #let head = if f(e, "degree") != "" { f(e, "institution") + " — " + f(e, "degree") } else { f(e, "institution") }
    == #head #date([], [#f(e, "dates")])
    #for h in e.at("highlights", default: ()) [- #h]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #let head = if f(p, "url") != "" { f(p, "name") + " (" + f(p, "url") + ")" } else { f(p, "name") }
    == #head #date([], [#f(p, "dates")])
    #for h in p.at("highlights", default: ()) [- #h]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    #let line = (f(c, "name"), f(c, "issuer"), f(c, "date")).filter(x => x != "").join(" — ")
    - #line
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [- #l]
]
