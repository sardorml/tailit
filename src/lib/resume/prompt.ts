/** Shared description of the resume JSON shape, injected into LLM prompts. */
export const RESUME_SHAPE = `The resume is JSON with these OPTIONAL sections (omit anything unknown — never invent):
{
  "basics": {
    "name": string,
    "label": string,          // target role / headline, e.g. "Senior Frontend Engineer"
    "email": string,
    "phone": string,
    "url": string,            // website or LinkedIn
    "summary": string,        // 2-3 sentence professional summary
    "location": { "city": string, "region": string, "countryCode": string },
    "profiles": [{ "network": string, "username": string, "url": string }]
  },
  "work": [{
    "name": string,           // company
    "position": string,
    "location": string,
    "startDate": "YYYY-MM",
    "endDate": "YYYY-MM",     // omit if current
    "summary": string,
    "highlights": [string]    // accomplishment bullet points
  }],
  "education": [{ "institution": string, "area": string, "studyType": string, "startDate": "YYYY", "endDate": "YYYY", "score": string }],
  "skills": [{ "name": string, "keywords": [string] }],   // group label optional; keywords are the skills
  "projects": [{ "name": string, "description": string, "url": string, "highlights": [string], "startDate": "YYYY-MM", "endDate": "YYYY-MM" }],
  "certificates": [{ "name": string, "issuer": string, "date": "YYYY" }],
  "languages": [{ "language": string, "fluency": string }]
}`;

/** Rule reused everywhere: when updating an array, return the FULL array. */
export const ARRAY_RULE =
  "When you update an array section (work, education, skills, projects, certificates, languages), return the COMPLETE array you want to set — include items already present plus any additions — because the array is replaced, not merged.";
