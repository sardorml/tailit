// Wraps @preview/academicv. The package is DATA-DRIVEN: its entrypoint reads a
// `cv-data` dict (parsed from YAML) with `settings`, `personal` and `sections`,
// then renders each section via a named layout. We rebuild that same dict from
// the injected JSON (shaped by ./adapter.ts) and mirror the entrypoint logic.
#import "@preview/academicv:1.1.0": *

#let cv-data = json(bytes(sys.inputs.resume))

// --- Resolve settings (strings -> lengths/colors), matching cv.typ ---------
#let settings = {
  let s = cv-data.settings
  for setting in ("fontsize", "spacing-line", "spacing-section", "spacing-entry", "spacing-element") {
    s.at(setting) = convert-string-to-length(s.at(setting))
  }
  if "page" in s and "margin" in s.page {
    s.page.margin = convert-string-to-length(s.page.margin)
  }
  s.at("color-hyperlink") = convert-string-to-color(s.at("color-hyperlink"))
  s
}

// --- Page / link rules (from cv.typ customrules) ---------------------------
#let customrules(doc) = {
  set page(
    paper: if "page" in settings and "paper" in settings.page { settings.page.paper } else { "a4" },
    numbering: if "page" in settings and "numbering" in settings.page { settings.page.numbering } else { "1 / 1" },
    number-align: center,
    margin: if "page" in settings and "margin" in settings.page { settings.page.margin } else { 2.5cm },
  )
  show link: it => text(fill: settings.color-hyperlink)[#it]
  doc
}

#let cvinit(doc) = {
  doc = setrules(settings, doc)
  doc = showrules(settings, doc)
  doc = customrules(doc)
  doc
}

#show: doc => cvinit(doc)

// --- Render sections dynamically (mirrors cv.typ) --------------------------
#for section in cv-data.sections {
  if section.at("show", default: true) == true {
    if section.key == "personal" {
      layout-header(cv-data, settings)
    } else {
      let section-data = get-section-data(section, cv-data)
      let temp-data = (
        personal: cv-data.personal,
        (section.key): section-data.entries,
      )
      if "primary-element" in section-data {
        temp-data.insert("primary-element", section-data.primary-element)
      }
      if "secondary-element" in section-data {
        temp-data.insert("secondary-element", section-data.secondary-element)
      }
      if "tertiary-element" in section-data {
        temp-data.insert("tertiary-element", section-data.tertiary-element)
      }
      cvsection(temp-data, layout: section.layout, section: section.key, settings: settings, title: section.title)
    }
  }
}
