// Wraps @preview/min-resume. The package is markup-driven: a `resume.with`
// show rule plus `= Section` headings and `#entry(...)` / `#list[...]` calls.
// We generate that markup from the injected JSON (shaped by ./adapter.ts).
#import "@preview/min-resume:0.2.0": resume, entry, list, linkedin

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the `time` dictionary min-resume's #entry expects from pre-parsed
// numeric date arrays. Falls back to today's year if a start date is missing.
#let entry-time(e) = {
  let from = e.at("from", default: none)
  if from == none { from = (datetime.today().year(), 1, 1) }
  if e.at("ongoing", default: true) {
    (from: from)
  } else {
    (from: from, to: e.at("to", default: from))
  }
}

#show: resume.with(
  name: f(data, "name"),
  title: if f(data, "title") != "" { data.title } else { none },
  info: if f(data, "info") != "" { data.info } else { none },
  address: f(data, "address"),
  email: if f(data, "email") != "" { data.email } else { none },
  phone: if f(data, "phone") != "" { data.phone } else { none },
  cfg: (letter-show: false),
)

#if f(data, "summary") != "" [
  = Objective

  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  = Professional Experience

  #for w in work-rows {
    entry(
      title: f(w, "title"),
      organization: f(w, "organization"),
      location: if f(w, "location") != "" { w.location } else { none },
      time: entry-time(w),
      // Pass the raw array: the package's `list()` (which `entry` calls on
      // `skills`) reads `.children`, which a single-item `[- x]` lacks. The
      // array branch handles any count.
      skills: if w.at("skills", default: ()).len() > 0 { w.skills } else { none },
    )
  }
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  = Education

  #for e in edu-rows {
    entry(
      title: f(e, "title"),
      organization: f(e, "organization"),
      location: if f(e, "location") != "" { e.location } else { none },
      time: entry-time(e),
      skills: if e.at("skills", default: ()).len() > 0 { e.skills } else { none },
    )
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  = Projects

  #for p in project-rows [
    #strong(f(p, "name"))#if f(p, "url") != "" [ — #p.url]
    #if p.at("items", default: ()).len() > 0 {
      list(p.items)
    }
    #parbreak()
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  = Skills

  #list(skill-rows)
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  = Certifications

  #for c in cert-rows [- #c]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  = Languages

  #list(lang-rows)
]

#if f(data, "linkedin") != "" {
  linkedin(data.linkedin)
}
