// Wraps @preview/minimal-cv. The package is markup-driven: a `#show: cv.with`
// show rule plus a two-column `#grid`. We keep the package's `cv`/`section`
// styling but build entries ourselves: the package's own `entry()` collapses
// its date gutter onto the title whenever a section has only ONE entry (a
// layout bug in its chronology show rule). `g-entry` below uses a plain fixed
// gutter grid, so the date column is reliable for any number of entries.
#import "@preview/minimal-cv:0.2.0": *

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }
#let has(s) = s != none and s != ""

#set page(margin: (left: 42pt, right: 42pt, top: 42pt, bottom: 42pt))

#show: cv.with(
  theme: (
    accent-color: rgb("#0000b3"),
    spacing: 12pt,
  ),
)

// Fixed-gutter entry: [date/label] | [ title (— right) + body ]. Replaces the
// package's `entry()` (see header note). `gutter`/`right`/`body` may be none.
#let gutter-width = 44pt
#let g-entry(gutter, title, body, right: none) = block(above: 0.9em, below: 0.45em, breakable: false, grid(
  columns: (gutter-width, 1fr),
  column-gutter: 6pt,
  align: top + left,
  {
    if gutter != none {
      set text(style: "italic", fill: rgb("#222222").lighten(40%), tracking: -0.5pt)
      gutter
    }
  },
  {
    if title != none or right != none {
      grid(
        // Natural widths with a flexible spacer, so a short title isn't forced
        // to wrap next to a wide right cell (only wraps if truly too long).
        columns: (auto, 1fr, auto),
        column-gutter: 8pt,
        align: (left + bottom, auto, end + bottom),
        if title != none { strong(title) } else { [] },
        [],
        if right != none { right } else { [] },
      )
    }
    if body != none {
      v(0.25em, weak: true)
      body
    }
  },
))

#let contact = data.at("contact", default: (:))

= #f(data, "name")
#if has(f(data, "headline")) [== #f(data, "headline")]

#let work-rows = rows("work")
#let edu-rows = rows("education")
#let project-rows = rows("projects")
#let skill-rows = rows("skills")
#let cert-rows = rows("certificates")
#let lang-rows = rows("languages")

#grid(
  columns: (9fr, 42pt, 6fr),

  // ---- Left column: narrative sections ----
  {
    if has(f(data, "summary")) {
      section(
        [Summary],
        [#par(justify: true, f(data, "summary"))],
      )
    }

    if work-rows.len() > 0 {
      section(
        [Professional Experience],
        {
          for w in work-rows {
            let right-side = if has(f(w, "company")) and has(f(w, "location")) [
              *#f(w, "company")* -- #f(w, "location")
            ] else if has(f(w, "company")) [
              *#f(w, "company")*
            ] else if has(f(w, "location")) [
              #f(w, "location")
            ] else { none }
            g-entry(
              [#f(w, "dates")],
              [#f(w, "title")],
              {
                let hs = w.at("highlights", default: ())
                if hs.len() > 0 { list(..hs) }
              },
              right: right-side,
            )
          }
        },
      )
    }

    if project-rows.len() > 0 {
      section(
        [Projects],
        {
          for p in project-rows {
            g-entry(
              [#f(p, "dates")],
              [#f(p, "name")],
              {
                let hs = p.at("highlights", default: ())
                if hs.len() > 0 { list(..hs) }
              },
              right: if has(f(p, "url")) [#f(p, "url")] else { none },
            )
          }
        },
      )
    }

    if edu-rows.len() > 0 {
      section(
        [Education],
        {
          for e in edu-rows {
            g-entry(
              [#f(e, "dates")],
              [#f(e, "degree")],
              {
                let hs = e.at("highlights", default: ())
                if hs.len() > 0 { list(..hs) }
              },
              right: if has(f(e, "institution")) [*#f(e, "institution")*] else { none },
            )
          }
        },
      )
    }
  },

  // Empty gutter space.
  {},

  // ---- Right column: contact + skills ----
  {
    show: theme.with(section-style: "underlined")

    section(
      theme: (section-style: "outlined", spacing: 9pt),
      [Contact],
      {
        if has(contact.at("location", default: "")) {
          g-entry([Home], [#contact.location], none)
        }
        if has(contact.at("email", default: "")) {
          g-entry([Email], [#link("mailto:" + contact.email, contact.email)], none)
        }
        if has(contact.at("phone", default: "")) {
          g-entry([Phone], [#contact.phone], none)
        }
        if has(contact.at("site", default: "")) {
          g-entry([Web], [#link(contact.at("siteUrl", default: ""), contact.site)], none)
        }
        if has(contact.at("linkedin", default: "")) {
          g-entry([LinkedIn], [#link(contact.at("linkedinUrl", default: ""), contact.linkedin)], none)
        }
        if has(contact.at("github", default: "")) {
          g-entry([GitHub], [#link(contact.at("githubUrl", default: ""), contact.github)], none)
        }
      },
    )

    if skill-rows.len() > 0 {
      section(
        [Skills],
        {
          for s in skill-rows {
            g-entry(
              if has(f(s, "label")) [#f(s, "label")] else { none },
              [#f(s, "items")],
              none,
            )
          }
        },
      )
    }

    if cert-rows.len() > 0 {
      section(
        [Certifications],
        {
          for c in cert-rows {
            g-entry(
              none,
              [#f(c, "name")],
              if has(f(c, "issuer")) [#f(c, "issuer")] else { none },
              right: if has(f(c, "date")) [_#f(c, "date")_] else { none },
            )
          }
        },
      )
    }

    if lang-rows.len() > 0 {
      section(
        [Languages],
        {
          for l in lang-rows {
            g-entry(none, [#l], none)
          }
        },
      )
    }
  },
)
