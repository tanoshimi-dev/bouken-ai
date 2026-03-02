import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ModuleStackParamList } from './types';
import ModuleListScreen from '@/screens/modules/ModuleListScreen';
import ModuleDetailScreen from '@/screens/modules/ModuleDetailScreen';
import LessonScreen from '@/screens/modules/LessonScreen';
import QuizScreen from '@/screens/quiz/QuizScreen';
import QuizResultsScreen from '@/screens/quiz/QuizResultsScreen';
import { colors } from '@/theme/colors';

const Stack = createNativeStackNavigator<ModuleStackParamList>();

export default function ModuleStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="ModuleList"
        component={ModuleListScreen}
        options={{ title: 'Modules' }}
      />
      <Stack.Screen
        name="ModuleDetail"
        component={ModuleDetailScreen}
        options={{ title: 'Module' }}
      />
      <Stack.Screen name="Lesson" component={LessonScreen} options={{ title: 'Lesson' }} />
      <Stack.Screen name="Quiz" component={QuizScreen} options={{ title: 'Quiz' }} />
      <Stack.Screen
        name="QuizResults"
        component={QuizResultsScreen}
        options={{ title: 'Results', headerBackVisible: false }}
      />
    </Stack.Navigator>
  );
}
