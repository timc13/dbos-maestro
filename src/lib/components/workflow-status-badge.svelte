<script lang="ts">
	import { Badge } from '#lib/components/ui/badge';
	import { cn } from '#lib/utils';

	let { status }: { status: string } = $props();

	const statusClasses: Record<string, string> = {
		SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
		PENDING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
		ENQUEUED: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
		DELAYED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
		ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
		MAX_RECOVERY_ATTEMPTS_EXCEEDED: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
		CANCELLED: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
	};
</script>

<Badge variant="outline" class={cn('border-transparent font-medium', statusClasses[status])}>
	{status}
</Badge>
