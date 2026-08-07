<script lang="ts">
	import EllipsisIcon from '@lucide/svelte/icons/ellipsis';
	import { toast } from 'svelte-sonner';

	import * as AlertDialog from '#lib/components/ui/alert-dialog';
	import { Badge } from '#lib/components/ui/badge';
	import { Button, buttonVariants } from '#lib/components/ui/button';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';
	import { Skeleton } from '#lib/components/ui/skeleton';
	import * as Table from '#lib/components/ui/table';
	import { formatIsoTimestamp } from '#lib/format';
	import { deleteSchedule, listSchedules, type ScheduleSummary } from '#lib/remote/schedule.remote';

	let deleteTarget = $state<ScheduleSummary | null>(null);
	let deleteBusy = $state(false);

	async function handleDelete(): Promise<void> {
		const target = deleteTarget;
		if (!target) return;
		deleteBusy = true;
		try {
			await deleteSchedule(target.scheduleName);
			toast.success(`Deleted schedule ${target.scheduleName}`);
			deleteTarget = null;
		} catch (err) {
			toast.error(`Failed to delete schedule: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			deleteBusy = false;
		}
	}
</script>

<div class="flex items-center justify-between gap-4">
	<h1 class="text-2xl font-bold">Schedules</h1>
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
			<p class="font-medium text-destructive">Failed to load schedules.</p>
			<p class="mt-1 text-muted-foreground">
				{error instanceof Error ? error.message : String(error)}
			</p>
			<Button class="mt-4" variant="outline" onclick={reset}>Retry</Button>
		</div>
	{/snippet}

	{@const schedules = await listSchedules()}
	{#if schedules.length === 0}
		<div class="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
			No workflow schedules found.
		</div>
	{:else}
		<div class="overflow-x-auto rounded-lg border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Name</Table.Head>
						<Table.Head>Workflow</Table.Head>
						<Table.Head>Cron</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Timezone</Table.Head>
						<Table.Head>Queue</Table.Head>
						<Table.Head>Last fired</Table.Head>
						<Table.Head class="w-10"></Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each schedules as schedule (schedule.scheduleId)}
						<Table.Row>
							<Table.Cell class="font-medium">{schedule.scheduleName}</Table.Cell>
							<Table.Cell>
								<div>{schedule.workflowName}</div>
								{#if schedule.workflowClassName}
									<div class="text-xs text-muted-foreground">{schedule.workflowClassName}</div>
								{/if}
							</Table.Cell>
							<Table.Cell class="font-mono text-xs">{schedule.schedule}</Table.Cell>
							<Table.Cell>
								<Badge
									variant={schedule.status.toLowerCase() === 'active' ? 'default' : 'secondary'}
								>
									{schedule.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{schedule.cronTimezone ?? '—'}</Table.Cell>
							<Table.Cell class="text-muted-foreground">{schedule.queueName ?? '—'}</Table.Cell>
							<Table.Cell class="text-xs text-muted-foreground">
								{formatIsoTimestamp(schedule.lastFiredAt)}
							</Table.Cell>
							<Table.Cell>
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="size-8">
												<EllipsisIcon />
												<span class="sr-only">Schedule actions</span>
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end">
										<DropdownMenu.Item
											variant="destructive"
											onclick={() => (deleteTarget = schedule)}
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
</svelte:boundary>

<AlertDialog.Root
	open={deleteTarget !== null}
	onOpenChange={(open) => !open && (deleteTarget = null)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Delete schedule?</AlertDialog.Title>
			<AlertDialog.Description>
				This removes schedule <span class="font-medium">{deleteTarget?.scheduleName}</span>. The
				workflow will no longer run on its cron schedule. This action cannot be undone.
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
