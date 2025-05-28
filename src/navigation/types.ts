export type RootStackParamList = {
  Welcome: undefined;
  UserSignup: {
    questionnaireData?: {
      age: number;
      nativeLanguage: string;
      englishProficiency: string;
    };
  };
  UserLoginScreen: undefined;
  MainTabs: undefined;
  QuestionnaireScreen: undefined;
  SelfIntroScreen: undefined;
  ReadingSessionScreen: undefined;
  ReadingResultScreen: {
    result: {
      pronunciation_score: number;
      fluency_score: number;
      feedback: string;
      text_with_errors: {
        full_text: string;
        errors: Array<{
          incorrect: string;
          correction: string;
          type: string;
          position: {
            start: number;
            end: number;
          };
          context: string;
        }>;
      };
      areas_to_improve: {
        articles: string[];
        plurals: string[];
        verb_forms: string[];
        word_choice: string[];
      };
      key_errors: string[];
    };
  };
};