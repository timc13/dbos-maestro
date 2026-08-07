<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { toast } from 'svelte-sonner';

	import CopyButton from '#lib/components/copy-button.svelte';
	import * as AlertDialog from '#lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '#lib/components/ui/button';
	import * as Dialog from '#lib/components/ui/dialog';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import { Input } from '#lib/components/ui/input';
	import { Label } from '#lib/components/ui/label';
	import * as Table from '#lib/components/ui/table';
	import WorkflowStatusBadge from '#lib/components/workflow-status-badge.svelte';
	import { formatTimestamp, shortId } from '#lib/format';
	import {
		cancelWorkflow,
		deleteWorkflow,
		forkWorkflow,
		getWorkflowInput,
		type WorkflowSummary
	} from '#lib/remote/workflow.remote';
	import { isCancellableStatus, isDeletableStatus } from '#lib/workflow-status';

	let {
		items,
		onChanged
	}: {
		items: WorkflowSummary[];
		onChanged: () => void | Promise<void>;
	} = $props();

	let forkTarget = $state<WorkflowSummary | null>(null);
	let forkStartStep = $state(0);
	let forkBusy = $state(false);
	let deleteTarget = $state<WorkflowSummary | null>(null);
	let deleteBusy = $state(false);
	let inputTarget = $state<WorkflowSummary | null>(null);

	const inputQuery = $derived(inputTarget ? getWorkflowInput(inputTarget.workflowID) : null);

	function errorMessage(err: unknown): string {
		if (err && typeof err === 'object' && 'body' in err) {
			const body = (err as { body?: { message?: string } }).body;
			if (body?.message) return body.message;
		}
		return err instanceof Error ? err.message : String(err);
	}

	async function handleCancel(workflow: WorkflowSummary): Promise<void> {
		try {
			await cancelWorkflow(workflow.workflowID);
			toast.success(`Cancellation requested for ${shortId(workflow.workflowID)}`);
			await onChanged();
		} catch (err) {
			toast.error(`Failed to cancel workflow: ${errorMessage(err)}`);
		}
	}

	function openFork(workflow: WorkflowSummary): void {
		forkTarget = workflow;
		forkStartStep = 0;
	}

	async function handleFork(): Promise<void> {
		const target = forkTarget;
		if (!target) return;
		forkBusy = true;
		try {
			const { newWorkflowID } = await forkWorkflow({
				workflowID: target.workflowID,
				startStep: Math.max(0, Math.floor(Number(forkStartStep) || 0))
			});
			toast.success(`Forked ${shortId(target.workflowID)} → ${newWorkflowID}`);
			forkTarget = null;
			await onChanged();
		} catch (err) {
			toast.error(`Failed to fork workflow: ${errorMessage(err)}`);
		} finally {
			forkBusy = false;
		}
	}

	async function handleDelete(): Promise<void> {
		const target = deleteTarget;
		if (!target) return;
		deleteBusy = true;
		try {
			await deleteWorkflow(target.workflowID);
			toast.success(`Deleted workflow ${shortId(target.workflowID)}`);
			deleteTarget = null;
			await onChanged();
		} catch (err) {
			toast.error(`Failed to delete workflow: ${errorMessage(err)}`);
		} finally {
			deleteBusy = false;
		}
	}
</script>

