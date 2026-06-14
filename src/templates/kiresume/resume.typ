// Wraps @preview/kiresume. This is a DATA-DRIVEN package: its `resume(..)`
// function takes `candidate-name`, `job-title`, `links`, `sections`, and
// `style`. ./adapter.ts already shapes the injected JSON into exactly that
// dict (sections -> subsections, dates as { year, month }, skills as label
// dicts), so we simply spread it into `resume`.
#import "@preview/kiresume:0.1.17": resume

#let data = json(bytes(sys.inputs.resume))

#resume(
  candidate-name: data.at("candidate-name", default: ""),
  job-title: data.at("job-title", default: ""),
  links: data.at("links", default: ()),
  sections: data.at("sections", default: ()),
  style: data.at("style", default: (:)),
)
