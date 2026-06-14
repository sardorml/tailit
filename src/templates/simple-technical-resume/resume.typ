// Wraps @preview/simple-technical-resume. Markup-driven: a `resume.with` show
// rule plus #custom-title sections and #work-heading / #education-heading /
// #project-heading / #skills calls. We generate that markup from the injected
// JSON (shaped by ./adapter.ts). Dates arrive as {year,month,day} triples and
// are rebuilt into the `datetime` values the package requires.
#import "@preview/simple-technical-resume:0.1.1": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build a `datetime` from a {year, month, day} dict.
#let dt(parts) = datetime(
  year: parts.at("year", default: 1970),
  month: parts.at("month", default: 1),
  day: parts.at("day", default: 1),
)
// End is either a parts-dict (datetime) or none -> "Present".
#let end-of(item) = {
  let e = item.at("end", default: none)
  if e == none { "Present" } else { dt(e) }
}

#show: resume.with(
  top-margin: 0.45in,
  personal-info-font-size: 9.2pt,
  author-position: center,
  personal-info-position: center,
  author-name: f(data, "name"),
  phone: f(data, "phone"),
  location: f(data, "location"),
  email: f(data, "email"),
  website: f(data, "website"),
  linkedin-user-id: f(data, "linkedin"),
  github-username: f(data, "github"),
)

#let education = rows("education")
#if education.len() > 0 {
  custom-title("Education")[
    #for e in education {
      education-heading(
        f(e, "institution"),
        f(e, "location"),
        f(e, "degree"),
        f(e, "major"),
        dt(e.at("start")),
        end-of(e),
      )[
        #for h in e.at("highlights", default: ()) [- #h]
      ]
    }
  ]
}

#let work-rows = rows("work")
#if work-rows.len() > 0 {
  custom-title("Experience")[
    #for w in work-rows {
      work-heading(
        f(w, "title"),
        f(w, "company"),
        f(w, "location"),
        dt(w.at("start")),
        end-of(w),
      )[
        #for h in w.at("highlights", default: ()) [- #h]
      ]
    }
  ]
}

#let project-rows = rows("projects")
#if project-rows.len() > 0 {
  custom-title("Projects")[
    #for p in project-rows {
      project-heading(
        f(p, "name"),
        stack: f(p, "stack"),
        project-url: f(p, "url"),
      )[
        #for h in p.at("highlights", default: ()) [- #h]
      ]
    }
  ]
}

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 {
  custom-title("Skills")[
    #skills()[
      #for s in skill-rows [
        - #if f(s, "label") != "" [*#s.label:* ]#f(s, "items")
      ]
    ]
  ]
}
