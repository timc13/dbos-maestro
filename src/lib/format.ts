export function formatTimestamp(epochMs: number | undefined | null): string {
	if (epochMs === undefined || epochMs === null) return '—';
	return new Date(epochMs).toLocaleString(undefined, {
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
}

export function formatIsoTimestamp(iso: string | null): string {
	if (!iso) return '—';
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? iso : formatTimestamp(date.getTime());
}

export function shortId(id: string, length = 8): string {
	return id.length > length ? `${id.slice(0, length)}…` : id;
}
