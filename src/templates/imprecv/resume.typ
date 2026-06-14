// Wraps @preview/imprecv. The package is data-driven: it reads a single
// `cvdata` dict (normally from YAML) and passes it to its section functions.
// We build that dict in ./adapter.ts and inject it as JSON here.
//
// The package's section functions call `utils.strpdate` on every date field
// unconditionally, and `strpdate` crashes on `none`/empty input (the package
// assumes fully-populated YAML). Our resumes legitimately have missing dates
// (e.g. a project with only a start). We therefore re-declare the few section
// bodies we use with none-safe date handling, preserving the package's exact
// layout. (The template explicitly supports overriding section bodies.)
#import "@preview/imprecv:1.0.1": *

#let data = json(bytes(sys.inputs.resume))

#let uservars = (
  headingfont: "Linux Libertine",
  bodyfont: "Linux Libertine",
  fontsize: 10pt,
  linespacing: 6pt,
  sectionspacing: 0pt,
  showAddress: true,
  showNumber: true,
  showTitle: true,
  headingsmallcaps: false,
  sendnote: false,
)

#let customrules(doc) = {
  set page(
    paper: "us-letter",
    numbering: "1 / 1",
    number-align: center,
    margin: 1.25cm,
  )
  doc
}

#let cvinit(doc) = {
  doc = setrules(uservars, doc)
  doc = showrules(uservars, doc)
  doc = customrules(doc)
  doc
}

// none-safe date parsing (mirrors imprecv/utils.typ but tolerates none/empty).
#let monthshort(n) = (
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
).at(int(n) - 1)

#let pdate(isodate) = {
  if isodate == none { return none }
  if type(isodate) != str or isodate.len() < 4 { return none }
  if lower(isodate) == "present" { return "Present" }
  let year = int(isodate.slice(0, 4))
  let month = int(isodate.slice(5, 7))
  monthshort(month) + " " + str(year)
}

#let drange(start, end) = {
  if start != none and end != none [#start #sym.dash.en #end]
  else if start == none and end != none [#end]
  else if start != none and end == none [#start]
}

#let xcvwork(info, title: "Work Experience", isbreakable: true) = {
  if info.work != none {
    block[
      == #title
      #for w in info.work {
        block(width: 100%, breakable: isbreakable)[
          #if w.url != none [
            *#link(w.url)[#w.organization]* #h(1fr) *#w.location* \
          ] else [
            *#w.organization* #h(1fr) *#w.location* \
          ]
        ]
        let index = 0
        for p in w.positions {
          if index != 0 { v(0.6em) }
          block(width: 100%, breakable: isbreakable, above: 0.6em)[
            #text(style: "italic")[#p.position] #h(1fr)
            #drange(pdate(p.startDate), pdate(p.endDate)) \
            #for hi in p.highlights [
              - #eval(hi, mode: "markup")
            ]
          ]
          index = index + 1
        }
      }
    ]
  }
}

#let xcveducation(info, title: "Education", isbreakable: true) = {
  if info.education != none {
    block[
      == #title
      #for edu in info.education {
        let edu-items = ""
        if edu.honors != none { edu-items = edu-items + "- *Honors*: " + edu.honors.join(", ") + "\n" }
        if edu.courses != none { edu-items = edu-items + "- *Courses*: " + edu.courses.join(", ") + "\n" }
        if edu.highlights != none {
          for hi in edu.highlights { edu-items = edu-items + "- " + hi + "\n" }
        }
        edu-items = edu-items.trim("\n")
        block(width: 100%, breakable: isbreakable)[
          #if edu.url != none [
            *#link(edu.url)[#edu.institution]* #h(1fr) *#edu.location* \
          ] else [
            *#edu.institution* #h(1fr) *#edu.location* \
          ]
          #text(style: "italic")[#edu.studyType in #edu.area] #h(1fr)
          #drange(pdate(edu.startDate), pdate(edu.endDate)) \
          #if edu-items != "" [#eval(edu-items, mode: "markup")]
        ]
      }
    ]
  }
}

#let xcvprojects(info, title: "Projects", isbreakable: true) = {
  if info.projects != none {
    block[
      == #title
      #for project in info.projects {
        block(width: 100%, breakable: isbreakable)[
          #if project.url != none [
            *#link(project.url)[#project.name]* \
          ] else [
            *#project.name* \
          ]
          #if project.affiliation != none and project.affiliation != "" [
            #text(style: "italic")[#project.affiliation] #h(1fr)
          ] else [
            #h(1fr)
          ]
          #drange(pdate(project.startDate), pdate(project.endDate)) \
          #for hi in project.highlights [
            - #eval(hi, mode: "markup")
          ]
        ]
      }
    ]
  }
}

#let xcvcertificates(info, title: "Licenses and Certifications", isbreakable: true) = {
  if info.certificates != none {
    block[
      == #title
      #for cert in info.certificates {
        block(width: 100%, breakable: isbreakable)[
          #if cert.url != none [
            *#link(cert.url)[#cert.name]* #h(1fr)
          ] else [
            *#cert.name* #h(1fr)
          ]
          #if "id" in cert.keys() and cert.id != none and cert.id.len() > 0 [
            ID: #raw(cert.id)
          ]
          \
          Issued by #text(style: "italic")[#cert.issuer] #h(1fr) #drange(none, pdate(cert.date)) \
        ]
      }
    ]
  }
}

#show: doc => cvinit(doc)

#cvheading(data, uservars)

#let summary = data.at("summary", default: none)
#if summary != none {
  block[
    == Profile
    #eval(summary, mode: "markup")
  ]
}

#xcvwork(data)
#xcveducation(data)
#xcvprojects(data)
#xcvcertificates(data)
#cvskills(data)
#endnote(uservars)
