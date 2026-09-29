"use client";

import { useState, type ReactNode } from "react";
import ShaderRevealLumaTransition from "./shader-reveal-luma";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const INK = "#141310";

/* ---------- Right-hand panels (mini product UI on the accent color) ---------- */
/* These sit on a bright accent color, so they use fixed colors that read well in light and dark mode. */

const Bubble = ({
	from,
	children,
}: {
	from: "user" | "agent";
	children: ReactNode;
}) => (
	<div
		className={
			from === "user"
				? "ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-[#141310] px-4 py-3 text-[#f6f1e7] text-sm"
				: "max-w-[88%] rounded-2xl rounded-bl-sm bg-white px-4 py-3 text-[#141310] text-sm shadow-lg"
		}>
		{children}
	</div>
);

const ChatPanel = () => (
	<div className="w-full max-w-xs space-y-3">
		<Bubble from="user">
			Write a full email template for client follow-ups in my Google Docs.
		</Bubble>
		<Bubble from="agent">
			Done. "Client follow-up templates" is ready in Google Docs, with five
			versions.
		</Bubble>
	</div>
);

const TOOLS = [
	{ name: "Google Docs", note: "Write and edit documents" },
	{ name: "Gmail", note: "Draft and send email" },
	{ name: "Slack", note: "Post and reply in channels" },
	{ name: "Notion", note: "Create and update pages" },
];

const ToolsPanel = () => (
	<ul className="w-full max-w-xs space-y-2">
		{TOOLS.map((tool) => (
			<li
				className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 text-[#141310] shadow-lg"
				key={tool.name}>
				<div>
					<p className="font-medium text-sm leading-tight">{tool.name}</p>
					<p className="text-black/55 text-xs">{tool.note}</p>
				</div>
				<span className="flex items-center gap-1.5 text-black/60 text-xs">
					<span className="size-1.5 rounded-full bg-emerald-500" />
					Connected
				</span>
			</li>
		))}
	</ul>
);

const ActionsPanel = () => (
	<div className="w-full max-w-xs rounded-2xl bg-[#141310] p-4 text-[#f6f1e7] shadow-xl">
		<p className="mb-3 font-medium text-sm">Task: launch day update</p>
		<ul className="space-y-2.5 text-sm">
			{[
				"Created the launch brief in Notion",
				"Posted the summary in #launch on Slack",
				"Saved a client email draft in Gmail",
			].map((item) => (
				<li className="flex items-start gap-2.5" key={item}>
					<span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
					<span className="text-white/80">{item}</span>
				</li>
			))}
		</ul>
	</div>
);

const ApprovalPanel = () => (
	<div className="w-full max-w-xs rounded-2xl bg-white p-4 text-[#141310] shadow-xl">
		<p className="font-medium text-sm">Ready to send this email?</p>
		<p className="mt-1 text-black/60 text-xs">
			To: maya@northwind.co. Subject: Following up on our call
		</p>
		<div className="mt-4 flex gap-2">
			<span className="rounded-full bg-[#141310] px-4 py-1.5 font-medium text-[#f6f1e7] text-xs">
				Approve and send
			</span>
			<span className="rounded-full border border-black/15 px-4 py-1.5 text-xs">
				Edit first
			</span>
		</div>
		<p className="mt-3 text-black/45 text-xs">Logged in your activity feed</p>
	</div>
);

/* ---------- Scenes ---------- */

const SCENES = [
	{
		id: "chat",
		tab: "Chat",
		label: "Talk to your agent",
		title: "Just say it.",
		description:
			"Describe the task in plain words. Your agent works out the steps and gets it done.",
		accent: "#e06a2c",
		panel: <ChatPanel />,
	},
	{
		id: "connect",
		tab: "Connect tools",
		label: "One agent, every app",
		title: "Your tools, together.",
		description:
			"Link your own Notion, Slack, Gmail and Google Docs accounts once. Add more whenever you need.",
		accent: "#4fd8ff",
		panel: <ToolsPanel />,
	},
	{
		id: "act",
		tab: "Get it done",
		label: "Real actions",
		title: "It does the work.",
		description:
			"Your agent writes docs, posts messages, drafts emails and updates pages right inside your apps.",
		accent: "#ffbf5e",
		panel: <ActionsPanel />,
	},
	{
		id: "control",
		tab: "Stay in control",
		label: "Built for trust",
		title: "You decide.",
		description:
			"Your agent asks before it sends or deletes anything, and every action is saved in your activity log.",
		accent: "#8dffc0",
		panel: <ApprovalPanel />,
	},
];

/* ---------- Section (uses theme tokens, so it follows light and dark mode) ---------- */

export default function ShaderLumin() {
	const [i, setI] = useState(0);
	const scene = SCENES[i];

	return (
		<section
			className="bg-background px-4 py-16 text-foreground md:py-24"
			style={{
				backgroundImage:
					"radial-gradient(color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px)",
				backgroundSize: "18px 18px",
			}}>
			<div className="mx-auto max-w-5xl">
				<header className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
					<p className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-xs">
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: scene.accent }}
						/>
						Amanises AI agents
					</p>
					<h2 className="text-balance font-semibold text-4xl tracking-tight md:text-5xl">
						Agents that do the work, not just talk about it.
					</h2>
					<p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground leading-relaxed">
						Create an agent, connect your tools and ask for what you need.
						Amanises agents write, send, post and update across the apps your
						team already uses.
					</p>
				</header>

				<ShaderRevealLumaTransition
					className="rounded-3xl border border-border bg-card text-card-foreground shadow-sm"
					transitionKey={scene.id}>
					<div className="grid min-h-104 md:grid-cols-[1.35fr_1fr]">
						<div className="flex flex-col justify-between gap-10 p-8 md:p-10">
							<p className="text-muted-foreground text-xs uppercase tracking-[0.22em]">
								{scene.label}
							</p>
							<h3 className="font-semibold text-6xl tracking-tighter md:text-7xl">
								{scene.title}
							</h3>
							<p className="max-w-sm text-muted-foreground text-sm leading-relaxed md:text-base">
								{scene.description}
							</p>
						</div>
						<div
							className="flex items-center justify-center p-6 md:p-8"
							style={{ backgroundColor: scene.accent }}>
							{scene.panel}
						</div>
					</div>
				</ShaderRevealLumaTransition>

				<div
					aria-label="Amanises features"
					className="mt-5 flex flex-wrap justify-center gap-2"
					role="tablist">
					{SCENES.map((item, index) => {
						const active = index === i;
						return (
							<Button
								aria-selected={active}
								className={cn(
									"rounded-full px-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
									!active && "bg-card",
								)}
								key={item.id}
								onClick={() => setI(index)}
								role="tab"
								style={
									active
										? { backgroundColor: item.accent, borderColor: item.accent }
										: undefined
								}
								type="button"
								variant="outline">
								{item.tab}
							</Button>
						);
					})}
				</div>
			</div>
		</section>
	);
}
