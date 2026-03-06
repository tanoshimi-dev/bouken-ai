import type { NavigatorScreenParams } from '@react-navigation/native';

// Auth stack
export type AuthStackParamList = {
  Login: undefined;
};

// Home stack
export type HomeStackParamList = {
  Home: undefined;
};

// Module stack
export type ModuleStackParamList = {
  ContentSelect: undefined;
  ModuleList: { contentType: string };
  ModuleDetail: { contentType: string; moduleId: string };
  Lesson: { contentType: string; moduleId: string; lessonId: string };
  Quiz: { contentType: string; quizId: string };
  QuizResults: {
    score: number;
    maxScore: number;
    percentage: number;
    results: {
      questionId: string;
      correct: boolean;
      correctAnswer: unknown;
      explanation: string;
    }[];
    moduleId: string;
    contentType: string;
  };
};

// Profile stack
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

// Update stack
export type UpdateStackParamList = {
  FreshnessOverview: undefined;
  ToolDetail: { toolSlug: string };
};

// Main tabs
export type MainTabsParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ModulesTab: NavigatorScreenParams<ModuleStackParamList>;
  UpdatesTab: NavigatorScreenParams<UpdateStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// Root
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabsParamList>;
};
