import type { Resume } from "@/lib/resume/schema";
import { degreeLine, fmtLocation, stripProtocol } from "../shared";

/**
 * Adapter for @preview/curriculo-acad (a LATTES academic-CV template).
 *
 * The package is DATA-DRIVEN: its `lattes-cv` show rule consumes a deeply
 * nested dict that mirrors Brazil's LATTES XML/TOML export. We therefore
 * synthesise that exact LATTES structure here from our flat `Resume`. We drive
 * the template with `kind: "resumido"` + `last-page: false`, which restricts
 * rendering to the sections we can faithfully populate: Identificação,
 * Formação acadêmica, Formação complementar (certificates) and Atuação
 * profissional (work). Sections we have no data for are left as empty dicts so
 * their `if "KEY" in keys()` guards are simply skipped.
 *
 * Years are zero-padded 4-char strings (the package compares/sorts them as
 * strings and prints them verbatim). Months are 2-char "MM" or "" (ongoing).
 */

function year(date?: string): string {
  const m = (date ?? "").match(/(\d{4})/);
  return m ? m[1] : "";
}

function month(date?: string): string {
  const m = (date ?? "").match(/^\d{4}-(\d{2})/);
  return m ? m[1] : "";
}

export function adapt(resume: Resume): unknown {
  const { basics, work, education, certificates } = resume;

  const name = basics.name || "Your Name";
  const location = fmtLocation(basics);

  // --- Atuação profissional (work) ---
  // Each company is one ATUACAO-PROFISSIONAL with a single VINCULO. The package
  // only prints a vínculo line when OUTRO-ENQUADRAMENTO-FUNCIONAL-INFORMADO is
  // non-empty, so we always put the position title there.
  const atuacao = work.map((w, i) => ({
    "NOME-INSTITUICAO": w.name || "Instituição",
    "SEQUENCIA-IMPORTANCIA": String(work.length - i),
    "VINCULOS": {
      "TIPO-DE-VINCULO": "Profissional",
      "ENQUADRAMENTO-FUNCIONAL": "",
      "CARGA-HORARIA-SEMANAL": "",
      "MES-INICIO": month(w.startDate),
      "ANO-INICIO": year(w.startDate),
      "MES-FIM": month(w.endDate),
      "ANO-FIM": year(w.endDate),
      "OUTRO-VINCULO-INFORMADO": "",
      "OUTRO-ENQUADRAMENTO-FUNCIONAL-INFORMADO": [w.position || "", w.summary || ""]
        .filter(Boolean)
        .join(" — "),
      "OUTRAS-INFORMACOES": (w.highlights ?? []).filter(Boolean).join(" "),
      "FLAG-VINCULO-EMPREGATICIO": "SIM",
    },
  }));

  // --- Formação acadêmica (education), keyed by an academic level ---
  const formacao: Record<string, unknown> = {};
  education.forEach((e, i) => {
    const key = `GRADUACAO${i === 0 ? "" : "_" + i}`;
    formacao[key] = {
      "NOME-CURSO": degreeLine(e.studyType, e.area, e.score) || "Curso",
      "NOME-INSTITUICAO": e.institution || "Instituição",
      "ANO-DE-INICIO": year(e.startDate),
      "ANO-DE-CONCLUSAO": year(e.endDate),
    };
  });

  // --- Formação complementar (certificates) ---
  const cursosCurta = certificates.map((c) => ({
    "NOME-CURSO": c.name || "Curso",
    "NOME-INSTITUICAO": c.issuer || "",
    // No hours data in our model; "n/d" keeps the package's "(Carga horária: …)"
    // label from rendering an empty parenthesis.
    "CARGA-HORARIA": "n/d",
    "ANO-DE-INICIO": year(c.date),
    "ANO-DE-CONCLUSAO": year(c.date),
  }));

  const dadosComplementares: Record<string, unknown> = {};
  if (cursosCurta.length > 0) {
    dadosComplementares["FORMACAO-COMPLEMENTAR"] = {
      "FORMACAO-COMPLEMENTAR-CURSO-DE-CURTA-DURACAO": cursosCurta,
    };
  }

  const summaryLine = basics.summary || "";

  return {
    "DADOS-GERAIS": {
      "NOME-COMPLETO": name,
      "ENDERECO": {
        "FLAG-DE-PREFERENCIA": "ENDERECO_RESIDENCIAL",
        "ENDERECO-RESIDENCIAL": {
          "CIDADE": location,
          "TELEFONE": basics.phone || "",
          "E-MAIL": basics.email || "",
        },
      },
      // Read by the package's create-education builder.
      "FORMACAO-ACADEMICA-TITULACAO": formacao,
      // Read by the package's create-experience builder.
      "ATUACOES-PROFISSIONAIS": {
        "ATUACAO-PROFISSIONAL": atuacao,
      },
    },
    // Read by the package's create-advanced-training builder (certificates).
    "DADOS-COMPLEMENTARES": dadosComplementares,
    // Formatting helpers consumed only by our own header / identification block.
    "_meta": {
      "label": basics.label || "",
      "summary": summaryLine,
      "site": basics.url ? stripProtocol(basics.url) : "",
    },
  };
}
