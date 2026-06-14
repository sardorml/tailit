import { resumeSchema, type Resume } from "./schema";

/**
 * A fully-populated dummy resume used to render template thumbnails — a
 * showcase of what each template looks like, independent of the user's data.
 * Sized to fill roughly a full A4 page so previews don't look sparse.
 */
export const SAMPLE_RESUME: Resume = resumeSchema.parse({
  basics: {
    name: "Jordan Rivera",
    label: "Senior Software Engineer",
    email: "jordan.rivera@example.com",
    phone: "+1 (555) 213-8890",
    url: "https://jordanrivera.dev",
    summary:
      "Full-stack engineer with 8+ years building reliable, high-scale web platforms. Leads cross-functional teams, owns systems end to end, and ships pragmatic solutions that move product and business metrics.",
    location: { city: "San Francisco", region: "CA", countryCode: "US" },
    profiles: [
      { network: "GitHub", username: "jrivera", url: "https://github.com/jrivera" },
      { network: "LinkedIn", username: "jordanrivera", url: "https://linkedin.com/in/jordanrivera" },
    ],
  },
  work: [
    {
      name: "Northwind Labs",
      position: "Senior Software Engineer",
      location: "San Francisco, CA",
      startDate: "2021-03",
      summary: "Tech lead for the payments platform serving 4M monthly users.",
      highlights: [
        "Cut checkout latency 38% by redesigning the settlement pipeline around an async, idempotent worker model.",
        "Led the migration to a typed event bus, eliminating a class of cross-service sync bugs.",
        "Mentored 5 engineers and established the team's code-review and on-call standards.",
        "Drove the adoption of feature flags, enabling safe weekly releases to production.",
      ],
    },
    {
      name: "Brightwave",
      position: "Software Engineer",
      location: "Remote",
      startDate: "2018-06",
      endDate: "2021-02",
      summary: "Core API team for a B2B analytics product.",
      highlights: [
        "Built the public REST/GraphQL API now used by 200+ third-party integrations.",
        "Introduced end-to-end testing and CI gates, dropping production incidents 60%.",
        "Designed a multi-tenant rate limiter that scaled to 12k requests/second.",
      ],
    },
    {
      name: "Helios Systems",
      position: "Full-Stack Developer",
      location: "Austin, TX",
      startDate: "2016-01",
      endDate: "2018-05",
      highlights: [
        "Shipped the customer dashboard (React + Node) used daily by 30k users.",
        "Reduced page load time 45% through code-splitting and query optimization.",
      ],
    },
    {
      name: "Cobalt Interactive",
      position: "Junior Developer",
      location: "Austin, TX",
      startDate: "2014-07",
      endDate: "2015-12",
      highlights: [
        "Automated the release process, cutting deploy time from hours to minutes.",
        "Built reusable UI components adopted across four client projects.",
      ],
    },
  ],
  education: [
    {
      institution: "University of Washington",
      area: "Computer Science",
      studyType: "B.S.",
      startDate: "2010",
      endDate: "2014",
      score: "3.8 GPA",
    },
  ],
  skills: [
    { name: "Languages", keywords: ["TypeScript", "Go", "Python", "SQL", "Rust"] },
    { name: "Frameworks", keywords: ["React", "Next.js", "Node.js", "PostgreSQL", "GraphQL"] },
    { name: "Cloud & Infra", keywords: ["AWS", "Docker", "Kubernetes", "Terraform", "Redis"] },
    { name: "Practices", keywords: ["TDD", "CI/CD", "Observability", "System Design"] },
  ],
  projects: [
    {
      name: "OpenLedger",
      url: "https://github.com/jrivera/openledger",
      startDate: "2022",
      description: "Open-source double-entry accounting engine.",
      highlights: ["2.4k GitHub stars", "Adopted by 3 fintech startups in production"],
    },
    {
      name: "Querybird",
      url: "https://github.com/jrivera/querybird",
      startDate: "2020",
      description: "Type-safe SQL query builder for TypeScript.",
      highlights: ["Zero-dependency, 9kb gzipped", "Used in 40+ internal services"],
    },
  ],
  certificates: [
    { name: "AWS Solutions Architect – Associate", issuer: "Amazon", date: "2022" },
    { name: "Certified Kubernetes Application Developer", issuer: "CNCF", date: "2021" },
  ],
  languages: [
    { language: "English", fluency: "Native" },
    { language: "Spanish", fluency: "Professional" },
  ],
});
