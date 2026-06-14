// Wraps @preview/vercanard, a colorful two-column CV template. It is
// markup-driven: a `resume.with` show rule (name/title/accent-color/margin/
// aside) plus `= Section` headings and an `entry(title, body, details)`
// function. We build the aside and body from the injected JSON (./adapter.ts).
#import "@preview/vercanard:1.0.3": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let contact = rows("contact")
#let languages = rows("languages")
#let skills = rows("skills")
#let certificates = rows("certificates")

#show: resume.with(
  name: f(data, "name"),
  title: f(data, "title"),
  accent-color: rgb("4a7ba6"),
  margin: 2.4cm,
  aside: [
    #if contact.len() > 0 [
      = Contact
      #for c in contact [- #c]
    ]
    #if skills.len() > 0 [
      = Skills
      #for s in skills [- #s]
    ]
    #if languages.len() > 0 [
      = Languages
      #for l in languages [- #l]
    ]
    #if certificates.len() > 0 [
      = Certifications
      #for c in certificates [- #c]
    ]
  ],
)

// vercanard lays the body in a 2fr grid column with `right: 0pt` inset, so text
// runs flush under the absolutely-positioned right sidebar background. This
// body-only show rule (applied after `resume`, so it wraps only the main
// content, not the `aside`) pads the right edge to keep a gap from the sidebar.
#show: it => pad(right: 1.5em, it)

#if f(data, "summary") != "" [
  = Summary
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Experience
  #for w in work-rows {
    let head = (f(w, "title"), f(w, "company")).filter(x => x != "").join(", ")
    entry(
      head,
      [
        #if f(w, "location") != "" [#emph(w.location) \ ]
        #for h in w.at("highlights", default: ()) [- #h]
      ],
      f(w, "dates"),
    )
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects
  #for p in project-rows {
    entry(
      f(p, "name"),
      [
        #if f(p, "url") != "" [#emph(p.url) \ ]
        #for h in p.at("highlights", default: ()) [- #h]
      ],
      f(p, "dates"),
    )
  }
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  = Education
  #for e in education-rows {
    entry(
      f(e, "institution"),
      [
        #if f(e, "degree") != "" [#e.degree \ ]
        #for h in e.at("highlights", default: ()) [- #h]
      ],
      f(e, "dates"),
    )
  }
]
