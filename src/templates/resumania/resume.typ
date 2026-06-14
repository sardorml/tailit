// Wraps @preview/resumania. The package is constructor-driven: build each
// section with `*-section(...)` from element constructors (`work`, `education`,
// `project`, `skillset`, contact helpers), then end the document with a
// `#show: resume.with(author, sections: (...))` rule. We generate all of that
// from the injected JSON (shaped by ./adapter.ts).
#import "@preview/resumania:1.0.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
#let blank(s) = s == none or s == ""
// Empty strings become `none` so resumania omits the field instead of rendering
// stray separators/dashes.
#let opt(s) = if blank(s) { none } else { s }

// --- Contact section ----------------------------------------------------------
#let c = data.at("contact", default: (:))
#let contact-entries = ()
#if not blank(f(c, "phone")) {
  contact-entries.push(phone(f(c, "phone")))
}
#if not blank(f(c, "email")) {
  contact-entries.push(email(f(c, "email")))
}
#if not blank(f(c, "location")) {
  contact-entries.push(location(f(c, "location")))
}
#if not blank(f(c, "linkedin")) {
  let dest = if blank(f(c, "linkedinUrl")) { "https://linkedin.com/in/" + f(c, "linkedin") } else { f(c, "linkedinUrl") }
  contact-entries.push(url-link(f(c, "linkedin"), dest, name: "LinkedIn"))
}
#if not blank(f(c, "github")) {
  let dest = if blank(f(c, "githubUrl")) { "https://github.com/" + f(c, "github") } else { f(c, "githubUrl") }
  contact-entries.push(url-link(f(c, "github"), dest, name: "GitHub"))
}
#if not blank(f(c, "site")) {
  let dest = if blank(f(c, "siteUrl")) { "https://" + f(c, "site") } else { f(c, "siteUrl") }
  contact-entries.push(url-link(f(c, "site"), dest, name: "Web"))
}
#let contacts = contact-section(..contact-entries)

// --- Summary section -----------------------------------------------------------
// Resumania has no built-in summary; use the generic `section` constructor with
// a passthrough show-item function.
#let summary-section = if not blank(f(data, "summary")) {
  section([Summary], (item) => item, f(data, "summary"))
} else { none }

// --- Education section ---------------------------------------------------------
#let education-items = rows("education").map(e => education(
  institution: opt(f(e, "institution")),
  location: opt(f(e, "location")),
  kind: opt(f(e, "degree")),
  study: none,
  timeframe: opt(f(e, "timeframe")),
))
#let educations = education-section(..education-items)

// --- Work section --------------------------------------------------------------
#let work-items = rows("work").map(w => work(
  company: opt(f(w, "company")),
  location: opt(f(w, "location")),
  position: opt(f(w, "position")),
  timeframe: opt(f(w, "timeframe")),
  {
    for h in w.at("highlights", default: ()) [- #h]
  },
))
#let works = work-section(..work-items)

// --- Projects section ----------------------------------------------------------
#let project-items = rows("projects").map(p => project(
  title: opt(f(p, "title")),
  location: opt(f(p, "location")),
  timeframe: opt(f(p, "timeframe")),
  {
    for h in p.at("highlights", default: ()) [- #h]
  },
))
#let projects-section = project-section(..project-items)

// --- Skills section ------------------------------------------------------------
#let skill-items = rows("skills").map(s => skillset(
  f(s, "category"),
  ..s.at("items", default: ()),
))
#let skills = skills-section(..skill-items)

// --- Assemble ------------------------------------------------------------------
#let all-sections = (contacts,)
#if summary-section != none { all-sections.push(summary-section) }
#if education-items.len() > 0 { all-sections.push(educations) }
#if work-items.len() > 0 { all-sections.push(works) }
#if project-items.len() > 0 { all-sections.push(projects-section) }
#if skill-items.len() > 0 { all-sections.push(skills) }

#show: resume.with(
  f(data, "name"),
  sections: all-sections,
)
