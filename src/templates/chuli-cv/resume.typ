// Wraps @preview/chuli-cv. Markup-driven: a `cv` show rule plus #header,
// #section, #entry, #education-entry, #skill and #language calls. We generate
// that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/chuli-cv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: cv

// Map an adapter icon key -> a short accent-colored label. (We avoid the
// fontawesome package: its 0.1.0 API relies on the deprecated `locate`/state
// selector form and the icon fonts are not installed in this environment.)
#let icon-for(key) = {
  let lbl = if key == "phone" { "Tel" }
    else if key == "mail" { "Email" }
    else if key == "github" { "GitHub" }
    else if key == "linkedin" { "LinkedIn" }
    else if key == "homepage" { "Web" }
    else { "Link" }
  text(weight: "bold", fill: colors.accent, lbl + ":")
}

#let socials = rows("socials").map(s => (
  icon: icon-for(f(s, "icon")),
  text: f(s, "text"),
  link: f(s, "link"),
))

#header(
  full-name: f(data, "name"),
  job-title: f(data, "jobTitle"),
  socials: socials,
  profile-picture: none,
)

#if f(data, "summary") != "" [
  #section("Summary")
  #v(3pt)
  #data.summary
]

// Date · location meta line. We render it ourselves (with the package's own
// style helpers) instead of passing date/location into `entry`/`education-entry`,
// because those package functions route the meta line through fontawesome
// 0.1.0, whose deprecated `locate`/state API does not compile on this Typst.
#let meta-line(date, location) = {
  let parts = (date, location).filter(p => p != "")
  if parts.len() > 0 {
    v(2pt)
    italic-text-style(parts.join("  ·  "))
  }
}

#let entry-from(item) = {
  entry(
    title: f(item, "title"),
    company-or-university: f(item, "company"),
    date: "",
    location: "",
    logo: [],
    description: {
      meta-line(f(item, "date"), f(item, "location"))
      let hs = item.at("highlights", default: ())
      if hs.len() > 0 { list(..hs.map(h => [#h])) }
    },
  )
}

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section("Experience")
  #for w in work-rows [ #entry-from(w) ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section("Personal Projects")
  #for p in project-rows [ #entry-from(p) ]
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  #section("Education")
  #for e in edu-rows [
    #let score = f(e, "gpa")
    #entry(
      title: f(e, "title"),
      company-or-university: f(e, "institution"),
      date: "",
      location: "",
      logo: [],
      description: {
        meta-line(f(e, "date"), f(e, "location"))
        if score != "" {
          v(2pt)
          accent-subtopic-style(score)
        }
      },
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section("Skills")
  #v(6pt)
  #skill(skills: skill-rows)
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section("Languages")
  #v(3pt)
  #for l in lang-rows [
    #language(
      name: f(l, "name"),
      label: f(l, "label"),
      nivel: l.at("level", default: 3),
    )
  ]
]
