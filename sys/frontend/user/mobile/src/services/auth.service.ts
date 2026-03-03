import * as Keychain from 'react-native-keychain';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import { Linking } from 'react-native';
import { ENV } from '@/config/env';
import type { OAuthProvider } from '@learn-ai/shared-types';

const KEYCHAIN_SERVICE = 'learnclaudecode-auth';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

// In-memory cache for fast synchronous access
let cachedAccessToken: string | null = null;

export const authService = {
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    cachedAccessToken = accessToken;
    await Keychain.setGenericPassword(
      'tokens',
      JSON.stringify({ accessToken, refreshToken }),
      { service: KEYCHAIN_SERVICE },
    );
  },

  async loadTokens(): Promise<Tokens | null> {
    const credentials = await Keychain.getGenericPassword({
      service: KEYCHAIN_SERVICE,
    });
    if (!credentials) return null;

    const tokens: Tokens = JSON.parse(credentials.password);
    cachedAccessToken = tokens.accessToken;
    return tokens;
  },

  async clearTokens(): Promise<void> {
    cachedAccessToken = null;
    await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICE });
  },

  getAccessToken(): string | null {
    return cachedAccessToken;
  },

  async loginWithProvider(provider: OAuthProvider): Promise<Tokens | null> {
    const url = `${ENV.API_URL}/api/auth/${provider}?platform=mobile`;
    console.log('[Auth] loginWithProvider:', provider, 'url:', url);

    const available = await InAppBrowser.isAvailable();
    console.log('[Auth] InAppBrowser available:', available);

    if (available) {
      const redirectUrl = `${ENV.MOBILE_SCHEME}://auth/callback`;
      console.log('[Auth] Opening InAppBrowser with redirectUrl:', redirectUrl);

      const result = await InAppBrowser.openAuth(url, redirectUrl, {
        ephemeralWebSession: true,
        showTitle: false,
        enableUrlBarHiding: true,
        enableDefaultShare: false,
      });

      console.log('[Auth] InAppBrowser result:', JSON.stringify(result));

      if (result.type === 'success' && result.url) {
        const tokens = parseCallbackUrl(result.url);
        console.log('[Auth] Parsed tokens:', tokens ? 'found' : 'null');
        return tokens;
      }
      console.log('[Auth] InAppBrowser result type:', result.type);
      return null;
    }

    // Fallback to external browser
    console.log('[Auth] Fallback to Linking.openURL');
    await Linking.openURL(url);
    return null;
  },

  async refreshAccessToken(): Promise<Tokens | null> {
    const currentTokens = await authService.loadTokens();
    if (!currentTokens?.refreshToken) return null;

    const res = await fetch(`${ENV.API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: currentTokens.refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.accessToken && data.refreshToken) {
      await authService.saveTokens(data.accessToken, data.refreshToken);
      return { accessToken: data.accessToken, refreshToken: data.refreshToken };
    }
    return null;
  },
};

function parseCallbackUrl(url: string): Tokens | null {
  // Hermes doesn't implement URLSearchParams.get, so parse manually
  const queryString = url.split('?')[1];
  if (!queryString) return null;

  const params: Record<string, string> = {};
  for (const pair of queryString.split('&')) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }

  const accessToken = params['access_token'];
  const refreshToken = params['refresh_token'];
  if (accessToken && refreshToken) {
    return { accessToken, refreshToken };
  }
  return null;
}
