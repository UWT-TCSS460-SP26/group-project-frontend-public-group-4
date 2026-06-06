import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — MediaRate",
  description:
    "Meet the team behind MediaRate and learn about the services that power it.",
};

const backEndTeam = [
  { name: "Christina Dedios", role: "Back-End Developer" },
  { name: "Jorge Reyes-Cruz", role: "Back-End Developer" },
  { name: "Kevin Lam", role: "Back-End Developer" },
  { name: "Khalid Mohammed", role: "Back-End Developer" },
  { name: "Sungmin Cha", role: "Back-End Developer" },
];

const frontEndTeam = [
  { name: "Joshua Kalcha", role: "Front-End Developer" },
  { name: "Phelan Gormley", role: "Front-End Developer" },
  { name: "Nathan Levin", role: "Front-End Developer" },
  { name: "Oisin Perkins-Gilbert", role: "Front-End Developer" },
];

const services = [
  {
    name: "Group 3 API",
    description:
      "Our upstream partner group that powers the browse, search, detail, rating, and review experience across the app.",
    href: "https://group-project-backend-group-3-1.onrender.com/api-docs",
  },
  {
    name: "TMDB",
    description:
      "The Movie Database provides the movie and TV metadata — posters, descriptions, cast, genres, and more.",
    href: "https://www.themoviedb.org/",
  },
  {
    name: "TCSS IAM (Auth²)",
    description:
      "The OAuth2 identity provider that handles sign-in and user authentication for the app.",
    href: "https://tcss-460-iam.onrender.com",
  },
  {
    name: "Token Playground",
    description:
      "Course-provided tool used during development to inspect and debug OAuth2 tokens.",
    href: "https://tcss460-token-playground.onrender.com",
  },
];

export default function AboutPage() {
  return (
    <main className="pt-6 md:pt-12 px-4 pb-12 max-w-4xl mx-auto text-(--text-primary)">
      {/* Back link */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-(--text-muted) hover:text-(--text-primary) flex items-center gap-2 transition-colors w-fit"
        >
          <span>&larr;</span> Back to Home
        </Link>
      </div>

      {/* Hero */}
      <section className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          About <span className="text-(--primary-color)">Media</span>Rate
        </h1>
        <p
          className="text-lg leading-relaxed max-w-2xl"
          style={{ color: "var(--text-muted)" }}
        >
          A movie and TV review platform built by students at UW Tacoma as part
          of TCSS 460 — Client/Server Programming. Browse, search, rate, and
          review your favorite films and shows.
        </p>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-6 pb-2 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          The Team
        </h2>

        {/* Back-End Team */}
        <h3
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <svg
            className="h-5 w-5 text-(--primary-color)"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Back-End
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {backEndTeam.map((member) => (
            <div
              key={member.name}
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--surface-bg)",
                borderColor: "var(--surface-border)",
              }}
            >
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>

        {/* Front-End Team */}
        <h3
          className="text-lg font-semibold mb-4 flex items-center gap-2"
          style={{ color: "var(--text-muted)" }}
        >
          <svg
            className="h-5 w-5 text-(--primary-color))"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          Front-End
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {frontEndTeam.map((member) => (
            <div
              key={member.name}
              className="rounded-lg p-4 border"
              style={{
                backgroundColor: "var(--surface-bg)",
                borderColor: "var(--surface-border)",
              }}
            >
              <p className="font-semibold">{member.name}</p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-6 pb-2 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          Built On
        </h2>
        <div className="space-y-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="rounded-lg p-5 border"
              style={{
                backgroundColor: "var(--surface-bg)",
                borderColor: "var(--surface-border)",
              }}
            >
              <h3 className="font-semibold text-lg mb-1">
                {service.href === "#" ? (
                  service.name
                ) : (
                  <a
                    href={service.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-(--primary-color) hover:text-(--primary-hover) underline underline-offset-2 break-words"
                  >
                    {service.name}
                  </a>
                )}
              </h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Build Story */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-6 pb-2 border-b"
          style={{ borderColor: "var(--card-border)" }}
        >
          The Build Story
        </h2>
        <div
          className="rounded-lg p-6 border"
          style={{
            backgroundColor: "var(--surface-bg)",
            borderColor: "var(--surface-border)",
          }}
        >
          <p
            className="leading-relaxed mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            Building MediaRate taught us how quickly a codebase grows when
            you&rsquo;re not the only one touching it. The back-end team
            delivered a REST API with OAuth2 authentication, CRUD endpoints, and
            TMDB integration.
          </p>
          <p
            className="leading-relaxed mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            What surprised us most was how much effort goes into the &ldquo;last
            10%&rdquo; — consistent spacing, matching card patterns, loading and
            empty states, and themes. Every design choice had to hold up across
            Windows, Mac, and mobile screens, and small mismatches that looked
            fine on one device often broke completely on another. We also
            didn&rsquo;t expect how often bugs traced back to the backend API —
            malformed responses, missing fields, and inconsistent shapes that
            meant a lot of back-and-forth with the back-end team to diagnose and
            get resolved.
          </p>
          <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
            If we built it again, we&rsquo;d agree on a design system and shared
            component library earlier, invest in end-to-end types from the first
            sprint, and write integration tests alongside every feature.
          </p>
        </div>
      </section>

      {/* Footer link */}
      <div
        className="pt-4 border-t flex justify-center"
        style={{ borderColor: "var(--profile-border)" }}
      >
        <Link
          href="/"
          className="rounded-md px-6 py-2.5 font-medium transition-colors no-underline"
          style={{
            backgroundColor: "var(--btn-secondary-bg)",
            color: "var(--btn-secondary-text)",
          }}
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
