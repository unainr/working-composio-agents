import { ChatView } from "@/components/chat/view/chat-view";
import React from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "AI Tools & Integrations",
	description:
		"Connect your favorite tools to Amanises and give AI agents access to the apps and services they need to complete tasks.",
	keywords: [
		"AI tool integrations",
		"AI integrations",
		"AI agent tools",
		"AI automation tools",
		"AI connected tools",
		"Amanises integrations",
	],
	alternates: {
		canonical: "/tools",
	},
	openGraph: {
		title: "AI Tools & Integrations | Amanises",
		description:
			"Connect tools to Amanises and let AI agents use them to automate workflows and complete tasks.",
		url: "https://amanises.vercel.app/tools",
		siteName: "Amanises",
		type: "website",
	},
};

interface Props {
	params: Promise<{ id: string }>;
}
const ChatPage = async ({ params }: Props) => {
	const { userId } = await auth();
	if (!userId) redirect("/sign-in");
	const { id } = await params;
	return (
		<>
			<ChatView id={id} />
		</>
	);
};

export default ChatPage;
