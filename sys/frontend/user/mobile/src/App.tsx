import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { setUser, setLoading } from '@/store/authSlice';
import { authService } from '@/services/auth.service';
import { apiClient } from '@/config/api';
import { ENV } from '@/config/env';
import RootNavigator from '@/navigation/RootNavigator';
import type { RootStackParamList } from '@/navigation/types';

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [`${ENV.MOBILE_SCHEME}://`],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'auth/callback',
        },
      },
      Main: {
        screens: {
          HomeTab: {
            screens: {
              Home: 'home',
            },
          },
        },
      },
    },
  },
};

function AppContent() {
  useEffect(() => {
    // Handle deep link when app is already open
    const subscription = Linking.addEventListener('url', async ({ url }) => {
      if (url.includes('auth/callback')) {
        const params = new URL(url).searchParams;
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken && refreshToken) {
          await authService.saveTokens(accessToken, refreshToken);
          store.dispatch(setLoading(true));
          try {
            const res = await apiClient.getMe();
            store.dispatch(setUser(res.data));
          } catch {
            store.dispatch(setLoading(false));
          }
        }
      }
    });

    return () => subscription.remove();
  }, []);

  return <RootNavigator />;
}

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <NavigationContainer linking={linking}>
          <AppContent />
        </NavigationContainer>
      </SafeAreaProvider>
    </Provider>
  );
}
