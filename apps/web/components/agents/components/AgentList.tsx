"use client";

import { useMemo, useState } from "react";
import { flexRender } from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	legacyCreateColumnHelper,
	useLegacyTable,
} from "@tanstack/react-table/legacy";
import type {
	LegacyColumnDef,
} from "@tanstack/react-table/legacy";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Sparkles,
	Search,
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	ArrowUpDown,
	ArrowUp,
	ArrowDown,
	ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useAgentsGet } from "../hooks/use-agents-hook";
import { AgentChatWidget } from "./AgentChatSheet";
import { DeleteAgentsButton } from "./delete-agents-button";
import Link from "next/link";

type Agent = {
	id: string;
	name: string;
	description?: string | null;
	avatarUrl?: string | null;
};

const columnHelper = legacyCreateColumnHelper<Agent>();

const columns = [
	columnHelper.accessor("name", {
		id: "agent",
		header: "Agent",
		enableSorting: true,
		cell: ({ row }) => {
			const agent = row.original;
			return (
				<div className="flex items-center gap-3">
					<Avatar className="h-8 w-8 ring-1 ring-border/60 ring-offset-1 ring-offset-background shrink-0">
						<AvatarImage src={agent.avatarUrl ?? undefined} alt={agent.name} />
						<AvatarFallback className="bg-primary/10 text-primary text-xs">
							{agent.name.slice(0, 2).toUpperCase()}
						</AvatarFallback>
					</Avatar>
					<span className="text-sm font-medium leading-none truncate">
						{agent.name}
					</span>
				</div>
			);
		},
	}),
	columnHelper.accessor("description", {
		header: "Description",
		enableSorting: false,
		cell: ({ getValue }) => {
			const desc = getValue();
			return desc ? (
				<span className="text-sm text-muted-foreground line-clamp-1">
					{desc}
				</span>
			) : (
				<span className="text-xs italic text-muted-foreground/40">
					No description
				</span>
			);
		},
	}),
	columnHelper.display({
		id: "status",
		header: "Status",
		enableSorting: false,
		cell: () => (
			<Badge
				variant="secondary"
				className="text-[11px] font-normal gap-1.5 text-emerald-600 bg-emerald-500/10 border-emerald-500/20">
				<span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
				Active
			</Badge>
		),
	}),
	columnHelper.display({
		id: "actions",
		header: () => <span className="sr-only">Actions</span>,
		enableSorting: false,
		cell: ({ row }) => {
			const agent = row.original;
			return (
				<div className="flex items-center justify-end gap-1">
					<DeleteAgentsButton agentId={agent.id} />
					<Link href={`/dashboard/chat/${agent.id}`}>
						<Button variant="ghost" size="sm">
							<ArrowRight className="h-3.5 w-3.5" />
						</Button>
					</Link>
					<AgentChatWidget
						agentId={agent.id}
						agentName={agent.name}
						agentAvatarUrl={agent.avatarUrl}
					/>
				</div>
			);
		},
	}),
];

// ---- main component — logic untouched ----
export function AgentList() {
	const { data: agents, isLoading, isError } = useAgentsGet();

	if (isLoading) return <AgentTableSkeleton />;

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-12 text-center">
				<p className="text-sm text-destructive">Couldn't load agents.</p>
				<p className="text-xs text-muted-foreground">
					Try refreshing the page.
				</p>
			</div>
		);
	}

	if (!agents?.length) {
		return (
			<div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed py-12 text-center">
				<Sparkles className="h-6 w-6 text-muted-foreground" />
				<p className="text-sm text-muted-foreground">No agents yet.</p>
			</div>
		);
	}

	return <AgentDataTable data={agents} />;
}

// ---- data table ----
const PAGE_SIZE = 5;

