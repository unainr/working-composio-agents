import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import {
	Apollodotio,
	GithubBadge,
	GoogleDocs,
	Instagram,
	Reddit,
	Slack,
} from "@thesvg/react";

export default function IntegrationsSection() {
	return (
		<section
			className="overflow-x-clip bg-background text-foreground"
			style={{
				backgroundImage:
					"radial-gradient(color-mix(in srgb, currentColor 12%, transparent) 1px, transparent 1px)",
				backgroundSize: "18px 18px",
			}}>
			<div className="py-16 sm:py-24 md:py-32">
				<div className="mx-auto max-w-5xl px-4 sm:px-6">
					<div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14 md:mb-16">
						<p className="mx-auto mb-4 flex w-fit max-w-full items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-muted-foreground text-[11px] sm:mb-5 sm:text-xs">
							<span className="size-1.5 shrink-0 rounded-full bg-orange-500" />
							Amanises integrations
						</p>
						<h2 className="text-balance font-bold text-3xl tracking-tight min-[400px]:text-4xl md:text-5xl">
							Your agent, wired into your tools.
						</h2>
						<p className="mx-auto mt-4 max-w-xl text-balance text-sm text-muted-foreground leading-relaxed sm:text-base">
							Connect Slack, Google Docs and the apps you already use, so your
							agent can create, edit and update things for you, not just talk
							about them.
						</p>
					</div>

					<div className="aspect-16/10 group relative mx-auto flex w-full max-w-88 items-center justify-between sm:max-w-sm">
						<div
							role="presentation"
							className="bg-linear-to-b border-foreground/5 absolute inset-0 z-10 aspect-square animate-spin items-center justify-center rounded-full border-t from-lime-500/15 to-transparent to-25% opacity-0 duration-[3.5s] group-hover:opacity-100 dark:from-white/5"></div>
						<div
							role="presentation"
							className="bg-linear-to-b border-foreground/5 absolute inset-10 z-10 aspect-square scale-90 animate-spin items-center justify-center rounded-full border-t from-blue-500/15 to-transparent to-25% opacity-0 duration-[3.5s] group-hover:opacity-100 sm:inset-16"></div>
						<div className="bg-linear-to-b from-muted-foreground/15 absolute inset-0 flex aspect-square items-center justify-center rounded-full border-t to-transparent to-25%">
							<IntegrationCard className="-translate-x-1/6 absolute left-0 top-1/4 -translate-y-1/4">
								<Slack />
							</IntegrationCard>

							<IntegrationCard className="absolute top-0 -translate-y-1/2">
								<GoogleDocs />
							</IntegrationCard>
							<IntegrationCard className="translate-x-1/6 absolute right-0 top-1/4 -translate-y-1/4">
								<Instagram />
							</IntegrationCard>
						</div>
						<div className="bg-linear-to-b from-muted-foreground/15 absolute inset-10 flex aspect-square scale-90 items-center justify-center rounded-full border-t to-transparent to-25% sm:inset-16">
							<IntegrationCard className="absolute top-0 -translate-y-1/2">
								<Reddit />
							</IntegrationCard>
							<IntegrationCard className="absolute left-0 top-1/4 -translate-x-1/4 -translate-y-1/4">
								<GithubBadge />
							</IntegrationCard>
							<IntegrationCard className="absolute right-0 top-1/4 -translate-y-1/4 translate-x-1/4">
								<Apollodotio />
							</IntegrationCard>
						</div>
						<div className="absolute inset-x-0 bottom-0 mx-auto my-2 flex w-fit justify-center gap-2">
							<div className="bg-muted relative z-20 rounded-full border p-1">
								<IntegrationCard
									className="shadow-black-950/10 dark:bg-background size-12 border-black/20 shadow-xl sm:size-16 dark:border-white/25 dark:shadow-white/15"
									isCenter={true}>
									<Image
										src="/logoicon.png"
										alt="Logo"
										width={42}
										height={42}
										className="size-7 object-contain sm:size-10.5"
									/>
								</IntegrationCard>
							</div>
						</div>
					</div>

					<div className="relative z-20 mx-auto mt-10 flex justify-center sm:mt-12">
						<Button variant="outline" size="sm" asChild>
							<Link href="#">Explore integrations</Link>
						</Button>
					</div>
				</div>
			</div>
		</section>
	);
}

const IntegrationCard = ({
	children,
	className,
	isCenter = false,
}: {
	children: React.ReactNode;
	className?: string;
	position?:
		| "left-top"
		| "left-middle"
		| "left-bottom"
		| "right-top"
		| "right-middle"
		| "right-bottom";
	isCenter?: boolean;
}) => {
	return (
		<div
			className={cn(
				"relative z-30 flex size-10 rounded-full border bg-white shadow-sm shadow-black/5 sm:size-12 dark:bg-white/5 dark:backdrop-blur-md",
				className,
			)}>
			<div
				className={cn(
					"m-auto size-fit *:size-4 sm:*:size-5",
					isCenter && "*:size-6 sm:*:size-8",
				)}>
				{children}
			</div>
		</div>
	);
};