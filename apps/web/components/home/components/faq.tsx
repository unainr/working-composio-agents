"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState } from "react";

const FAQS = [
  {
    q: "What is Amanises?",
    a: "Amanises lets you create AI agents that chat with you and take real actions. Ask for something in plain words, and your agent does it in the tools you connect.",
  },
  {
    q: "How is this different from a regular chatbot?",
    a: "A regular chatbot only replies with text. An Amanises agent can write a doc in Google Docs, post in Slack, draft an email in Gmail or update a page in Notion, then tell you what it did.",
  },
  {
    q: "Which tools can I connect?",
    a: "You can connect Notion, Slack, Gmail and Google Docs, and we keep adding more. You link your own accounts, so your agent works with your own files and messages.",
  },
  {
    q: "Will my agent send emails without asking me?",
    a: "No. Your agent asks for your approval before it sends or deletes anything important. Every action it takes is saved in your activity log.",
  },
  {
    q: "Can I create more than one agent?",
    a: "Yes. Create a separate agent for each job, such as one for client emails and one for team updates, and give each one only the tools it needs.",
  },
  {
    q: "Do I need to know how to code?",
    a: "No. You create agents, connect tools and give tasks by chatting. There is nothing to install or write.",
  },
  {
    q: "Can I disconnect a tool later?",
    a: "Yes. You can disconnect any tool at any time, and your agent will stop using it right away.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-background px-4 py-16 text-foreground md:py-24">
      <div className="mx-auto max-w-3xl">
        <header className="mb-10 text-center md:mb-12">
          <p className="mx-auto mb-5 w-fit rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
            Questions
          </p>
          <h2 className="text-balance font-semibold text-4xl tracking-tight md:text-5xl">
            Frequently asked questions
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
            Everything you need to know about building and using agents on
            Amanises.
          </p>
        </header>

        <div className="border-border border-t">
          {FAQS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div className="border-border border-b" key={item.q}>
                <h3>
                  <button
                    aria-controls={`faq-panel-${index}`}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium text-base transition-colors hover:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
                    id={`faq-trigger-${index}`}
                    onClick={() => setOpen(isOpen ? null : index)}
                    type="button"
                  >
                    {item.q}
                    <span
                      aria-hidden="true"
                      className={cn(
                        "shrink-0 text-2xl text-muted-foreground leading-none transition-transform duration-300 motion-reduce:transition-none",
                        isOpen && "rotate-45"
                      )}
                    >
                      +
                    </span>
                  </button>
                </h3>
                <div
                  aria-labelledby={`faq-trigger-${index}`}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                  id={`faq-panel-${index}`}
                  role="region"
                >
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pr-10 pb-5 text-muted-foreground leading-relaxed">
                      {item.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-muted-foreground text-sm">
          Still have a question?{" "}
          <Link
            className="font-medium text-foreground underline underline-offset-4"
            href="mailto:hello@amanises.com"
          >
            Email our team
          </Link>
        </p>
      </div>
    </section>
  );
}