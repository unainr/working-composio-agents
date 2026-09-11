"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupText,
	InputGroupTextarea,
} from "@/components/ui/input-group";
import { useCreateAgents } from "../hooks/use-agents-hook";

// ── DiceBear helpers ─────────────────────────────────────────────────────────

function randomSeed(length = 10) {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
	return Array.from(
		{ length },
		() => chars[Math.floor(Math.random() * chars.length)],
	).join("");
}

function buildAvatarUrl(seed: string) {
	return `https://api.dicebear.com/10.x/gaze/svg?tags=animation&seed=${seed}`;
}

// ── Schema ───────────────────────────────────────────────────────────────────

const formSchema = z.object({
	name: z
		.string()
		.min(2, "Name must be at least 2 characters.")
		.max(50, "Name must be at most 50 characters."),
	description: z
		.string()
		.max(200, "Description must be at most 200 characters."),
	avatarUrl: z.string().url(),
});

// ── Component ─────────────────────────────────────────────────────────────────

export function CreateAgentForm() {
	const { mutate, isPending } = useCreateAgents();

	const [seed, setSeed] = React.useState("default"); // stable server seed
	const [mounted, setMounted] = React.useState(false);
	const [spinning, setSpinning] = React.useState(false);

	React.useEffect(() => {
		setSeed(randomSeed()); // runs only on client after hydration
		setMounted(true);
	}, []);
	const form = useForm({
		defaultValues: {
			name: "",
			description: "",
			avatarUrl: buildAvatarUrl(seed),
		},
		validators: {
			onSubmit: formSchema,
		},
		onSubmit: async ({ value }) => {
			mutate(value, {
				onSuccess: () => {
					toast.success("agent created successfully");
					form.reset();
				},
			});
		},
	});

	function shuffle() {
		setSpinning(true);
		const next = randomSeed();
		setSeed(next);
		form.setFieldValue("avatarUrl", buildAvatarUrl(next));
		setTimeout(() => setSpinning(false), 400);
	}

	return (
		<Card className="w-full sm:max-w-md">
			<CardHeader>
				<CardTitle>Create Agent</CardTitle>
				<CardDescription>
					Set up a new AI agent with a name, avatar, and description.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					id="create-agent-form"
					onSubmit={(e) => {
						e.preventDefault();
						form.handleSubmit();
					}}>
					<FieldGroup>
						{/* ── Avatar ── */}
						<Field>
							<FieldLabel>Avatar</FieldLabel>
							<div className="flex items-center gap-4">
								<div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border">
									<img
										key={seed}
										src={buildAvatarUrl(seed)}
										alt="Agent avatar"
										className="h-full w-full"
										style={{
											opacity: spinning ? 0.4 : 1,
											transition: "opacity 0.15s ease",
										}}
									/>
								</div>
								<div className="flex flex-col gap-1.5">
									<Button
										type="button"
										variant="outline"
										size="sm"
										className="w-fit gap-2"
										onClick={shuffle}
										disabled={spinning}>
										<RefreshCw
											size={13}
											className={spinning ? "animate-spin" : ""}
										/>
										Shuffle
									</Button>
									<FieldDescription>
										Tap shuffle to generate a new avatar.
									</FieldDescription>
								</div>
							</div>
						</Field>

						{/* ── Name ── */}
						<form.Field
							name="name"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>Name</FieldLabel>
										<Input
											id={field.name}
											name={field.name}
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(e) => field.handleChange(e.target.value)}
											aria-invalid={isInvalid}
											placeholder="Salon FAQ Bot"
											autoComplete="off"
										/>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>

						{/* ── Description ── */}
						<form.Field
							name="description"
							children={(field) => {
								const isInvalid =
									field.state.meta.isTouched && !field.state.meta.isValid;
								return (
									<Field data-invalid={isInvalid}>
										<FieldLabel htmlFor={field.name}>
											Description
											<span className="ml-1 text-xs font-normal text-muted-foreground">
												(optional)
											</span>
										</FieldLabel>
										<InputGroup>
											<InputGroupTextarea
												id={field.name}
												name={field.name}
												value={field.state.value}
												onBlur={field.handleBlur}
												onChange={(e) => {
													if (e.target.value.length <= 200)
														field.handleChange(e.target.value);
												}}
												placeholder="Answers common salon questions — bookings, pricing, hours."
												rows={4}
												className="min-h-24 resize-none"
												aria-invalid={isInvalid}
											/>
											<InputGroupAddon align="block-end">
												<InputGroupText className="tabular-nums">
													{field.state.value.length}/200 characters
												</InputGroupText>
											</InputGroupAddon>
										</InputGroup>
										<FieldDescription>
											What does this agent do? Who is it for?
										</FieldDescription>
										{isInvalid && (
											<FieldError errors={field.state.meta.errors} />
										)}
									</Field>
								);
							}}
						/>
					</FieldGroup>
				</form>
			</CardContent>

			<CardFooter>
				<Field orientation="horizontal">
					<Button
						type="button"
						variant="outline"
						onClick={() => {
							form.reset();
							const next = randomSeed();
							setSeed(next);
							form.setFieldValue("avatarUrl", buildAvatarUrl(next));
						}}>
						Reset
					</Button>
					<Button disabled={isPending} type="submit" form="create-agent-form">
						{isPending ? "Creating..." : "Create Agent"}
					</Button>
				</Field>
			</CardFooter>
		</Card>
	);
}
