// Wraps @preview/porygon. The package is data-driven: `show-cv(data)` renders
// one big dictionary built by ./adapter.ts. We inject that dict as JSON and
// hand it straight to show-cv (lang "en" => no profile photo needed).
#import "@preview/porygon:0.1.0": show-cv

#let data = json(bytes(sys.inputs.resume))

// porygon renders the website / linkedin / github contact links unconditionally
// and `link("")` errors ("URL must not be empty") when the user has no such
// field. Render any empty-destination link as plain text instead of crashing.
#show link: it => if type(it.dest) == str and it.dest.trim() == "" { it.body } else { it }

#show-cv(data, lang: "en")
