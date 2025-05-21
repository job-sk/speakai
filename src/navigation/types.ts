export type RootStackParamList = {
  Welcome: undefined;
  DashboardScreen: undefined;
  UserSignup: undefined;
  UserLoginScreen: undefined;
  QuestionnaireScreen: undefined;
  OnboardingQuestionnaire: undefined;
  VocabularyTest: { onboardingAnswers: any[] };
  VocabularyResult: { onboardingAnswers: any[]; selectedWords: string[] };
  SelfIntroScreen: undefined;
}; 