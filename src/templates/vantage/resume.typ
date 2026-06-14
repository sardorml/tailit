// Entry point compiled by src/lib/typst/compile.ts.
// The resume is injected as a JSON string via `--input resume=...` (sys.inputs)
// and shaped by src/templates/vantage/adapter.ts. All formatting (dates, contacts)
// is done in TypeScript; this file only lays the data out.
//
// NB: never wrap a bare expression in emphasis underscores (`_#x.y_`) — Typst
// identifiers may contain `_`, so the closing delimiter gets eaten. Use
// `#emph(...)` instead.
#import "vantage-typst.typ": vantage, term, skill, styled-link

#let data = json(bytes(sys.inputs.resume))

#let field(d, key) = d.at(key, default: "")
#let rows(key) = if key in data and type(data.at(key)) == array { data.at(key) } else { () }

#vantage(
  name: field(data, "name"),
  position: field(data, "position"),
  links: rows("links"),
  tagline: [#field(data, "tagline")],
  // ---- Left column: experience + projects ----
  {
    let experience = rows("experience")
    if experience.len() > 0 [
      == Experience
      #for job in experience [
        === #field(job, "position") \
        #if field(job, "company") != "" [
          #if field(job, "companyLink") != "" [
            #emph(link(job.companyLink)[#job.company])
          ] else [
            #emph(job.company)
          ]
          \
        ]
        #if field(job, "dates") != "" or field(job, "location") != "" [
          #term[#field(job, "dates")][#field(job, "location")]
        ]
        #if field(job, "summary") != "" [

          #job.summary
        ]
        #for point in job.at("highlights", default: ()) [
          - #point
        ]
      ]
    ]

    let projects = rows("projects")
    if projects.len() > 0 [
      == Projects
      #for p in projects [
        === #if field(p, "link") != "" [
          #styled-link(p.link)[#field(p, "name")]
        ] else [
          #field(p, "name")
        ] #if field(p, "dates") != "" [#h(1fr) #text(9pt, p.dates)]
        #if field(p, "description") != "" [\
          #p.description
        ]
        #for point in p.at("highlights", default: ()) [
          - #point
        ]
      ]
    ]
  },
  // ---- Right column: education, skills, languages, certifications ----
  {
    let education = rows("education")
    if education.len() > 0 [
      == Education
      #for edu in education [
        === #if field(edu, "link") != "" [
          #link(edu.link)[#field(edu, "institution")]
        ] else [
          #field(edu, "institution")
        ]
        #if field(edu, "dates") != "" or field(edu, "location") != "" [\
          #field(edu, "dates") #h(1fr) #field(edu, "location")
        ]
        #if field(edu, "degree") != "" [\
          #edu.degree
        ]

      ]
    ]

    let skills = rows("skills")
    if skills.len() > 0 [
      == Skills
      #for s in skills [
        • #s \
      ]
    ]

    let languages = rows("languages")
    if languages.len() > 0 [
      == Languages
      #for l in languages [
        • #l \
      ]
    ]

    let certificates = rows("certificates")
    if certificates.len() > 0 [
      == Certifications
      #for c in certificates [
        === #field(c, "name")
        #if field(c, "description") != "" [\
          #text(9pt, c.description)
        ]

      ]
    ]
  },
)
