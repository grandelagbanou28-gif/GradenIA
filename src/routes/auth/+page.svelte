<script lang="ts">
	import DOMPurify from 'dompurify';
	import { marked } from 'marked';
	import { toast } from 'svelte-sonner';
	import { onMount, getContext, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	import { getBackendConfig } from '$lib/apis';
	import {
		ldapUserSignIn,
		getSessionUser,
		userSignIn,
		userSignUp,
		updateUserTimezone
	} from '$lib/apis/auths';

	import { WEBUI_API_BASE_URL, WEBUI_BASE_URL } from '$lib/constants';
	import { WEBUI_NAME, config, user, socket } from '$lib/stores';
	import { generateInitialsImage, getUserTimezone } from '$lib/utils';

	import Spinner from '$lib/components/common/Spinner.svelte';
	import OnBoarding from '$lib/components/OnBoarding.svelte';
	import SensitiveInput from '$lib/components/common/SensitiveInput.svelte';

	const i18n = getContext('i18n');

	let loaded = false;
	let mode = $config?.features.enable_ldap ? 'ldap' : 'signin';
	let form = null;

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let ldapUsername = '';
	let showPassword = false;
	let isLoading = false;
	let agreeTerms = false;
	let subscribeNewsletter = true;

	const setSessionUser = async (sessionUser, redirectPath: string | null = null) => {
		if (sessionUser) {
			toast.success($i18n.t(`Welcome to Graden IA!`));
			if (sessionUser.token) {
				localStorage.token = sessionUser.token;
			}
			$socket.emit('user-join', { auth: { token: sessionUser.token } });
			await user.set(sessionUser);
			await config.set(await getBackendConfig());
			const timezone = getUserTimezone();
			if (sessionUser.token && timezone) {
				updateUserTimezone(sessionUser.token, timezone);
			}
			if (!redirectPath) {
				redirectPath = $page.url.searchParams.get('redirect') || '/';
			}
			goto(redirectPath);
			localStorage.removeItem('redirectPath');
		}
	};

	const signInHandler = async () => {
		isLoading = true;
		const sessionUser = await userSignIn(email, password).catch((error) => {
			toast.error(`${error}`);
			return null;
		});
		isLoading = false;
		await setSessionUser(sessionUser);
	};

	const signUpHandler = async () => {
		if ($config?.features?.enable_signup_password_confirmation) {
			if (password !== confirmPassword) {
				toast.error($i18n.t('Passwords do not match.'));
				return;
			}
		}
		isLoading = true;
		const sessionUser = await userSignUp(name, email, password, generateInitialsImage(name)).catch(
			(error) => {
				toast.error(`${error}`);
				return null;
			}
		);
		isLoading = false;
		await setSessionUser(sessionUser);
	};

	const ldapSignInHandler = async () => {
		isLoading = true;
		const sessionUser = await ldapUserSignIn(ldapUsername, password).catch((error) => {
			toast.error(`${error}`);
			return null;
		});
		isLoading = false;
		await setSessionUser(sessionUser);
	};

	const submitHandler = async () => {
		if (mode === 'ldap') {
			await ldapSignInHandler();
		} else if (mode === 'signin') {
			await signInHandler();
		} else {
			await signUpHandler();
		}
	};

	const oauthCallbackHandler = async () => {
		function getCookie(name) {
			const match = document.cookie.match(
				new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
			);
			return match ? decodeURIComponent(match[1]) : null;
		}
		const token = getCookie('token');
		if (!token) return;
		const sessionUser = await getSessionUser(token).catch((error) => {
			toast.error(`${error}`);
			return null;
		});
		if (!sessionUser) return;
		localStorage.token = token;
		await setSessionUser(sessionUser, localStorage.getItem('redirectPath') || null);
	};

	let onboarding = false;

	onMount(async () => {
		const redirectPath = $page.url.searchParams.get('redirect');
		if ($user !== undefined) {
			goto(redirectPath || '/');
		} else {
			if (redirectPath) localStorage.setItem('redirectPath', redirectPath);
		}

		const error = $page.url.searchParams.get('error');
		if (error) toast.error(error);

		await oauthCallbackHandler();
		form = $page.url.searchParams.get('form');

		if ($config?.oauth?.auto_redirect && !form && !error) {
			const providers = Object.keys($config?.oauth?.providers ?? {});
			if (
				providers.length === 1 &&
				$config?.features?.auth !== false &&
				$config?.features?.enable_login_form === false &&
				!$config?.features?.enable_ldap &&
				!$config?.features?.auth_trusted_header &&
				!$config?.onboarding &&
				!localStorage.token &&
				!document.cookie.split('; ').some((c) => c.startsWith('token='))
			) {
				window.location.href = `${WEBUI_BASE_URL}/oauth/${providers[0]}/login`;
				return;
			}
		}

		loaded = true;

		if (($config?.features?.auth_trusted_header ?? false) || $config?.features?.auth === false) {
			await signInHandler();
		} else {
			onboarding = $config?.onboarding ?? false;
		}
	});
</script>

<svelte:head>
	<title>{`${$WEBUI_NAME} - ${mode === 'signin' ? 'Connexion' : 'Inscription'}`}</title>
</svelte:head>

<OnBoarding
	bind:show={onboarding}
	getStartedHandler={() => {
		onboarding = false;
		mode = $config?.features.enable_ldap ? 'ldap' : 'signup';
	}}
/>

{#if loaded}
<div class="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
	<!-- Background decorative elements -->
	<div class="absolute inset-0 overflow-hidden pointer-events-none">
		<div class="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
		<div class="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
		<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-3xl"></div>
	</div>

	<!-- Auth Card -->
	<div class="relative z-10 w-full max-w-md mx-4">
		<!-- Logo -->
		<div class="text-center mb-8">
			<img src="/static/graden_blue.png" alt="Graden IA" class="w-16 h-16 rounded-2xl shadow-2xl mx-auto mb-4" />
			<h1 class="text-2xl font-bold text-white tracking-tight">Graden IA</h1>
		</div>

		<!-- Card -->
		<div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
			{#if ($config?.features.auth_trusted_header ?? false) || $config?.features.auth === false}
				<div class="text-center">
					<div class="text-lg text-white/80">
						Connexion en cours...
					</div>
					<Spinner className="size-6 mx-auto mt-4" />
				</div>
			{:else}
				<!-- Title -->
				<h2 class="text-xl font-bold text-white text-center mb-6">
					{#if $config?.onboarding ?? false}
						Bienvenue sur Graden IA
					{:else if mode === 'ldap'}
						CONNEXION LDAP
					{:else if mode === 'signin'}
						CONNEXION
					{:else}
						INSCRIPTION
					{/if}
				</h2>

				<!-- Google OAuth -->
				{#if $config?.oauth?.providers?.google}
					<button
						class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm text-gray-700 shadow-lg"
						on:click={() => {
							window.location.href = `${WEBUI_BASE_URL}/oauth/google/login`;
						}}
					>
						<svg width="20" height="20" viewBox="0 0 48 48">
							<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
							<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
							<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
							<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
							<path fill="none" d="M0 0h48v48H0z"/>
						</svg>
						Continuer avec Google
					</button>
				{/if}

				<!-- GitHub OAuth -->
				{#if $config?.oauth?.providers?.github}
					<button
						class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm text-gray-700 shadow-lg {($config?.oauth?.providers?.google) ? 'mt-3' : ''}"
						on:click={() => {
							window.location.href = `${WEBUI_BASE_URL}/oauth/github/login`;
						}}
					>
						<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
							<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
						</svg>
						Continuer avec GitHub
					</button>
				{/if}

				<!-- Divider -->
				{#if ($config?.oauth?.providers?.google || $config?.oauth?.providers?.github) && ($config?.features.enable_login_form || $config?.features.enable_ldap || form)}
					<div class="flex items-center gap-4 my-6">
						<div class="flex-1 h-px bg-white/20"></div>
						<span class="text-xs text-white/50 font-medium">ou</span>
						<div class="flex-1 h-px bg-white/20"></div>
					</div>
				{/if}

				<!-- Login/Signup Form -->
				{#if $config?.features.enable_login_form || $config?.features.enable_ldap || form}
					<form on:submit={(e) => { e.preventDefault(); submitHandler(); }} class="space-y-4">
						{#if mode === 'signup'}
							<div>
								<label for="name" class="block text-sm font-medium text-white/80 mb-1.5">Nom complet</label>
								<input
									bind:value={name}
									type="text"
									id="name"
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-sm"
									placeholder="Jean Dupont"
									autocomplete="name"
									required
								/>
							</div>
						{/if}

						{#if mode === 'ldap'}
							<div>
								<label for="username" class="block text-sm font-medium text-white/80 mb-1.5">Nom d'utilisateur</label>
								<input
									bind:value={ldapUsername}
									type="text"
									id="username"
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-sm"
									placeholder="votre-identifiant"
									autocomplete="username"
									required
								/>
							</div>
						{:else}
							<div>
								<label for="email" class="block text-sm font-medium text-white/80 mb-1.5">Email</label>
								<input
									bind:value={email}
									type="email"
									id="email"
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-sm"
									placeholder="vous@example.com"
									autocomplete="email"
									required
								/>
							</div>
						{/if}

						<div>
							<div class="flex items-center justify-between mb-1.5">
								<label for="password" class="block text-sm font-medium text-white/80">Mot de passe</label>
								{#if mode === 'signin'}
									<a href="{WEBUI_BASE_URL}/auth/password/reset" class="text-xs text-blue-300 hover:text-blue-200 transition-colors">
										Mot de passe oublie ?
									</a>
								{/if}
							</div>
							<SensitiveInput
								bind:value={password}
								type="password"
								id="password"
								class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-sm"
								placeholder={mode === 'signin' ? 'Entrez votre mot de passe' : 'Choisissez un mot de passe'}
								autocomplete={mode === 'signup' ? 'new-password' : 'current-password'}
								required
							/>
						</div>

						{#if mode === 'signup' && $config?.features?.enable_signup_password_confirmation}
							<div>
								<label for="confirm-password" class="block text-sm font-medium text-white/80 mb-1.5">Confirmer le mot de passe</label>
								<SensitiveInput
									bind:value={confirmPassword}
									type="password"
									id="confirm-password"
									class="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-sm"
									placeholder="Confirmez votre mot de passe"
									autocomplete="new-password"
									required
								/>
							</div>
						{/if}

						<button
							type="submit"
							disabled={isLoading}
							class="w-full py-3 px-4 bg-blue-500 hover:bg-blue-400 disabled:bg-blue-600/50 text-white font-semibold rounded-xl transition-colors text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
						>
							{#if isLoading}
								<Spinner className="size-4" />
							{:else}
								{mode === 'signin' ? 'CONNEXION' : ($config?.onboarding ?? false) ? 'CREER LE COMPTE ADMIN' : 'INSCRIPTION'}
							{/if}
						</button>
					</form>

					<!-- Terms & Privacy -->
					<div class="mt-4 text-xs text-center text-white/40 leading-relaxed">
						En {mode === 'signin' ? 'vous connectant' : 'vous inscrivant'}, vous acceptez nos
						<a href="/terms" class="text-blue-300 hover:text-blue-200 underline">Conditions d'utilisation</a>
						et notre
						<a href="/privacy" class="text-blue-300 hover:text-blue-200 underline">Politique de confidentialite</a>.
					</div>

					<!-- Toggle Sign in / Sign up -->
					{#if $config?.features.enable_signup && !($config?.onboarding ?? false)}
						<div class="mt-6 text-center text-sm text-white/50">
							{mode === 'signin' ? 'Nouveau sur Graden IA ?' : 'Deja un compte ?'}
							<button
								class="font-semibold text-blue-300 hover:text-blue-200 transition-colors"
								type="button"
								on:click={() => { mode = mode === 'signin' ? 'signup' : 'signin'; }}
							>
								{mode === 'signin' ? 'CREER UN COMPTE' : 'CONNEXION'}
							</button>
						</div>
					{/if}

					<!-- LDAP Toggle -->
					{#if $config?.features.enable_ldap && $config?.features.enable_login_form}
						<div class="mt-4 text-center">
							<button
								class="text-xs text-white/40 hover:text-white/60 transition-colors underline"
								type="button"
								on:click={() => { mode = mode === 'ldap' ? 'signin' : 'ldap'; }}
							>
								{mode === 'ldap' ? 'Utiliser email' : 'Utiliser LDAP'}
							</button>
						</div>
					{/if}
				{/if}

				<!-- Other OAuth providers -->
				{#if $config?.oauth?.providers}
					{#each Object.entries($config.oauth.providers) as [provider, enabled]}
						{#if enabled && provider !== 'google' && provider !== 'github'}
							<div class="mt-3">
								<button
									class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 rounded-xl transition-colors font-medium text-sm text-gray-700 shadow-lg"
									on:click={() => { window.location.href = `${WEBUI_BASE_URL}/oauth/${provider}/login`; }}
								>
									Continuer avec {provider}
								</button>
							</div>
						{/if}
					{/each}
				{/if}

				<!-- Footer -->
				{#if $config?.metadata?.login_footer}
					<div class="mt-6 text-xs text-center text-white/40">
						{@html DOMPurify.sanitize(marked($config.metadata.login_footer))}
					</div>
				{/if}
			{/if}
		</div>

		<!-- Footer Brand -->
		<div class="mt-6 text-center text-xs text-white/30">
			Graden IA &copy; 2026 &mdash; Fait par
			<a href="https://github.com/grandelagbanou28-gif" target="_blank" class="underline hover:text-white/50 transition-colors">Grandel Agbanou</a>
		</div>
	</div>
</div>
{/if}
