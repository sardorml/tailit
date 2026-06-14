// Wraps @preview/curriculo-acad — a LATTES (Brazilian academic) CV template.
// The package is data-driven: its `lattes-cv` show rule consumes a deeply
// nested LATTES dict. We synthesise that dict in ./adapter.ts and drive the
// package's *exported* section builders directly (create-experience, etc.).
//
// We render our own Identificação block (the package's create-identification
// hard-prints a birth-date row we have no honest value for) and then reuse the
// package's real section functions for Education / Complementary training /
// Professional experience — all fed from `data`, which is LATTES-shaped.
#import "@preview/curriculo-acad:0.1.1": create-education, create-advanced-training, create-experience, create-cols, _create-cols

#let data = json(bytes(sys.inputs.resume))

#let dg = data.at("DADOS-GERAIS", default: (:))
#let endereco = dg.at("ENDERECO", default: (:)).at("ENDERECO-RESIDENCIAL", default: (:))
#let meta = data.at("_meta", default: (:))

#let author = dg.at("NOME-COMPLETO", default: "Your Name")
#let label = meta.at("label", default: "")
#let email = endereco.at("E-MAIL", default: "")
#let phone = endereco.at("TELEFONE", default: "")
#let location = endereco.at("CIDADE", default: "")
#let site = meta.at("site", default: "")
#let summary = meta.at("summary", default: "")

#set document(title: author + " — Curriculum Vitae", author: author)

#set text(
  size: 11pt,
  font: ("Source Sans 3", "Open Sans", "Times New Roman"),
  lang: "en",
)

#set page(
  paper: "a4",
  margin: (top: 2cm, bottom: 2cm, left: 2cm, right: 2cm),
  footer: context [
    #set align(right)
    #set text(8pt)
    Page #counter(page).display("1 of 1", both: true)
  ],
)

// Header
#align(top + left)[
  #text(20pt, author, weight: "bold", fill: rgb("B2B2B2"))
  #if label != "" [
    #linebreak()
    #text(13pt, label, weight: "regular")
  ]
]

#line(length: 100%)

// Identificação (own block, data-driven — avoids the package's birth-date row)
= Identificação

#_create-cols([*Name*], author, "small")

#if email != "" [
  #_create-cols([*E-Mail*], link("mailto:" + email)[#email], "small")
]
#if phone != "" [
  #_create-cols([*Phone*], phone, "small")
]
#if location != "" [
  #_create-cols([*Location*], location, "small")
]
#if site != "" [
  #_create-cols([*Website*], link("https://" + site)[#site], "small")
]
#if summary != "" [
  #_create-cols([*Profile*], summary, "small")
]

#linebreak()
#line(length: 100%)

// Education — package's real builder, driven by our LATTES-shaped dict.
#create-education(data, "resumido")

// Complementary training (certificates).
#create-advanced-training(data)

// Professional experience.
#create-experience(data)
