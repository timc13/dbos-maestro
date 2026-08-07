<script lang="ts">
	import { page } from '$app/state';
	import { authClient } from '#lib/auth-client';
	import { Button } from '#lib/components/ui/button';
	import * as Card from '#lib/components/ui/card';

	let signingIn = $state(false);

	const redirectTo = $derived.by(() => {
		const target = page.url.searchParams.get('redirectTo');
		return target && target.startsWith('/') && !target.startsWith('//') ? target : '/';
	});

	async function signInWithGoogle(): Promise<void> {
		signingIn = true;
		await authClient.signIn.social({ provider: 'google', callbackURL: redirectTo });
	}
</script>

<svelte:head>
	<title>Sign in — Maestro</title>
</svelte:head>

<div class="flex min-h-svh items-center justify-center p-4">
	<Card.Root class="w-full max-w-sm">
		<Card.Header>
			<Card.Title>Sign in to Maestro</Card.Title>
			<Card.Description>DBOS workflow management</Card.Description>
		</Card.Header>
		<Card.Content>
			<Button variant="outline" class="w-full" disabled={signingIn} onclick={signInWithGoogle}>
				<svg viewBox="0 0 24 24" class="size-4" aria-hidden="true">
					<path
						fill="#4285F4"
						d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
					/>
					<path
						fill="#34A853"
						d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.11A11.998 11.998 0 0 0 12 24Z"
					/>
					<path
						fill="#FBBC05"
						d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.27A11.998 11.998 0 0 0 0 12c0 1.94.46 3.77 1.27 5.39l4-3.11Z"
					/>
					<path
						fill="#EA4335"
						d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.27 6.61l4 3.11C6.22 6.86 8.87 4.75 12 4.75Z"
					/>
				</svg>
				Continue with Google
			</Button>
		</Card.Content>
	</Card.Root>
</div>
