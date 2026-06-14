// Wraps @preview/nabcv. The package is data-driven: a single `cv` function takes
// named args (name, headline, experience, education, skills, …) and renders a
// two-column CV. We build that arg set from the injected JSON (shaped by
// ./adapter.ts) and forward each key, guarding optionals and dropping empties so
// blank sections never appear.
#import "@preview/nabcv:0.1.0": cv

#let data = json(bytes(sys.inputs.resume))

// Treat empty strings/arrays as absent so the package hides the section.
#let opt(k) = {
  let v = data.at(k, default: none)
  if v == none { none } else if type(v) == str and v == "" { none } else if type(v) == array and v.len() == 0 { none } else { v }
}

#show: cv.with(
  name: data.at("name", default: "Your Name"),
  headline: opt("headline"),
  location: opt("location"),
  email: opt("email"),
  phone: opt("phone"),
  profiles: opt("profiles"),
  summary: opt("summary"),
  experience: opt("experience"),
  education: opt("education"),
  skills: opt("skills"),
  courses: opt("courses"),
  section-titles: (courses: "PROJECTS & CERTIFICATIONS"),
  section-icons: (courses: "award"),
  sidebar-sections: ("contact", "skills"),
  main-sections: ("summary", "experience", "education", "courses"),
)
