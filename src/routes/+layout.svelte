<script lang="ts">
	import '../app.css';

	import { ModeWatcher } from 'mode-watcher';

	import { Toaster } from '#lib/components/ui/sonner';

	let { children } = $props();
</script>

<svelte:head>
	<title>Maestro</title>
</svelte:head>

<ModeWatcher />
{@render children()}
<Toaster position="top-center" richColors />
