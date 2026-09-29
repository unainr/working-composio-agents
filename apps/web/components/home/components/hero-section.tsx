"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import {
	SiDiscord,
	SiGoogledrive,
	SiInstagram,
	SiNotion,
} from "react-icons/si";
import { cn } from "@/lib/utils";
import GhostFibers from "./ghost-fiber";

const ACCENT = "#993a05";
const ACCENT_LIGHT = "#e06a2c";

const integrations = [
	{ name: "Instagram", icon: SiInstagram },
	{ name: "Notion", icon: SiNotion },
	{ name: "Google Drive", icon: SiGoogledrive },
	{ name: "Discord", icon: SiDiscord },
];

const fadeUp = (delay = 0) => ({
	initial: { opacity: 0, y: 16 },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export default function AmanisesHero({ className }: { className?: string }) {
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const isLight = mounted && resolvedTheme === "light";

	return (
		<section
			aria-label="Hero"
			className={cn(
				// -mt-20 pulls the hero up under the floating dock (cancels the
				// navbar spacer); pt-20 keeps the content clear of the dock.
				"relative isolate -mt-20 flex min-h-svh items-center overflow-hidden pt-20",
				className,
			)}>
			{/* Fibers background */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10"
				style={{
					maskImage: "linear-gradient(to bottom, black 70%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to bottom, black 70%, transparent 100%)",
				}}>
				{mounted && (
					<GhostFibers
						lineColor={ACCENT}
						glowColor={ACCENT_LIGHT}
						lightMode={isLight}
						blueBoost={1}
						speed={0.2}
						scale={2}
						rotationSpeed={0.2}
						layers={4}
						brightness={1.6}
						glowIntensity={1.4}
						vignette={0.8}
						grain={0.05}
						dpr={1}
						fps={60}
					/>
				)}
			</div>

			{/* Readability scrim behind the text */}
			<div
				aria-hidden
				className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,var(--background)_0%,transparent_100%)] opacity-60"
			/>

			<div className="mx-auto w-full max-w-5xl px-4 py-16 text-center sm:px-6">
				<motion.div {...fadeUp(0)} className="mb-6 flex justify-center">
					<span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
						<span
							className="size-1.5 rounded-full"
							style={{ backgroundColor: ACCENT_LIGHT }}
						/>
						AI agents that actually take action
					</span>
				</motion.div>

				<motion.h1
					{...fadeUp(0.08)}
					className="mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl">
					Build an agent that{" "}
					<span
						className="bg-clip-text text-transparent"
						style={{
							backgroundImage: `linear-gradient(120deg, ${ACCENT_LIGHT}, ${ACCENT})`,
						}}>
						gets things done
					</span>
				</motion.h1>

				<motion.p
					{...fadeUp(0.16)}
					className="mx-auto mt-5 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground md:mt-6 md:text-lg">
					Connect Instagram, Notion and Google Drive, then just chat. Your agent
					posts, updates and reports back, so you stop copy-pasting between
					tools.
				</motion.p>

				<motion.div
					{...fadeUp(0.24)}
					className="mt-8 flex flex-wrap items-center justify-center gap-3">
					<Link
						href="/agent"
						className="group inline-flex h-11 items-center gap-2 rounded-full px-6 text-sm font-medium text-white shadow-[0_10px_30px_-10px_#993a05] transition-all hover:brightness-110"
						style={{ backgroundColor: ACCENT }}>
						Create your agent
						<ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
					</Link>
					<Link
						href="/pricing"
						className="inline-flex h-11 items-center rounded-full border border-border bg-background/60 px-6 text-sm font-medium text-foreground backdrop-blur transition-colors hover:bg-muted">
						View pricing
					</Link>
				</motion.div>

				<motion.div
					{...fadeUp(0.32)}
					className="mt-12 flex flex-col items-center gap-3">
					<p className="text-xs uppercase tracking-widest text-muted-foreground/80">
						Works with the tools you already use
					</p>
					<ul className="flex flex-wrap items-center justify-center gap-2.5">
						{integrations.map(({ name, icon: Icon }) => (
							<li
								key={name}
								title={name}
								className="flex size-10 items-center justify-center rounded-xl border border-border bg-background/70 text-muted-foreground backdrop-blur transition-colors hover:text-foreground">
								<Icon className="size-4.5" aria-label={name} />
							</li>
						))}
					</ul>
				</motion.div>
			</div>
		</section>
	);
}
