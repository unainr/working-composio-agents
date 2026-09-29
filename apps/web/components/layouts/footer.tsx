import Link from "next/link";
import Logo from "./logo";

const COLUMNS = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "mailto:hello@amanises.com" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-border border-t bg-background px-4 pt-14 pb-8 text-foreground">
      <div className="mx-auto max-w-5xl">
        <div className="grid gap-10 md:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="max-w-xs space-y-4">
           
              <Logo />
            
            <p className="text-muted-foreground text-sm leading-relaxed">
              AI agents that chat with you and get real work done in Notion,
              Slack, Gmail, Google Docs and more.
            </p>
          </div>

          {COLUMNS.map((column) => (
            <nav aria-label={column.title} key={column.title}>
              <h3 className="mb-4 font-medium text-sm">{column.title}</h3>
              <ul className="space-y-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      className="text-muted-foreground text-sm transition-colors hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-border border-t pt-6 text-muted-foreground text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Amanises. All rights reserved.</p>
          <p>Built for people who want their tools to work for them.</p>
        </div>
      </div>
    </footer>
  );
}