// Wraps @preview/brilliant-cv. This is a data-driven package: the `cv()` show
// rule consumes a metadata dict (normally read from a profile's metadata.toml)
// and stores it in a state that the component functions (cv-section, cv-entry,
// cv-skill, cv-honor) read back. We can't ship a TOML, so we assemble that same
// metadata dict here from the injected JSON (shaped by ./adapter.ts) and drive
// the body markup from its arrays. Photo column is disabled (no image file).
#import "@preview/brilliant-cv:4.0.1": (
  cv, cv-entry, cv-honor, cv-section, cv-skill, h-bar,
)

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

#let personal = data.at("personal", default: (:))
#let accent = personal.at("accent", default: data.at("accent", default: "#0395DE"))
#let header-quote = personal.at("header_quote", default: "")
#let keywords = data.at("keywords", default: ())

// Build the header contact-info dict in display order (insertion order is kept).
#let info-pairs = personal.at("info", default: ())
#let header-info = (:)
#for pair in info-pairs {
  header-info.insert(pair.key, pair.value)
}

// The full metadata dict the package expects from metadata.toml.
#let metadata = (
  header_quote: header-quote,
  cv_footer: "Curriculum vitae",
  layout: (
    awesome_color: accent,
    before_section_skip: "6pt",
    before_entry_skip: "5pt",
    before_entry_description_skip: "1pt",
    paper_size: "a4",
    date_width: "3.6cm",
    fonts: (
      regular_fonts: ("Source Sans 3", "Linux Libertine"),
      header_font: "Roboto",
    ),
    header: (
      header_align: "left",
      display_profile_photo: false,
      profile_photo_radius: "50%",
      info_font_size: "9pt",
    ),
    entry: (
      display_entry_society_first: false,
      display_logo: false,
    ),
    section: (
      title_highlight: "first-letters",
      title_highlight_letters: 3,
    ),
    footer: (
      display_page_counter: false,
      display_footer: true,
    ),
  ),
  inject: (
    injected_keywords_list: keywords,
  ),
  personal: (
    first_name: personal.at("first_name", default: "Your"),
    last_name: personal.at("last_name", default: "Name"),
    info: header-info,
  ),
)

// Render a description (array of strings) as a bullet list, or nothing.
#let desc(items) = {
  let xs = items.filter(x => x != "")
  if xs.len() > 0 { list(..xs.map(x => [#x])) } else { "" }
}

#show: cv.with(metadata, profile-photo: none)

#let work-rows = rows("work")
#if work-rows.len() > 0 {
  cv-section("Experience")
  for w in work-rows {
    cv-entry(
      title: f(w, "title"),
      society: f(w, "society"),
      date: f(w, "date"),
      location: f(w, "location"),
      description: desc(w.at("description", default: ())),
    )
  }
}

#let edu-rows = rows("education")
#if edu-rows.len() > 0 {
  cv-section("Education")
  for e in edu-rows {
    cv-entry(
      title: f(e, "title"),
      society: f(e, "society"),
      date: f(e, "date"),
      location: f(e, "location"),
      description: desc(e.at("description", default: ())),
    )
  }
}

#let project-rows = rows("projects")
#if project-rows.len() > 0 {
  cv-section("Projects")
  for p in project-rows {
    cv-entry(
      title: f(p, "title"),
      society: f(p, "society"),
      date: f(p, "date"),
      location: f(p, "location"),
      description: desc(p.at("description", default: ())),
      tags: p.at("tags", default: ()),
    )
  }
}

#let skill-rows = rows("skills")
#let lang-rows = rows("languages")
#if skill-rows.len() > 0 or lang-rows.len() > 0 {
  cv-section("Skills")
  for s in skill-rows {
    cv-skill(
      type: f(s, "type"),
      info: s.at("items", default: ()).join(h-bar()),
    )
  }
  if lang-rows.len() > 0 {
    cv-skill(type: "Languages", info: lang-rows.join(h-bar()))
  }
}

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 {
  cv-section("Certificates")
  for c in cert-rows {
    cv-honor(
      date: f(c, "date"),
      title: f(c, "title"),
      issuer: f(c, "issuer"),
      url: f(c, "url"),
      location: f(c, "location"),
    )
  }
}
