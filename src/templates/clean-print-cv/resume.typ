// Wraps @preview/clean-print-cv. The package is markup-driven via per-section
// functions (cv-header, cv-summary, cv-experience, ...). We drive each of them
// from the injected JSON (shaped by ./adapter.ts), guarding optional sections.
#import "@preview/clean-print-cv:0.1.0": *

#let data = json(bytes(sys.inputs.resume))
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: cv-page-setup

#cv-header(data.personal)

#if data.at("summary", default: "") != "" {
  cv-summary(data.summary)
}

#let experience = rows("experience")
#if experience.len() > 0 {
  cv-experience(experience)
}

#let skills = rows("skills")
#if skills.len() > 0 {
  cv-skills(skills)
}

#let projects = rows("projects")
#if projects.len() > 0 {
  cv-projects(projects)
}

#let certifications = rows("certifications")
#if certifications.len() > 0 {
  cv-certifications(certifications)
}

#let education = rows("education")
#if education.len() > 0 {
  cv-education(education)
}

#let languages = rows("languages")
#if languages.len() > 0 {
  cv-languages(languages)
}
