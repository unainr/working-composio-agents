import type { Metadata } from "next";
import { Geist, Geist_Mono, Outfit, Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProviders from "@/providers/query-provider";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { HonoAuthBridge } from "@/components/hono-auth-bridge";
import { TooltipProvider } from "@/components/ui/tooltip";

const manropeHeading = Manrope({
	subsets: ["latin"],
	variable: "--font-heading",
});

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "Amanises — AI Agents That Connect Tools & Get Tasks Done",
  description:
    "Amanises is an AI agent platform that lets you connect your tools, chat with AI agents, automate workflows, and get tasks done from one place.",
  keywords: [
    "AI agents",
    "AI agent platform",
    "AI automation",
    "AI tools",
    "AI workflow automation",
    "AI assistant",
    "AI task automation",
    "tool connected AI",
    "AI productivity",
    "Amanises",
  ],
  applicationName: "Amanises",
  authors: [{ name: "Amanises" }],
  creator: "Amanises",
  publisher: "Amanises",
  metadataBase: new URL("https://amanises.vercel.app/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Amanises — AI Agents That Connect Tools & Get Tasks Done",
    description:
      "Connect your tools, chat with AI agents, automate workflows, and get tasks done from one place with Amanises.",
    url: "https://amanises.vercel.app/",
    siteName: "Amanises",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amanises — AI Agents That Connect Tools & Get Tasks Done",
    description:
      "Connect your tools, chat with AI agents, automate workflows, and get tasks done from one place.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="en"
      suppressHydrationWarning
			className={cn(
				"h-full",
				"antialiased",
				geistSans.variable,
				geistMono.variable,
				"font-sans",
				outfit.variable,
				manropeHeading.variable,
			)}>
			<ClerkProvider>
				<body className="min-h-full flex flex-col">
					<QueryProviders>
						<ThemeProvider>
							<HonoAuthBridge />
							<TooltipProvider>

							{children}
							</TooltipProvider>
							<Toaster />
						</ThemeProvider>
					</QueryProviders>
				</body>
			</ClerkProvider>
		</html>
	);
}
