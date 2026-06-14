// Wraps @preview/resume-ng. Markup-driven: a `project.with` show rule sets the
// header (name + centered contact line), then `#resume-section` headings with
// `#resume-education` / `#resume-work` / `#resume-project` item functions.
// We generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/resume-ng:1.0.0": project, resume-section, resume-education, resume-work, resume-project

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the centered contact line as proper links where we have a URL.
#let contact-items = rows("contacts").map(c => {
  let txt = f(c, "text")
  let url = f(c, "url")
  if url != "" { link(url, txt) } else { txt }
})

#show: project.with(
  title: "Resume",
  author: (name: f(data, "name")),
  contacts: contact-items,
)

// The package's show rule sets a CJK font + lang: zh. Neutralize to English so
// we don't depend on a CJK font and so hyphenation/justification behave.
#set text(lang: "en")

#if f(data, "label") != "" {
  align(center)[#text(size: 11pt, fill: rgb("#2b6cb0"), weight: 600, data.label)]
  v(2pt)
}

#if f(data, "summary") != "" [
  #resume-section("Summary")
  #data.summary
]

#let education = rows("education")
#if education.len() > 0 [
  #resume-section("Education")
  #for e in education [
    #resume-education(
      university: f(e, "university"),
      degree: f(e, "degree"),
      school: f(e, "school"),
      start: f(e, "dates"),
      end: "",
    )[
      #for h in e.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #resume-section("Skills")
  #for s in skill-rows [
    - #if f(s, "label") != "" [*#s.label*: ]#s.at("items", default: ()).join(", ")
  ]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #resume-section("Work Experience")
  #for w in work-rows [
    #resume-work(
      company: f(w, "company"),
      duty: f(w, "duty"),
      start: f(w, "dates"),
      end: "",
    )[
      #for h in w.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #resume-section("Projects")
  #for p in project-rows [
    #resume-project(
      title: f(p, "title"),
      duty: f(p, "duty"),
      start: f(p, "dates"),
      end: "",
    )[
      #for h in p.at("highlights", default: ()) [- #h]
    ]
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #resume-section("Certifications")
  #for c in cert-rows [
    - #f(c, "text")#if f(c, "date") != "" [ (#c.date)]
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #resume-section("Languages")
  #for l in lang-rows [- #l]
]
