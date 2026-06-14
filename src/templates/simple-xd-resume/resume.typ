// Wraps @preview/simple-xd-resume. The package's `make-resume` does
// `set align(horizon)`, which vertically centers a short resume in the middle
// of the page (leaving a big empty top). It ignores its `body` and can't be
// wrapped in `align()` (it calls `set page`), so there's no way to override
// that from outside. Instead we assemble the package's exported section
// builders ourselves — same page/font/margins and section order, minus the
// centering — so content sits at the top and paginates normally.
#import "@preview/simple-xd-resume:0.1.0": (
  make-title-section, make-experiences-section, make-keywords-section, make-line,
)

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")

// Coerce a possibly-empty username into a {username} dict or none.
#let user-dict(name) = if name != none and name != "" { (username: name) } else { none }

#let homepage-url = f(data, "homepageUrl")
#let homepage = if homepage-url != "" {
  (url: homepage-url, display: f(data, "homepageDisplay"))
} else { none }

#let phone = { let p = f(data, "phone"); if p == "" { none } else { p } }
#let email = { let e = f(data, "email"); if e == "" { none } else { e } }

// Normalize experience/education rows: enddate may be null (-> none = "Present").
#let norm-items(rows) = rows.map(it => (
  organization: f(it, "organization"),
  startdate: f(it, "startdate"),
  enddate: { let e = it.at("enddate", default: none); if e == none or e == "" { none } else { e } },
  title: f(it, "title"),
  label: f(it, "label"),
  responsibilities: it.at("responsibilities", default: ()),
))

#set page(margin: (top: 0.4in, bottom: 0.4in, left: 0.4in, right: 0.4in))
#set text(font: "Source Sans 3")

#let experiences = norm-items(data.at("experiences", default: ()))
#let educations = norm-items(data.at("educations", default: ()))
#let skills = data.at("skills", default: ())

#make-title-section(
  firstname: f(data, "firstname"),
  lastname: f(data, "lastname"),
  headlines: data.at("headlines", default: ()),
  phone-number: phone,
  email: email,
  github: user-dict(f(data, "github")),
  linkedin: user-dict(f(data, "linkedin")),
  homepage: homepage,
  telegram: none,
)

#if experiences.len() > 0 {
  make-line()
  make-experiences-section(items: experiences)
}

#if skills.len() > 0 {
  make-line()
  make-keywords-section(title: "Skills & Technologies", skills: skills)
}

#if educations.len() > 0 {
  make-line()
  make-experiences-section(section-title: "Education", items: educations)
}
