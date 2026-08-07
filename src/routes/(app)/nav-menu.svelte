<script lang="ts">
	import type { Icon } from '@lucide/svelte';

	import { page } from '$app/state';
	import * as Sidebar from '#lib/components/ui/sidebar';

	export type MenuItems = {
		title: string;
		url: string;
		icon?: typeof Icon;
	}[];
	let { title, items }: { title: string; items: MenuItems } = $props();

	function isActive(url: string): boolean {
		const pathname = page.url.pathname;
		return url === '/' ? pathname === '/' : pathname === url || pathname.startsWith(`${url}/`);
	}
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel>{title}</Sidebar.GroupLabel>
	<Sidebar.Menu>
		{#each items as item (item.title)}
			<Sidebar.MenuItem>
				<Sidebar.MenuButton tooltipContent={item.title} isActive={isActive(item.url)}>
					{#snippet child({ props })}
						<a href={item.url} {...props}>
							<item.icon />
							<span>{item.title}</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		{/each}
	</Sidebar.Menu>
</Sidebar.Group>
