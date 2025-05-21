export type RootStackParamList = {
  Welcome: undefined;
  Home: undefined;
  Dashboard: undefined;
  UserSignup: undefined;
  UserLoginScreen: undefined;
  OnboardingQuestionnaire: undefined;
  VocabularyTest: { onboardingAnswers: any[] };
  VocabularyResult: { onboardingAnswers: any[]; selectedWords: string[] };
}; 