<script lang="ts">
	import { CopyIcon } from '@lucide/svelte';

	import { Button } from '#lib/components/ui/button';
	import * as Tooltip from '#lib/components/ui/tooltip';

	let { text }: { text?: string } = $props();

	let copied = $state(false);

	function handleClick(): void {
		if (text) {
			void navigator.clipboard.writeText(text);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		}
	}
</script>

<Tooltip.Provider>
	<Tooltip.Root disableCloseOnTriggerClick>
		<Tooltip.Trigger>
			{#snippet child({ props })}
				<Button {...props} onclick={handleClick} variant="outline" size="icon" class="size-8">
					<CopyIcon />
				</Button>
			{/snippet}
		</Tooltip.Trigger>
		<Tooltip.Portal>
			<Tooltip.Content>{copied ? 'Copied!' : text}</Tooltip.Content>
		</Tooltip.Portal>
	</Tooltip.Root>
</Tooltip.Provider>
