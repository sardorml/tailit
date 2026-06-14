// Wraps @preview/nutshell. Markup-driven: `nutshell-setup` yields the show
// rule plus `status`/`details` helpers; sections are `== Heading` and Typst
// term lists (`/ term: description`). We generate that markup from the
// injected JSON (shaped by ./adapter.ts).
#import "@preview/nutshell:0.1.1": nutshell-setup

#let (nutshell, fonts, palette, status, details) = nutshell-setup()

#let data = json(bytes(sys.inputs.resume))
#let f(d, k) = d.at(k, default: "")
#let rows(k) = if k in data and type(data.at(k)) == array { data.at(k) } else { () }

// Stack pre-formatted bullet lines, separated by hard line breaks.
#let lines-block(items) = {
  for (i, l) in items.enumerate() {
    if i > 0 { linebreak() }
    l
  }
}

#let contact = rows("contact")
#let contact-details = (:)
#for c in contact {
  contact-details.insert(f(c, "key"), raw(f(c, "value")))
}

#show: nutshell.with(
  title: f(data, "title"),
  author: f(data, "name"),
  last-updated: f(data, "lastUpdated"),
  resume-url: f(data, "resumeUrl"),
  contact-details: contact-details,
  statement: if f(data, "statement") != "" { emph(f(data, "statement")) } else { none },
)

#let work-rows = rows("work")
#if work-rows.len() > 0 [
  == Work experience
  #for w in work-rows [
    / #f(w, "dates"): #status[#f(w, "role")] #if f(w, "company") != "" [|> #details[#f(w, "company")#if f(w, "location") != "" [ • #f(w, "location")]]]
      #lines-block(w.at("lines", default: ()))
  ]
]

#let skill-rows = rows("skills")
#if skill-rows.len() > 0 [
  == Skills
  #for s in skill-rows [
    / #f(s, "label"): #s.at("items", default: ()).join(", ")
  ]
]

#let project-rows = rows("projects")
#if project-rows.len() > 0 [
  == Projects
  #for p in project-rows [
    / #f(p, "name"): #if f(p, "dates") != "" [#status[#f(p, "dates")] ]#if f(p, "url") != "" [|> #details[#f(p, "url")]]
      #lines-block(p.at("lines", default: ()))
  ]
]

#let education-rows = rows("education")
#if education-rows.len() > 0 [
  == Education
  #for e in education-rows [
    / #f(e, "dates"): #status[#f(e, "degree")] #if f(e, "institution") != "" [|> #details[#f(e, "institution")]]
      #lines-block(e.at("lines", default: ()))
  ]
]

#let cert-rows = rows("certificates")
#if cert-rows.len() > 0 [
  == Certifications
  #for c in cert-rows [
    / #f(c, "date"): #status[#f(c, "name")] #if f(c, "issuer") != "" [|> #details[#f(c, "issuer")]]
  ]
]

#let lang-rows = rows("languages")
#if lang-rows.len() > 0 [
  == Languages
  #for l in lang-rows [
    / •: #l
  ]
]
