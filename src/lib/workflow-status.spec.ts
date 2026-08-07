import { describe, expect, it } from 'vitest';

import { isCancellableStatus, isDeletableStatus, WORKFLOW_STATUSES } from './workflow-status';

describe('isDeletableStatus', () => {
	it('allows only cancelled, successful, and errored workflows', () => {
		expect(WORKFLOW_STATUSES.filter(isDeletableStatus)).toEqual(['SUCCESS', 'ERROR', 'CANCELLED']);
	});
});

describe('isCancellableStatus', () => {
	it('allows only workflows that have not finished', () => {
		expect(WORKFLOW_STATUSES.filter(isCancellableStatus)).toEqual([
			'PENDING',
			'ENQUEUED',
			'DELAYED'
		]);
	});
});
