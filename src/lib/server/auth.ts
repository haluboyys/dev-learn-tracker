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
		DEFAULT_SECRET
	);
}

// Modern Web-standard text encoder/decoder
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function bufToHex(buf: ArrayBuffer): string {
	return Array.from(new Uint8Array(buf))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}

function hexToBuf(hex: string): Uint8Array<ArrayBuffer> {
	const length = hex.length / 2;
	const arrayBuffer = new ArrayBuffer(length);
	const bytes = new Uint8Array(arrayBuffer);
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
		textEncoder.encode(password),
		'PBKDF2',
		false,
		['deriveBits', 'deriveKey']
	);

	const derivedKey = await crypto.subtle.deriveBits(
		{
			name: 'PBKDF2',
			salt: saltBuf,
			iterations: 100000,
			hash: 'SHA-256'
		},
		keyMaterial,
		256
	);

	return `${bufToHex(saltBuf)}:${bufToHex(derivedKey)}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	try {
		const [saltHex, keyHex] = storedHash.split(':');
		if (!saltHex || !keyHex) return false;

		const saltBytes = hexToBuf(saltHex);
		const keyMaterial = await crypto.subtle.importKey(
			'raw',
			textEncoder.encode(password),
			'PBKDF2',
			false,
			['deriveBits', 'deriveKey']
		);

		const derivedKey = await crypto.subtle.deriveBits(
			{
				name: 'PBKDF2',
				salt: saltBytes.buffer,
				iterations: 100000,
				hash: 'SHA-256'
			},
			keyMaterial,
			256
		);

		const computedKeyHex = bufToHex(derivedKey);
		return computedKeyHex === keyHex;
	} catch (err) {
		console.error('Password verification error:', err);
		return false;
	}
}

// Base64URL helper
function base64UrlEncode(str: string): string {
	const bytes = textEncoder.encode(str);
	let binary = '';
	for (let i = 0; i < bytes.byteLength; i++) {
		binary += String.fromCharCode(bytes[i]);
	}
	return btoa(binary)
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
	let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
	while (base64.length % 4) {
		base64 += '=';
	}
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return textDecoder.decode(bytes);
}

// Token Creation & Verification using Web Crypto HMAC-SHA256
async function getHmacKey(secret: string): Promise<CryptoKey> {
	return await crypto.subtle.importKey(
		'raw',
		textEncoder.encode(secret),
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

	const dataStr = base64UrlEncode(JSON.stringify(payload));
	const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(dataStr));
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
			hexToBuf(sigHex).buffer,
			textEncoder.encode(dataStr)
		);

		if (!isValid) return null;

		const json = base64UrlDecode(dataStr);
		const payload = JSON.parse(json) as UserSessionPayload;

		if (payload.exp < Date.now()) {
			return null;
		}

		return payload;
	} catch (e) {
		console.error('Session verification error:', e);
		return null;
	}
}

export function setSessionCookie(event: RequestEvent, token: string) {
	const isProd = event.url.protocol === 'https:' || process.env.NODE_ENV === 'production';
	event.cookies.set('session_auth', token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 30, // 30 days
		secure: isProd
	});
}

export function clearSessionCookie(event: RequestEvent) {
	event.cookies.delete('session_auth', { path: '/' });
}
