// Wraps @preview/free-cv. The package is data-driven: makeContacts(introduction),
// makeSection(items) and makeSectionCompact(items). We build those exact dicts
// from the injected JSON (shaped by ./adapter.ts) and feed them to the package.
#import "@preview/free-cv:1.0.0": *

#let data = json(bytes(sys.inputs.resume))
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let employment = rows("employment")
#let education = rows("education")
#let projects = rows("projects")
#let skills = rows("skills")
#let certificates = rows("certificates")
#let languages = rows("languages")

#show: freeCV

#makeContacts(data.introduction)

#if employment.len() > 0 [
  = Employment History
  #makeSection(employment)
]

#if education.len() > 0 [
  = Education
  #makeSection(education)
]

#if projects.len() > 0 [
  = Projects
  #makeSection(projects)
]

#if skills.len() > 0 [
  = Skills
  #makeSectionCompact(skills, rowGutter: 16pt, paddingAbove: 0pt)
]

#if certificates.len() > 0 or languages.len() > 0 [
  = Miscellaneous
  #if languages.len() > 0 [
    == Languages
    #makeSectionCompact(languages, bodyIndent: 0pt, rowGutter: 8pt, paddingBelow: 0pt)
  ]
  #if certificates.len() > 0 [
    == Certifications
    #makeSectionCompact(certificates, bodyIndent: 0pt, rowGutter: 8pt, paddingBelow: 0pt)
  ]
]
