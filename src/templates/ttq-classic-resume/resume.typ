// Wraps @preview/ttq-classic-resume. Markup-driven: a `resume` show rule plus
// resume-header / section-header / timeline-entry / project-entry / table
// components. We generate that markup from the injected JSON (./adapter.ts).
#import "@preview/ttq-classic-resume:0.1.0": project-entry, resume, resume-header, section-header, table, timeline-entry

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#show: resume

#resume-header(
  name: f(data, "name"),
  contacts: data.at("contacts", default: ()),
)

#if f(data, "summary") != "" [
  #section-header("Summary")
  #data.summary
]

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  #section-header("Work Experience")
  #for w in work-rows {
    timeline-entry(
      heading-left: f(w, "company"),
      heading-right: f(w, "dates"),
      subheading-left: f(w, "title"),
      subheading-right: f(w, "location"),
      body: {
        let hs = w.at("highlights", default: ())
        if hs.len() > 0 { for h in hs [- #h] }
      },
    )
  }
]

#let edu-rows = rows("education")
#if edu-rows.len() > 0 [
  #section-header("Education")
  #for e in edu-rows {
    timeline-entry(
      heading-left: f(e, "institution"),
      heading-right: f(e, "dates"),
      subheading-left: f(e, "degree"),
      subheading-right: f(e, "location"),
      body: {
        let hs = e.at("highlights", default: ())
        if hs.len() > 0 { for h in hs [- #h] }
      },
    )
  }
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  #section-header("Skills")
  #table(items: skill-rows.map(s => (category: f(s, "category"), text: f(s, "text"))), columns: 2)
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  #section-header("Projects")
  #for p in project-rows {
    project-entry(
      name: f(p, "name"),
      url: f(p, "url"),
      body: {
        let hs = p.at("highlights", default: ())
        if hs.len() > 0 { for h in hs [- #h] }
      },
    )
  }
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  #section-header("Certifications")
  #table(items: cert-rows, columns: 2)
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  #section-header("Languages")
  #table(items: lang-rows, columns: 2)
]
