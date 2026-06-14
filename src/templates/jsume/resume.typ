// Wraps @preview/jsume. The package is data-driven: a single `jsume.with`
// show rule reads one `jsume-data` dict and renders every section from it. We
// build that dict in ./adapter.ts and inject it as JSON here.
#import "@preview/jsume:0.1.0": jsume

#let data = json(bytes(sys.inputs.resume))

#show: jsume.with(
  paper: "a4",
  top-margin: 0.3in,
  bottom-margin: 0.3in,
  left-margin: 0.4in,
  right-margin: 0.4in,
  font: "Libertinus Serif",
  nerd-font: "Symbols Nerd Font",
  font-size: 9.5pt,
  lang: "en-US",
  jsume-data: data,
)
