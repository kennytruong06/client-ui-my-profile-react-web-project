const PASSWORD_HASH = 'af66192dd25e871bfb51f3b9ec26bc1ac0e0cbcfec0ce39fc3ba3b628274fd5f';
const SESSION_KEY = 'kp.unlocked';

async function sha256(text) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buffer)).map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(password) {
    return (await sha256(password)) === PASSWORD_HASH;
}

export function isUnlocked() {
    try {
        return sessionStorage.getItem(SESSION_KEY) === PASSWORD_HASH;
    } catch {
        return false;
    }
}

export function rememberUnlock() {
    try {
        sessionStorage.setItem(SESSION_KEY, PASSWORD_HASH);
    } catch {
        return;
    }
}

export function forgetUnlock() {
    try {
        sessionStorage.removeItem(SESSION_KEY);
    } catch {
        return;
    }
}
