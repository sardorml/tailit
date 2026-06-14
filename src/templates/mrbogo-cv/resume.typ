// Wraps @preview/mrbogo-cv — a markup-driven two-column CV (sidebar + main):
// a `cv.with(...)` show rule, a `side[...]` sidebar, `= Section` headings, and
// `entry(...)` items. We generate that markup from the injected JSON
// (shaped by ./adapter.ts). The profile picture is optional and omitted.
#import "@preview/mrbogo-cv:1.0.5": (
  cv, side, entry, contact-info, social-links,
  item-with-level, side-block, heading-style, introduction,
)

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(d, k) = if k in d and type(d.at(k)) == array { d.at(k) } else { () }

#let author-raw = data.at("author", default: (:))
#let labels = data.at("labels", default: (:))
#let lbl(k, fallback) = labels.at(k, default: fallback)

// Build the author dict, dropping empty keys so mrbogo-cv only renders
// contact/social rows that actually have a value.
#let author = {
  let a = (
    firstname: f(author-raw, "firstname"),
    lastname: f(author-raw, "lastname"),
  )
  for k in ("position", "email", "phone") {
    if f(author-raw, k) != "" { a.insert(k, author-raw.at(k)) }
  }
  for k in ("website", "github", "linkedin") {
    if f(author-raw, k) != "" { a.insert(k, author-raw.at(k)) }
  }
  a
}

#show: heading-style

#show: cv.with(
  author: author,
  accent-color: rgb(data.at("accent", default: "#057dcd")),
  header-color: rgb(data.at("headerColor", default: "#1e3d58")),
)

// === Sidebar ===
#side[
  #if f(data, "aboutMe") != "" [
    = #lbl("about", "About Me")
    #data.aboutMe
  ]

  = #lbl("contact", "Contact")
  #contact-info()

  #let skill-blocks = rows(data, "skillBlocks")
  #if skill-blocks.len() > 0 [
    = #lbl("skills", "Skills")
    #for (i, blk) in skill-blocks.enumerate() {
      side-block(f(blk, "label"), first: i == 0)[
        #for s in rows(blk, "items") [
          #item-with-level(f(s, "name"), s.at("level", default: 4))
        ]
      ]
    }
  ]

  #let langs = rows(data, "languages")
  #if langs.len() > 0 {
    block(breakable: false, above: 0.8em)[
      = #lbl("languages", "Languages")
      #for l in langs [
        #item-with-level(f(l, "name"), l.at("level", default: 4))
      ]
    ]
  }

  #v(1fr)
  #social-links()
]

// === Main content ===
#let render-section(key, title) = {
  let items = rows(data, key)
  if items.len() > 0 {
    [= #title]
    for it in items {
      entry(
        title: f(it, "title"),
        institution: f(it, "institution"),
        location: f(it, "location"),
        date: f(it, "date"),
      )[
        #for h in rows(it, "highlights") [- #h]
      ]
    }
  }
}

#if f(data, "summary") != "" [
  = #lbl("intro", "Profile")
  #introduction[#data.summary]
]

#render-section("work", lbl("experience", "Professional Experience"))
#render-section("projects", lbl("projects", "Projects"))
#render-section("education", lbl("education", "Education"))
#render-section("certificates", lbl("certifications", "Certifications"))