function AgentDataTable({ data }: { data: Agent[] }) {
	const memoData = useMemo(() => data, [data]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useLegacyTable<Agent>({
		data: memoData,
		columns: columns as LegacyColumnDef<Agent, unknown>[],
		state: { globalFilter, sorting },
		onGlobalFilterChange: setGlobalFilter,
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize: PAGE_SIZE, pageIndex: 0 } },
	});

	const totalRows = table.getFilteredRowModel().rows.length;
	const { pageIndex, pageSize } = table.getState().pagination;
	const from = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
	const to = Math.min((pageIndex + 1) * pageSize, totalRows);

	return (
		<div className="flex flex-col gap-3">
			{/* Toolbar */}
			<div className="flex items-center justify-between gap-3">
				<div className="relative w-64">
					<Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
					<Input
						placeholder="Search agents…"
						value={globalFilter}
						onChange={(e) => {
							setGlobalFilter(e.target.value);
							table.setPageIndex(0);
						}}
						className="pl-8 h-8 text-sm"
					/>
				</div>
				<p className="text-xs text-muted-foreground shrink-0">
					{totalRows === 0
						? "No results"
						: `${from}–${to} of ${totalRows} agent${totalRows !== 1 ? "s" : ""}`}
				</p>
			</div>

			{/* Table */}
			<div className="rounded-xl border border-border/60 overflow-hidden">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow
								key={headerGroup.id}
								className="bg-muted/40 hover:bg-muted/40 border-border/60">
								{headerGroup.headers.map((header) => {
									const canSort = header.column.getCanSort();
									const sorted = header.column.getIsSorted();
									return (
										<TableHead
											key={header.id}
											className="h-10 text-xs font-medium text-muted-foreground px-4">
											{header.isPlaceholder ? null : canSort ? (
												<button
													onClick={header.column.getToggleSortingHandler()}
													className="flex items-center gap-1.5 hover:text-foreground transition-colors">
													{flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
													{sorted === "asc" ? (
														<ArrowUp className="h-3 w-3" />
													) : sorted === "desc" ? (
														<ArrowDown className="h-3 w-3" />
													) : (
														<ArrowUpDown className="h-3 w-3 opacity-40" />
													)}
												</button>
											) : (
												flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)
											)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows.length === 0 ? (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center text-sm text-muted-foreground">
									No agents match your search.
								</TableCell>
							</TableRow>
						) : (
							table.getRowModel().rows.map((row, i) => (
								<TableRow
									key={row.id}
									className={cn(
										"border-border/40 transition-colors",
										i % 2 === 0 ? "bg-background" : "bg-muted/20",
										"hover:bg-primary/5",
									)}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id} className="px-4 py-3">
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			{totalRows > PAGE_SIZE && (
				<div className="flex items-center justify-end gap-1.5">
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 rounded-lg"
						onClick={() => table.setPageIndex(0)}
						disabled={!table.getCanPreviousPage()}>
						<ChevronsLeft className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 rounded-lg"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}>
						<ChevronLeft className="h-3.5 w-3.5" />
					</Button>

					<span className="text-xs text-muted-foreground px-1">
						Page {pageIndex + 1} of {table.getPageCount()}
					</span>

					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 rounded-lg"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}>
						<ChevronRight className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-7 w-7 rounded-lg"
						onClick={() => table.setPageIndex(table.getPageCount() - 1)}
						disabled={!table.getCanNextPage()}>
						<ChevronsRight className="h-3.5 w-3.5" />
					</Button>
				</div>
			)}
		</div>
	);
}

// ---- skeleton ----
function AgentTableSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<div className="h-8 w-64 rounded-lg bg-muted animate-pulse" />
				<div className="h-4 w-24 rounded bg-muted animate-pulse" />
			</div>
			<div className="rounded-xl border border-border/60 overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="bg-muted/40 hover:bg-muted/40 border-border/60">
							<TableHead className="h-10 px-4">Agent</TableHead>
							<TableHead className="h-10 px-4">Description</TableHead>
							<TableHead className="h-10 px-4">Status</TableHead>
							<TableHead className="h-10 px-4" />
						</TableRow>
					</TableHeader>
					<TableBody>
						{Array.from({ length: PAGE_SIZE }).map((_, i) => (
							<TableRow
								key={i}
								className={cn(
									"border-border/40 animate-pulse",
									i % 2 === 0 ? "bg-background" : "bg-muted/20",
								)}>
								<TableCell className="px-4 py-3">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-full bg-muted shrink-0" />
										<div className="h-3.5 w-28 rounded bg-muted" />
									</div>
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="h-3 w-44 rounded bg-muted" />
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="h-5 w-14 rounded-full bg-muted" />
								</TableCell>
								<TableCell className="px-4 py-3">
									<div className="ml-auto h-7 w-20 rounded bg-muted" />
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
