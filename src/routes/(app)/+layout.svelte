<script lang="ts">
	import { goto } from '$app/navigation';
	import { authClient } from '#lib/auth-client';
	import * as Sidebar from '#lib/components/ui/sidebar';
	import * as DropdownMenu from '#lib/components/ui/dropdown-menu';

	import AppSidebar from './app-sidebar.svelte';

	let { children, data } = $props();

	let signingOut = $state(false);

	async function signOut(): Promise<void> {
		signingOut = true;
		await authClient.signOut({
			fetchOptions: {
				onSuccess: () => goto('/login')
			}
		});
		signingOut = false;
	}
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="min-w-0">
		<header class="flex h-12 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger />
			<span class="ml-auto text-sm text-muted-foreground">DBOS workflow management</span>
			{#if data.user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger
						class="text-sm text-muted-foreground hover:text-foreground focus-visible:outline-none"
					>
						{data.user.email}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Label class="font-normal text-muted-foreground">
							{data.user.email}
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item disabled={signingOut} onclick={signOut}>Sign out</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{/if}
		</header>
		<main class="flex flex-1 flex-col gap-4 p-4">
			{@render children()}
		</main>
	</Sidebar.Inset>
</Sidebar.Provider>
