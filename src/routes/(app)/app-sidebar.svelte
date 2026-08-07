<script lang="ts" module>
	import CalendarClockIcon from '@lucide/svelte/icons/calendar-clock';
	import WorkflowIcon from '@lucide/svelte/icons/workflow';

	import type { MenuItems } from './nav-menu.svelte';

	const navMain: MenuItems = [
		{
			title: 'Workflows',
			url: '/workflows',
			icon: WorkflowIcon
		},
		{
			title: 'Schedules',
			url: '/schedules',
			icon: CalendarClockIcon
		}
	];
</script>

<script lang="ts">
	import type { ComponentProps } from 'svelte';

	import * as Sidebar from '#lib/components/ui/sidebar';

	import NavMenu from './nav-menu.svelte';

	let { collapsible = 'icon', ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {collapsible} {...restProps}>
	<Sidebar.Header class="h-12 flex-row border-b">
		<div
			class="grow content-center truncate pl-1.5 font-semibold group-has-data-[collapsible=icon]/sidebar-wrapper:hidden"
		>
			Maestro
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavMenu title="Conduct" items={navMain} />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>
