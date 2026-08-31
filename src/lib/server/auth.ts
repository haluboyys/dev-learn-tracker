import type { RequestEvent } from '@sveltejs/kit';

export interface UserSessionPayload {
	userId: string;
	email: string;
	name: string;
	exp: number;
}

const DEFAULT_SECRET = 'learn-tracker-super-secret-key-2026-cloudflare-compatible';

function getAuthSecret(platform?: Readonly<App.Platform> | App.Platform): string {
	return (
		platform?.env?.AUTH_SECRET ||
		platform?.env?.ACCESS_CODE ||
		(typeof process !== 'undefined' ? process.env?.AUTH_SECRET || process.env?.ACCESS_CODE : null) ||
		DEFAULT_SECRET
	);
}

// Convert string to Uint8Array with ArrayBuffer
function strToBuf(str: string): Uint8Array<ArrayBuffer> {
	const buf = new ArrayBuffer(str.length);
	const view = new Uint8Array(buf);
	for (let i = 0; i < str.length; i++) {
		view[i] = str.charCodeAt(i);
	}
	return view;
}

// UTF-8 string to ArrayBuffer
function utf8ToBuf(str: string): Uint8Array<ArrayBuffer> {
	const utf8 = unescape(encodeURIComponent(str));
	return strToBuf(utf8);
}

// Convert buffer to hex string
function bufToHex(buf: ArrayBuffer): string {
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

// Convert hex string to Uint8Array with standard ArrayBuffer
function hexToBuf(hex: string): Uint8Array<ArrayBuffer> {
	const length = hex.length / 2;
	const buf = new ArrayBuffer(length);
	const bytes = new Uint8Array(buf);
	for (let i = 0; i < length; i++) {
		bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
	}
	return bytes;
}

// PBKDF2 Password Hashing (compatible with Cloudflare Workers / Web Crypto)
export async function hashPassword(password: string): Promise<string> {
	const saltBuf = new ArrayBuffer(16);
	const salt = new Uint8Array(saltBuf);
	crypto.getRandomValues(salt);

	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		utf8ToBuf(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);

	const derivedKey = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	return `${bufToHex(salt.buffer)}:${bufToHex(derivedKey)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, keyHex] = storedHash.split(':');
	if (!saltHex || !keyHex) return false;

	const salt = hexToBuf(saltHex);
	const keyMaterial = await crypto.subtle.importKey(
		'raw',
		utf8ToBuf(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);

	const derivedKey = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	const computedKeyHex = bufToHex(derivedKey);
	return computedKeyHex === keyHex;
}

// Token Creation & Verification using Web Crypto HMAC-SHA256
async function getHmacKey(secret: string): Promise<CryptoKey> {
	return await crypto.subtle.importKey(
		'raw',
		utf8ToBuf(secret),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign', 'verify']
	);
}

export async function createSessionToken(
	user: { id: string; email: string; name: string },
	platform?: Readonly<App.Platform> | App.Platform
): Promise<string> {
	const payload: UserSessionPayload = {
		userId: user.id,
		email: user.email,
		name: user.name,
		exp: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
	};

	const secret = getAuthSecret(platform);
	const key = await getHmacKey(secret);

	const dataStr = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
	const signature = await crypto.subtle.sign('HMAC', key, utf8ToBuf(dataStr));
	const sigHex = bufToHex(signature);

	return `${dataStr}.${sigHex}`;
}

export async function verifySessionToken(
	token: string,
	platform?: Readonly<App.Platform> | App.Platform
): Promise<UserSessionPayload | null> {
	if (!token || !token.includes('.')) return null;

	try {
		const [dataStr, sigHex] = token.split('.');
		const secret = getAuthSecret(platform);
		const key = await getHmacKey(secret);

		const isValid = await crypto.subtle.verify(
			'HMAC',
			key,
			hexToBuf(sigHex),
			utf8ToBuf(dataStr)
		);

		if (!isValid) return null;

		const json = decodeURIComponent(escape(atob(dataStr)));
		const payload = JSON.parse(json) as UserSessionPayload;

		if (payload.exp < Date.now()) {
			return null;
		}

		return payload;
	} catch (e) {
		return null;
	}
}

export function setSessionCookie(event: RequestEvent, token: string) {
	event.cookies.set('session_auth', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		secure: process.env.NODE_ENV === 'production'
	});
}

export function clearSessionCookie(event: RequestEvent) {
	event.cookies.delete('session_auth', { path: '/' });
}
