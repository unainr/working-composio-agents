import { PricingView } from "@/components/pricing-view";
import { Suspense } from "react";
import type { Metadata } from "next";

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";



export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Explore Amanises pricing plans for AI agents, tool integrations, workflow automation, and AI-powered task execution.",
  keywords: [
    "Amanises pricing",
    "AI agent pricing",
    "AI automation pricing",
    "AI assistant pricing",
    "AI agent platform pricing",
  ],
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Amanises Pricing — AI Agent Plans",
    description:
      "Choose an Amanises plan for AI agents, tool integrations, workflow automation, and AI-powered tasks.",
    url: "https://amanises.vercel.app/pricing",
    siteName: "Amanises",
    type: "website",
  },
};

export default async function PricingPage() {
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");
	return (
		<Suspense
			fallback={
				<div className="flex h-screen items-center justify-center">
					<p className="text-sm text-muted-foreground">Loading...</p>
				</div>
			}>
			<PricingView />
		</Suspense>
	);
}


