import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { UpdateStackParamList } from './types';
import FreshnessOverviewScreen from '@/screens/updates/FreshnessOverviewScreen';
import ToolDetailScreen from '@/screens/updates/ToolDetailScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<UpdateStackParamList>();

export default function UpdateStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="FreshnessOverview"
        component={FreshnessOverviewScreen}
        options={{ title: 'Update Tracker' }}
      />
      <Stack.Screen
        name="ToolDetail"
        component={ToolDetailScreen}
        options={({ route }) => ({ title: route.params.toolSlug })}
      />
    </Stack.Navigator>
  );
}
