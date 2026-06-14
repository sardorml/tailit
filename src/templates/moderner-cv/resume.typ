// Wraps @preview/moderner-cv. Markup-driven: a `moderner-cv` show rule plus
// `= Section` headings and the package's cv-entry / cv-double-item / cv-line
// helpers. We generate that markup from the injected JSON (shaped by adapter.ts).
#import "@preview/moderner-cv:0.2.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the social dict, dropping empty values.
#let social = (:)
#if f(data, "phone") != "" { social.insert("phone", data.phone) }
#if f(data, "email") != "" { social.insert("email", data.email) }
#if f(data, "github") != "" { social.insert("github", data.github) }
#if f(data, "linkedin") != "" { social.insert("linkedin", data.linkedin) }
#if f(data, "websiteUrl") != "" and f(data, "websiteLabel") != "" {
  social.insert("website", ("link", data.websiteUrl, data.websiteLabel))
}
#if f(data, "address") != "" { social.insert("address", data.address) }

#show: moderner-cv.with(
  name: f(data, "name"),
  subtitle: f(data, "subtitle"),
  social: social,
  color: rgb("#3973AF"),
  lang: "en",
  font: "New Computer Modern",
)

#if f(data, "summary") != "" [
  = Summary
  #cv-line[][#data.summary]
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows [
    #cv-entry-multiline(
      date: f(w, "date"),
      title: f(w, "title"),
      employer: f(w, "employer"),
      [
        #if f(w, "summary") != "" [#text(style: "italic")[#w.summary]]
        #for h in w.at("highlights", default: ()) [
          - #h
        ]
      ],
    )
  ]
]

#let education = rows("education")
#if education.len() > 0 [
  = Education
  #for e in education [
    #cv-entry(
      date: f(e, "date"),
      title: f(e, "title"),
      employer: f(e, "employer"),
    )[#f(e, "detail")]
    #for h in e.at("highlights", default: ()) [
      #cv-list-item[#h]
    ]
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows [
    #cv-entry-multiline(
      date: f(p, "date"),
      title: f(p, "title"),
      employer: f(p, "employer"),
      [
        #if f(p, "summary") != "" [#text(style: "italic")[#p.summary]]
        #for h in p.at("highlights", default: ()) [
          - #h
        ]
      ],
    )
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills
  #for s in skill-rows [
    #cv-line[#f(s, "label")][#f(s, "items")]
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications
  #for c in cert-rows [
    #cv-entry(
      date: f(c, "date"),
      title: f(c, "title"),
      employer: f(c, "employer"),
    )
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages
  #for l in lang-rows [
    #cv-line[#l][]
  ]
]
