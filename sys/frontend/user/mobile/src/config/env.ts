// Use localhost for both platforms.
// Android emulator requires: adb reverse tcp:4000 tcp:4000
// This ensures InAppBrowser OAuth redirects (which use localhost) work correctly.
const DEFAULT_API_URL = 'http://localhost:4000';

export const ENV = {
  API_URL: DEFAULT_API_URL,
  MOBILE_SCHEME: 'learnclaudecode',
} as const;
