<script lang="ts">
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ChevronsLeftIcon from '@lucide/svelte/icons/chevrons-left';

	import { Button } from '#lib/components/ui/button';
	import * as Select from '#lib/components/ui/select';

	let {
		pageIndex = $bindable(),
		pageSize = $bindable(),
		hasMore,
		itemCount
	}: {
		pageIndex: number;
		pageSize: number;
		hasMore: boolean;
		itemCount: number;
	} = $props();

	const pageSizes = ['10', '25', '50', '100'];
</script>

<div class="flex items-center justify-between gap-4">
	<div class="flex items-center gap-2 text-sm text-muted-foreground">
		<span>Rows per page</span>
		<Select.Root
			type="single"
			value={String(pageSize)}
			onValueChange={(value) => {
				pageSize = Number(value);
				pageIndex = 0;
			}}
		>
			<Select.Trigger class="h-8 w-20" size="sm">{pageSize}</Select.Trigger>
			<Select.Content>
				{#each pageSizes as size (size)}
					<Select.Item value={size}>{size}</Select.Item>
				{/each}
			</Select.Content>
		</Select.Root>
	</div>
	<div class="flex items-center gap-2">
		<span class="text-sm text-muted-foreground">
			Page {pageIndex + 1}
			{#if itemCount > 0}
				· {itemCount} row{itemCount === 1 ? '' : 's'}
			{/if}
		</span>
		<Button
			variant="outline"
			size="icon"
			class="size-8"
			disabled={pageIndex === 0}
			onclick={() => (pageIndex = 0)}
		>
			<ChevronsLeftIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			class="size-8"
			disabled={pageIndex === 0}
			onclick={() => (pageIndex -= 1)}
		>
			<ChevronLeftIcon />
		</Button>
		<Button
			variant="outline"
			size="icon"
			class="size-8"
			disabled={!hasMore}
			onclick={() => (pageIndex += 1)}
		>
			<ChevronRightIcon />
		</Button>
	</div>
</div>
