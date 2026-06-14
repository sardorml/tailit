// Wraps @preview/toy-cv. Markup-driven 2-column template: a colored left
// sidebar (contact / languages / skills / certificates) and a right column of
// `cv-entry` items. We build that markup from the injected JSON (./adapter.ts).
#import "@preview/toy-cv:0.1.0": cv, contact-section, cv-entry, left-section, right-column-subtitle

#let data = json(bytes(sys.inputs.resume))
#let main-color = rgb("#E40019")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// -- Left sidebar -----------------------------------------------------------
#let contact-entries = rows("contact").map(c => {
  let entry = (
    logo-name: c.at("logo", default: "circle"),
    logo-text: c.at("text", default: ""),
  )
  if c.at("link", default: "") != "" { entry.insert("logo-link", c.link) }
  if c.at("brand", default: false) { entry.insert("logo-font", "Font Awesome 6 Brands") }
  entry
})

#let left-content = [
  #if contact-entries.len() > 0 {
    contact-section(main-color: main-color, i18n: "en", contact-entries: contact-entries)
  }

  #let langs = rows("languages")
  #if langs.len() > 0 {
    v(1fr)
    left-section(title: "Languages", langs.map(l => l).join(linebreak()))
  }

  #let skill-rows = rows("skills")
  #if skill-rows.len() > 0 {
    v(1fr)
    left-section(title: "Skills", {
      for s in skill-rows {
        let label = s.at("label", default: "")
        let items = s.at("items", default: ()).join(", ")
        if label != "" [*#label:* #items] else [#items]
        parbreak()
      }
    })
  }

  #let certs = rows("certificates")
  #if certs.len() > 0 {
    v(1fr)
    left-section(title: "Certifications", certs.map(c => c).join(linebreak()))
  }
]

// -- Section renderer for the right column ----------------------------------
#let render-section(heading, items) = {
  if items.len() == 0 { return }
  right-column-subtitle(heading)
  for (i, it) in items.enumerate() {
    cv-entry(
      title: [*#it.at("title", default: "")*],
      date: it.at("date", default: ""),
      subtitle: it.at("subtitle", default: ""),
      it.at("highlights", default: ()).map(h => [- #h]).join(),
    )
    if i + 1 < items.len() { v(1fr) }
  }
}

#show: cv.with(
  main-color: main-color,
  i18n: "en",
  title: data.at("name", default: "Your Name"),
  subtitle: {
    let s = data.at("subtitle", default: "")
    s.split("\n").filter(l => l != "").map(l => l).join(linebreak())
  },
  left-content: left-content,
)

#render-section("Experience", rows("work"))
#v(1fr)
#render-section("Projects", rows("projects"))
#v(1fr)
#render-section("Education", rows("education"))
