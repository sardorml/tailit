// Wraps @preview/light-cv. The package is markup-driven: a `cv.with(styles:)`
// show rule plus `header` / `section` / `entry` / `skill` functions. The
// `styles` dict normally lives in the template's settings folder (not exported
// by the package), so we inline it here. All values are driven by the injected
// JSON (shaped by ./adapter.ts). Logos and the profile photo are skipped
// (passed as `none`) so no image assets are required.
#import "@preview/light-cv:0.2.1": cv, header, section, entry, skill
#import "@preview/fontawesome:0.6.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let accent-color = rgb("#007fad")
#let styles = (
  page-style: (
    paper: "a4",
    margin: (left: 1cm, right: 1cm, top: 0.8cm, bottom: 0.4cm),
  ),
  colors: (accent: accent-color),
  body-style: (
    fonts: ("Source Sans Pro", "Font Awesome 6 Brands", "Font Awesome 6 Free"),
    size: 10pt,
    weight: "regular",
  ),
  list-style: (indent: 1em),
  header-style: (
    fonts: ("New Computer Modern Sans"),
    table: (columns: (5fr, 1fr), column-gutter: 30pt),
    full-name: (size: 30pt, weight: "bold"),
    job-title: (size: 16pt, weight: "bold"),
    profile-photo: (
      width: 100pt,
      height: 100pt,
      stroke: none,
      radius: 9999pt,
      image-height: 10.0cm,
    ),
    margins: (between-info-and-socials: 2.5mm, bottom: 3pt),
    socials: (column-gutter: 10pt),
  ),
  section-style: (
    title: (size: 16pt, weight: "bold", font-color: black),
    margins: (top: 3pt, right-to-hline: 2pt),
  ),
  entry-style: (
    table: (columns: (5%, 1fr)),
    title: (size: 10pt, weight: "bold", color: black),
    company-or-university: (size: 10pt, weight: "bold", color: accent-color),
    time-and-location: (size: 10pt, weight: "regular", color: black),
    margins: (
      top: 3pt,
      between-logo-and-title: 8pt,
      between-title-and-subtitle: 3pt,
      between-time-and-location: 10pt,
      between-icon-and-text: 5pt,
    ),
  ),
  skills-style: (
    columns: (18%, 1fr),
    stroke: 1pt + accent-color,
    radius: 20%,
    margins: (between-skill-tags: 6pt, between-categories: -6pt),
  ),
)

#show: cv.with(styles: styles)

// Build the socials array (icon = Font Awesome content) from contact data.
#let contact = data.at("contact", default: (:))
#let socials = ()
#if f(contact, "email") != "" {
  socials.push((
    icon: fa-envelope(fill: accent-color),
    text: f(contact, "email"),
    link: "mailto:" + f(contact, "email"),
  ))
}
#if f(contact, "phone") != "" {
  socials.push((
    icon: fa-phone(fill: accent-color),
    text: f(contact, "phone"),
    link: "tel:" + f(contact, "phone"),
  ))
}
#if f(contact, "site") != "" {
  socials.push((
    icon: fa-home(fill: accent-color),
    text: f(contact, "site"),
    link: if f(contact, "siteUrl") != "" { f(contact, "siteUrl") } else { "https://" + f(contact, "site") },
  ))
}
#if f(contact, "github") != "" {
  socials.push((
    icon: fa-github(fill: accent-color),
    text: f(contact, "github"),
    link: if f(contact, "githubUrl") != "" { f(contact, "githubUrl") } else { "https://github.com/" + f(contact, "github") },
  ))
}
#if f(contact, "linkedin") != "" {
  socials.push((
    icon: fa-linkedin(fill: accent-color),
    text: f(contact, "linkedin"),
    link: if f(contact, "linkedinUrl") != "" { f(contact, "linkedinUrl") } else { "https://linkedin.com/in/" + f(contact, "linkedin") },
  ))
}

#header(
  styles: styles,
  full-name: f(data, "name"),
  job-title: f(data, "jobTitle"),
  socials: socials,
  profile-picture: none,
)

#let render-entries(items) = {
  for it in items {
    let desc = it.at("description", default: ())
    entry(
      styles: styles,
      title: f(it, "title"),
      company-or-university: f(it, "org"),
      date: f(it, "date"),
      location: f(it, "location"),
      logo: none,
      description: if desc.len() > 0 { list(..desc.map(d => [#d])) } else { [] },
    )
  }
}

#if f(data, "summary") != "" {
  section(styles: styles, title: "Summary")
  v(3pt)
  text(f(data, "summary"))
}

#let work-rows = rows("work")
#if work-rows.len() > 0 {
  section(styles: styles, title: "Professional Experience")
  render-entries(work-rows)
}

#let edu-rows = rows("education")
#if edu-rows.len() > 0 {
  section(styles: styles, title: "Education")
  render-entries(edu-rows)
}

#let project-rows = rows("projects")
#if project-rows.len() > 0 {
  section(styles: styles, title: "Projects")
  render-entries(project-rows)
}

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 {
  section(styles: styles, title: "Certifications")
  render-entries(cert-rows)
}

#let skill-rows = rows("skills")
#let lang-rows = rows("languages")
#if skill-rows.len() > 0 or lang-rows.len() > 0 {
  section(styles: styles, title: "Skills & Languages")
  v(6pt)
  for s in skill-rows {
    skill(
      styles: styles,
      category: f(s, "category"),
      skills: s.at("items", default: ()),
    )
  }
  if lang-rows.len() > 0 {
    skill(
      styles: styles,
      category: "Languages",
      skills: lang-rows,
    )
  }
}
