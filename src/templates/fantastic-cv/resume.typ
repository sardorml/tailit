// Wraps @preview/fantastic-cv. The package is markup-driven: a `config` show
// rule sets the typography/heading styling, and `render-*` helpers emit each
// section. Those helpers call `link(item.url)` BEFORE their own empty-url
// guard, so they crash on the empty hrefs that real resume data contains. We
// therefore drive the package's `config` (its real visual system: extrabold
// name H1, smallcaps section H2 + rule, semibold entry H3) and emit the same
// markup ourselves with proper empty-link guards. Everything comes from `data`
// (shaped by ./adapter.ts).
#import "@preview/fantastic-cv:0.1.0": config

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let accent = {
  let a = f(data, "accent")
  if a == "" { "#26428b" } else { a }
}

#let space-highlight = -0.5em
#let space-entry = -0.5em
#let space-sections = -0.5em

#show: config.with(
  font: "New Computer Modern",
  font-size: 10pt,
  page-paper: "a4",
  accent-color: accent,
  space-between-sections: space-sections,
  space-between-highlight: space-highlight,
)

// link(target)[body] only when target is non-empty, else plain body.
#let maybe-link(target, body) = if target == "" { body } else { link(target)[#body] }

#let dates(d) = {
  let s = f(d, "startDate")
  let e = f(d, "endDate")
  if s == "" and e == "" { "" } else { s + " " + $dash.em$ + " " + e }
}

#let entry-heading(main, when, description, bottom-right) = [
  === #main #h(1fr) #when \
  #description #h(1fr) #bottom-right
]

#let section(title, body) = {
  [== #smallcaps(title)]
  v(-0.5em)
  line(length: 100%, stroke: stroke(thickness: 0.4pt))
  v(-0.5em)
  body
  v(space-sections)
}

// ---- Header --------------------------------------------------------------
#set document(title: f(data, "name"), author: f(data, "name"))

#align(left, [= #f(data, "name") #h(1fr) #f(data, "location")])

#pad(top: 0.25em)[
  #{
    let items = (
      f(data, "phone"),
      if f(data, "email") != "" { link("mailto:" + f(data, "email"))[#f(data, "email")] } else { "" },
      if f(data, "url") != "" { link("https://" + f(data, "url"))[#f(data, "url")] } else { "" },
    ).filter(x => x != "")
    let profs = rows("profiles").map(p => [#p.network: #maybe-link(
      if f(p, "url") != "" { "https://" + f(p, "url") } else { "" },
      f(p, "username"),
    )])
    (items + profs).join("  |  ")
  }
]

// ---- Education -----------------------------------------------------------
#let educations = rows("educations")
#if educations.len() > 0 {
  section("Education", educations.map(e => {
    let descr = (
      if f(e, "studyType") != "" { emph(f(e, "studyType")) } else { "" },
      f(e, "area"),
      if f(e, "score") != "" { "GPA: " + strong(f(e, "score")) } else { "" },
    ).filter(x => x != "").join(" | ")
    [
      #entry-heading(
        maybe-link(f(e, "url"), f(e, "institution")),
        dates(e),
        descr,
        f(e, "location"),
      )
      #let cs = e.at("courses", default: ())
      #if cs.len() > 0 [- #emph[Selected coursework]: #cs.join(", ")]
    ]
  }).join(v(space-entry)))
}

// ---- Work ----------------------------------------------------------------
#let works = rows("works")
#if works.len() > 0 {
  section("Work", works.map(w => {
    let descr = (
      if f(w, "position") != "" { emph(f(w, "position")) } else { "" },
      f(w, "description"),
    ).filter(x => x != "").join(" | ")
    [
      #entry-heading(
        maybe-link(f(w, "url"), f(w, "name")),
        dates(w),
        descr,
        f(w, "location"),
      )
      #w.at("highlights", default: ()).map(it => [- #it]).join(v(space-highlight))
    ]
  }).join(v(space-entry)))
}

// ---- Projects ------------------------------------------------------------
#let projects = rows("projects")
#if projects.len() > 0 {
  section("Projects", projects.map(p => {
    let roles = p.at("roles", default: ())
    let descr = if roles.len() > 0 { roles.map(emph).join(" | ") } else { "" }
    let src = if f(p, "source_code") != "" { link("https://" + f(p, "source_code"))[Source code] } else { "" }
    [
      #entry-heading(maybe-link(f(p, "url"), f(p, "name")), dates(p), descr, src)
      #v(-2em) \
      #f(p, "description")
      #p.at("highlights", default: ()).map(it => [- #it]).join(v(space-highlight))
    ]
  }).join(v(space-entry)))
}

// ---- Certificates --------------------------------------------------------
#let certificates = rows("certificates")
#if certificates.len() > 0 {
  section("Certificates", certificates.map(c => {
    let issue = if f(c, "issuer") != "" { " - issued by " + f(c, "issuer") } else { "" }
    [- #maybe-link(f(c, "url"), f(c, "name"))#issue #h(1fr) #f(c, "date")]
  }).join(v(space-highlight)))
}

// ---- Custom sections (summary / skills / languages) ----------------------
#for cs in rows("customSections") {
  section(f(cs, "title"), cs.at("highlights", default: ()).map(hl => {
    let s = f(hl, "summary")
    let d = f(hl, "description")
    if s == "" { [- #d] } else { [- #text(weight: "bold")[#s: ]#d] }
  }).join(v(space-highlight)))
}
