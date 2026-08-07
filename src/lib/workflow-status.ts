export const WORKFLOW_STATUSES = [
	'PENDING',
	'SUCCESS',
	'ERROR',
	'MAX_RECOVERY_ATTEMPTS_EXCEEDED',
	'CANCELLED',
	'ENQUEUED',
	'DELAYED'
] as const;

export type WorkflowStatusName = (typeof WORKFLOW_STATUSES)[number];

export const MAX_PAGE_SIZE = 100;

export function isDeletableStatus(status: string): boolean {
	return status === 'CANCELLED' || status === 'SUCCESS' || status === 'ERROR';
}

export function isCancellableStatus(status: string): boolean {
	return status === 'PENDING' || status === 'ENQUEUED' || status === 'DELAYED';
}