{#if items.length === 0}
	<div class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
		No workflows found.
	</div>
{:else}
	<div class="overflow-x-auto rounded-lg border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Name</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Queue</Table.Head>
					<Table.Head>Completed</Table.Head>
					<Table.Head>Created</Table.Head>
					<Table.Head class="w-10"></Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each items as workflow (workflow.workflowID)}
					<Table.Row>
						<Table.Cell>
							<div class="flex items-center gap-1">
								<CopyButton text={workflow.workflowID} />
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="font-medium">{workflow.workflowName}</div>
							{#if workflow.workflowClassName}
								<div class="text-xs text-muted-foreground">{workflow.workflowClassName}</div>
							{/if}
						</Table.Cell>
						<Table.Cell><WorkflowStatusBadge status={workflow.status} /></Table.Cell>
						<Table.Cell class="text-muted-foreground">{workflow.queueName ?? '—'}</Table.Cell>
						<Table.Cell class="text-xs text-muted-foreground">
							{formatTimestamp(workflow.completedAt)}
						</Table.Cell>
						<Table.Cell class="text-xs text-muted-foreground">
							{formatTimestamp(workflow.createdAt)}
						</Table.Cell>
						<Table.Cell>
							<DropdownMenu.Root>
								<DropdownMenu.Trigger>
									{#snippet child({ props })}
										<Button {...props} variant="ghost" size="icon" class="size-8">
											<EllipsisIcon />
											<span class="sr-only">Workflow actions</span>
										</Button>
									{/snippet}
								</DropdownMenu.Trigger>
								<DropdownMenu.Content align="end">
									<DropdownMenu.Item
										disabled={!isCancellableStatus(workflow.status)}
										onclick={() => handleCancel(workflow)}
									>
										Cancel
									</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => openFork(workflow)}>Fork…</DropdownMenu.Item>
									<DropdownMenu.Item onclick={() => (inputTarget = workflow)}>
										View input…
									</DropdownMenu.Item>
									<DropdownMenu.Separator />
									<DropdownMenu.Item
										variant="destructive"
										disabled={!isDeletableStatus(workflow.status)}
										onclick={() => (deleteTarget = workflow)}
									>
										Delete…
									</DropdownMenu.Item>
								</DropdownMenu.Content>
							</DropdownMenu.Root>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
{/if}

<Dialog.Root open={forkTarget !== null} onOpenChange={(open) => !open && (forkTarget = null)}>
	<Dialog.Content class="sm:max-w-md">
		<Dialog.Header>
			<Dialog.Title>Fork workflow</Dialog.Title>
			<Dialog.Description>
				Start a new workflow from a step of
				<span class="font-mono text-xs">{forkTarget?.workflowID}</span>. Steps before the start step
				are copied to the new workflow.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-2">
			<Label for="fork-start-step">Start step</Label>
			<Input id="fork-start-step" type="number" min="0" step="1" bind:value={forkStartStep} />
		</div>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (forkTarget = null)}>Cancel</Button>
			<Button disabled={forkBusy} onclick={handleFork}>
				{forkBusy ? 'Forking…' : 'Fork'}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(open) => !open && (deleteTarget = null)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete workflow?</AlertDialog.Title>
			<AlertDialog.Description>
				This permanently removes workflow
				<span class="font-mono text-xs">{deleteTarget?.workflowID}</span> and its history from the system
				database. This action cannot be undone.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				class={buttonVariants({ variant: 'destructive' })}
				disabled={deleteBusy}
				onclick={handleDelete}
			>
				{deleteBusy ? 'Deleting…' : 'Delete'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>

<Dialog.Root open={inputTarget !== null} onOpenChange={(open) => !open && (inputTarget = null)}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Workflow input</Dialog.Title>
			<Dialog.Description>
				<span class="font-mono text-xs">{inputTarget?.workflowID}</span>
			</Dialog.Description>
		</Dialog.Header>
		<svelte:boundary>
			{#snippet pending()}
				<p class="text-sm text-muted-foreground">Loading…</p>
			{/snippet}

			{#snippet failed(error, reset)}
				<div class="text-sm">
					<p class="font-medium text-destructive">Failed to load input.</p>
					<p class="mt-1 text-muted-foreground">
						{error instanceof Error ? error.message : String(error)}
					</p>
					<Button class="mt-4" variant="outline" onclick={reset}>Retry</Button>
				</div>
			{/snippet}

			{#if inputQuery}
				{@const result = await inputQuery}
				<pre class="max-h-96 overflow-auto rounded-md bg-muted p-3 text-xs">{result}</pre>
			{/if}
		</svelte:boundary>
	</Dialog.Content>
</Dialog.Root>
