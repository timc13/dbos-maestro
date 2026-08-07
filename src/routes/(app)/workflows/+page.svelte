<script lang="ts">
	import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';

	import PaginationControls from '#lib/components/pagination-controls.svelte';
	import { Button } from '#lib/components/ui/button';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import { Input } from '#lib/components/ui/input';
	import { Skeleton } from '#lib/components/ui/skeleton';
	import WorkflowTable from '#lib/components/workflow-table.svelte';
	import { listWorkflows } from '#lib/remote/workflow.remote';
	import { WORKFLOW_STATUSES, type WorkflowStatusName } from '#lib/workflow-status';

	let pageIndex = $state(0);
	let pageSize = $state(25);
	let statuses = $state<WorkflowStatusName[]>([]);
	let workflowName = $state('');

	const statusLabel = $derived(
		statuses.length === 0
			? 'All statuses'
			: statuses.length === 1
				? statuses[0]
				: `${statuses.length} statuses`
	);

	function toggleStatus(s: WorkflowStatusName, checked: boolean): void {
		statuses = checked ? [...statuses, s] : statuses.filter((x) => x !== s);
		pageIndex = 0;
	}

	const workflowsQuery = $derived(
		listWorkflows({
			page: pageIndex,
			pageSize,
			status: statuses.length > 0 ? statuses : undefined,
			workflowName: workflowName || undefined
		})
	);
</script>

<div class="flex flex-wrap items-center justify-between gap-4">
	<h1 class="text-2xl font-bold">Workflows</h1>
	<div class="flex items-center gap-2">
		<Input
			class="w-56"
			placeholder="Filter by workflow name…"
			value={workflowName}
			onchange={(e) => {
				workflowName = e.currentTarget.value;
				pageIndex = 0;
			}}
		/>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Button {...props} variant="outline" class="w-44 justify-between font-normal">
						{statusLabel}
						<ChevronDownIcon class="size-4 opacity-50" />
					</Button>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-44">
				<DropdownMenu.Label>Filter by status</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#each WORKFLOW_STATUSES as s (s)}
					<DropdownMenu.CheckboxItem
						checked={statuses.includes(s)}
						closeOnSelect={false}
						onCheckedChange={(checked) => toggleStatus(s, checked)}
					>
						{s}
					</DropdownMenu.CheckboxItem>
				{/each}
				{#if statuses.length > 0}
					<DropdownMenu.Separator />
					<DropdownMenu.Item
						onclick={() => {
							statuses = [];
							pageIndex = 0;
						}}
					>
						Clear filters
					</DropdownMenu.Item>
				{/if}
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</div>

<svelte:boundary>
	{#snippet pending()}
		<div class="grid gap-2">
			<Skeleton class="h-10 w-full" />
			<Skeleton class="h-64 w-full" />
		</div>
	{/snippet}

	{#snippet failed(error, reset)}
		<div class="rounded-lg border border-destructive/50 p-6 text-sm">
			<p class="font-medium text-destructive">Failed to load workflows.</p>
			<p class="mt-1 text-muted-foreground">
				{error instanceof Error ? error.message : String(error)}
			</p>
			<Button class="mt-4" variant="outline" onclick={reset}>Retry</Button>
		</div>
	{/snippet}

	{@const result = await workflowsQuery}
	<WorkflowTable items={result.items} onChanged={() => workflowsQuery.refresh()} />
	<PaginationControls
		bind:pageIndex
		bind:pageSize
		hasMore={result.hasMore}
		itemCount={result.items.length}
	/>
</svelte:boundary>
