// Wraps @preview/modern-resume. The package is markup-driven: a
// `modern-resume.with` show rule plus `== Section` headings and
// `#experience` / `#project` / `#pill` calls. We generate that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/modern-resume:1.0.0": modern-resume, experience, project, pill

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Build the contact-options dict, including only the keys that have a value.
#let contact = data.at("contact", default: (:))
#let contact-options = (:)
#if f(contact, "email") != "" {
  contact-options.insert("email", link("mailto:" + contact.email)[#contact.email])
}
#if f(contact, "mobile") != "" {
  contact-options.insert("mobile", contact.mobile)
}
#if f(contact, "location") != "" {
  contact-options.insert("location", contact.location)
}
#if contact.at("linkedin", default: none) != none {
  contact-options.insert("linkedin", link(contact.linkedin.url)[#contact.linkedin.label])
}
#if contact.at("github", default: none) != none {
  contact-options.insert("github", link(contact.github.url)[#contact.github.label])
}
#if contact.at("website", default: none) != none {
  contact-options.insert("website", link(contact.website.url)[#contact.website.label])
}

#let bullets(items) = {
  for h in items [- #h]
}

#show: modern-resume.with(
  author: f(data, "name"),
  job-title: f(data, "jobTitle"),
  bio: if f(data, "bio") != "" { data.bio } else { none },
  contact-options: contact-options,
)

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Work experience
  #for w in work-rows {
    experience(
      title: f(w, "title"),
      subtitle: if f(w, "subtitleUrl") != "" { link(w.subtitleUrl)[#w.subtitle] } else { f(w, "subtitle") },
      facility-description: f(w, "facility"),
      task-description: bullets(w.at("highlights", default: ())),
      date-from: f(w, "dateFrom"),
      date-to: f(w, "dateTo"),
      label: f(w, "label"),
    )
  }
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  == Education
  #for e in education-rows {
    experience(
      title: f(e, "title"),
      subtitle: f(e, "subtitle"),
      task-description: bullets(e.at("highlights", default: ())),
      date-from: f(e, "dateFrom"),
      date-to: f(e, "dateTo"),
      label: f(e, "label"),
    )
  }
]

#colbreak()

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #for s in skill-rows {
    pill(s, fill: true)
  }
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #for p in project-rows {
    project(
      title: if f(p, "titleUrl") != "" { link(p.titleUrl)[#p.title] } else { f(p, "title") },
      subtitle: f(p, "subtitle"),
      description: bullets(p.at("highlights", default: ())),
      date-from: f(p, "dateFrom"),
      date-to: f(p, "dateTo"),
    )
  }
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certificates
  #for c in cert-rows {
    project(
      title: f(c, "title"),
      subtitle: f(c, "subtitle"),
      date-from: f(c, "dateFrom"),
      date-to: f(c, "dateTo"),
    )
  }
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #for l in lang-rows {
    pill(l)
  }
]
