"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import * as z from "zod";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
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

interface CreateAgentDialogProps {
	trigger?: React.ReactNode; // pass a custom trigger, or fall back to the default button
}

export function CreateAgentDialog({ trigger }: CreateAgentDialogProps) {
	const [open, setOpen] = React.useState(false);
	const { mutate, isPending } = useCreateAgents();

	const [seed, setSeed] = React.useState("default");
	const [spinning, setSpinning] = React.useState(false);

	// Re-roll the avatar seed each time the dialog opens, so a fresh
	// "Create Agent" always starts from a new random face rather than
	// whatever seed was left over from the previous open/close.
	React.useEffect(() => {
		if (open) {
			const next = randomSeed();
			setSeed(next);
			form.setFieldValue("avatarUrl", buildAvatarUrl(next));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open]);

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
					toast.success("Agent created successfully");
					form.reset();
					setOpen(false);
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
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				{trigger ?? (
					<Button className="gap-1.5">
						<Plus className="h-4 w-4" />
						New agent
					</Button>
				)}
			</DialogTrigger>

			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Create Agent</DialogTitle>
					<DialogDescription>
						Set up a new AI agent with a name, avatar, and description.
					</DialogDescription>
				</DialogHeader>

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

				<DialogFooter>
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
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}