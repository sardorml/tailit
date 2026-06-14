// Wraps @preview/typographic-resume. Markup-driven: `resume.with` show rule
// with an aside column (contact / skills / languages) and a main column
// (work + education), built via #for loops over the injected JSON
// (shaped by ./adapter.ts).
#import "@preview/typographic-resume:0.2.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(d, k) = if k in d and type(d.at(k)) == array { d.at(k) } else { () }

#let contact = data.at("contact", default: (:))
#let skills = rows(data, "skills")
#let langs = rows(data, "languages")
#let projects = rows(data, "projects")
#let work = rows(data, "work")
#let education = rows(data, "education")

#show: resume.with(
  first-name: f(data, "firstName"),
  last-name: f(data, "lastName"),
  profession: f(data, "profession"),
  bio: [#f(data, "bio")],
  aside: {
    section(
      "Contact",
      {
        set image(width: 8pt)
        let sep = line(stroke: 0.1pt, length: 100%)
        let entries = ()
        if f(contact, "phone") != "" {
          entries.push(contact-entry(
            phone-icon,
            link("tel:" + f(contact, "phone"), f(contact, "phone")),
          ))
        }
        if f(contact, "email") != "" {
          entries.push(contact-entry(
            email-icon,
            link("mailto:" + f(contact, "email"), f(contact, "email")),
          ))
        }
        if f(contact, "githubHandle") != "" {
          entries.push(contact-entry(
            github-icon,
            link(f(contact, "githubUrl"), f(contact, "githubHandle")),
          ))
        }
        if f(contact, "linkedinHandle") != "" {
          entries.push(contact-entry(
            [LinkedIn],
            link(f(contact, "linkedinUrl"), f(contact, "linkedinHandle")),
          ))
        }
        if f(contact, "site") != "" {
          entries.push(contact-entry(
            [Web],
            link(f(contact, "siteUrl"), f(contact, "site")),
          ))
        }
        if f(data, "location") != "" {
          entries.push(contact-entry([Location], f(data, "location")))
        }
        for (i, e) in entries.enumerate() {
          if i > 0 { sep }
          e
        }
      },
    )

    if skills.len() > 0 {
      section(
        "Tech Stack",
        {
          set text(font: "Roboto", size: 8pt)
          stack(spacing: 8pt, ..skills)
        },
      )
    }

    if projects.len() > 0 {
      section(
        "Projects",
        {
          set text(font: "Roboto", size: 8pt)
          stack(spacing: 8pt, ..projects.map(p => link(p.at("url", default: ""), p.at("label", default: ""))))
        },
      )
    }

    if langs.len() > 0 {
      section(
        "Languages",
        {
          for l in langs {
            language-entry(l.at("language", default: ""), l.at("level", default: ""))
          }
        },
      )
    }
  },
)

#if work.len() > 0 {
  section(
    theme: (space-above: 0pt),
    "Work Experiences",
    {
      for (i, w) in work.enumerate() {
        work-entry(
          theme: if i == 0 { (space-above: 0pt) } else { (:) },
          timeframe: w.at("timeframe", default: ""),
          title: w.at("title", default: ""),
          organization: w.at("organization", default: ""),
          location: w.at("location", default: ""),
          {
            for h in w.at("body", default: ()) [#h #linebreak()]
          },
        )
      }
    },
  )
}

#if education.len() > 0 {
  section(
    "Education",
    {
      for e in education {
        education-entry(
          timeframe: e.at("timeframe", default: ""),
          title: e.at("title", default: ""),
          institution: e.at("institution", default: ""),
          {
            for h in e.at("body", default: ()) [#h #linebreak()]
          },
        )
      }
    },
  )
}
