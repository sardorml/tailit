// Wraps @preview/grotesk-cv. The package is data-driven: its `cv` show-rule
// takes a `metadata` dict plus pre-rendered left/right pane content. We rebuild
// `metadata` in ./adapter.ts and generate the pane content here from the
// injected resume JSON, using the package's exported entry functions.
#import "@preview/grotesk-cv:1.0.5": cv, experience-entry, education-entry, skill-entry, language-entry

#let data = json(bytes(sys.inputs.resume))
#let meta = data.metadata
#let accent-color = meta.layout.accent_color

#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
#let nonempty(s) = type(s) == str and s.trim() != ""

// ---- Left pane: profile summary, experience, education --------------------
#let left-pane = {
  if nonempty(data.at("summary", default: "")) {
    [= Summary]
    v(5pt)
    data.summary
    v(8pt)
  }

  let exp = rows("experience")
  if exp.len() > 0 {
    [= Experience]
    v(5pt)
    for w in exp {
      experience-entry(
        title: w.at("title", default: ""),
        date: w.at("date", default: ""),
        company: w.at("company", default: ""),
        location: w.at("location", default: "Location"),
      )
      for h in w.at("highlights", default: ()) [- #h]
      v(5pt)
    }
  }

  let edu = rows("education")
  if edu.len() > 0 {
    [= Education]
    v(5pt)
    for e in edu {
      education-entry(
        degree: e.at("degree", default: ""),
        date: e.at("date", default: ""),
        institution: e.at("institution", default: ""),
        location: e.at("location", default: "Location"),
      )
      for h in e.at("highlights", default: ()) [- #h]
      v(5pt)
    }
  }
}

// ---- Right pane: skills, languages, projects, certificates ----------------
#let right-pane = {
  let skills = rows("skills")
  if skills.len() > 0 {
    [= Skills]
    v(0pt)
    for s in skills {
      if nonempty(s.at("label", default: "")) [=== #s.label]
      skill-entry(accent-color, true, center, skills: s.at("items", default: ()).map(it => [#it]))
      v(4pt)
    }
  }

  let langs = rows("languagePairs")
  if langs.len() > 0 {
    [= Languages]
    v(5pt)
    for l in langs {
      language-entry(
        language: l.at("language", default: ""),
        proficiency: l.at("proficiency", default: ""),
      )
    }
  }

  let projects = rows("projects")
  if projects.len() > 0 {
    [= Projects]
    v(5pt)
    for p in projects {
      experience-entry(
        title: p.at("title", default: ""),
        date: p.at("date", default: ""),
        company: p.at("company", default: ""),
        location: p.at("location", default: "Location"),
      )
      for h in p.at("highlights", default: ()) [- #h]
      v(5pt)
    }
  }

  let certs = rows("certificates")
  if certs.len() > 0 {
    [= Certifications]
    v(5pt)
    for c in certs {
      experience-entry(
        title: c.at("title", default: ""),
        date: c.at("date", default: ""),
        company: c.at("company", default: ""),
        location: c.at("location", default: "Location"),
      )
      v(3pt)
    }
  }
}

#show: cv.with(
  meta,
  use-photo: false,
  left-pane: left-pane,
  right-pane: right-pane,
  left-pane-proportion: 60%,
)
