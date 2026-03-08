import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "sv" | "en";

interface Translations {
  [key: string]: { sv: string; en: string };
}

const translations: Translations = {
  // Login page
  welcome: { sv: "Välkommen till", en: "Welcome to" },
  appName: { sv: "MurciélagoLingo", en: "MurciélagoLingo" },
  appTagline: { sv: "Lär dig spanska på ett roligt sätt!", en: "Learn Spanish the fun way!" },
  username: { sv: "Användarnamn", en: "Username" },
  email: { sv: "E-postadress", en: "Email address" },
  password: { sv: "Lösenord", en: "Password" },
  showPassword: { sv: "Visa lösenord", en: "Show password" },
  login: { sv: "Logga in", en: "Log in" },
  register: { sv: "Registrera konto", en: "Create account" },
  forgotPassword: { sv: "Glömt lösenord?", en: "Forgot password?" },
  orLoginWith: { sv: "Eller logga in med", en: "Or log in with" },
  learnFrom: { sv: "Jag lär mig från", en: "I'm learning from" },
  swedish: { sv: "Svenska", en: "Swedish" },
  english: { sv: "Engelska", en: "English" },

  // Register page
  createAccount: { sv: "Skapa nytt konto", en: "Create new account" },
  registerInfo: { sv: "Registrera dig för att börja din resa med att lära dig spanska. Det är gratis och tar bara en minut!", en: "Sign up to start your journey learning Spanish. It's free and only takes a minute!" },
  confirmPassword: { sv: "Bekräfta lösenord", en: "Confirm password" },
  registerWithGoogle: { sv: "Registrera med Google", en: "Sign up with Google" },
  alreadyHaveAccount: { sv: "Har du redan ett konto?", en: "Already have an account?" },
  passwordRequirements: { sv: "Lösenordet måste vara minst 8 tecken, innehålla en stor bokstav, en siffra och ett specialtecken.", en: "Password must be at least 8 characters, contain an uppercase letter, a number and a special character." },
  verificationSent: { sv: "Verifieringsmail skickat!", en: "Verification email sent!" },
  checkEmail: { sv: "Kontrollera din e-post för att verifiera ditt konto.", en: "Check your email to verify your account." },

  // Forgot password
  forgotPasswordTitle: { sv: "Återställ lösenord", en: "Reset password" },
  forgotPasswordInfo: { sv: "Ange din e-postadress så skickar vi instruktioner för att återställa ditt lösenord.", en: "Enter your email address and we'll send you instructions to reset your password." },
  sendResetLink: { sv: "Skicka återställningslänk", en: "Send reset link" },
  backToLogin: { sv: "Tillbaka till inloggning", en: "Back to login" },
  resetSent: { sv: "Återställningsmail skickat!", en: "Reset email sent!" },
  resetSentInfo: { sv: "Om ett konto med denna e-postadress finns kommer du få ett mail med instruktioner.", en: "If an account with this email exists, you'll receive an email with instructions." },

  // Reset password
  resetPasswordTitle: { sv: "Ange nytt lösenord", en: "Set new password" },
  newPassword: { sv: "Nytt lösenord", en: "New password" },
  confirmNewPassword: { sv: "Bekräfta nytt lösenord", en: "Confirm new password" },
  resetPassword: { sv: "Återställ lösenord", en: "Reset password" },
  passwordHistory: { sv: "Lösenordet får inte vara samma som något av dina 5 senaste lösenord.", en: "Password cannot be the same as any of your last 5 passwords." },

  // Dashboard
  dashboard: { sv: "Startsida", en: "Dashboard" },
  exercises: { sv: "Övningar", en: "Exercises" },
  profile: { sv: "Profil", en: "Profile" },
  logout: { sv: "Logga ut", en: "Log out" },
  welcomeBack: { sv: "Välkommen tillbaka!", en: "Welcome back!" },
  chooseExercise: { sv: "Välj en övning för att börja lära dig:", en: "Choose an exercise to start learning:" },

  // Exercises
  verbs: { sv: "Verb", en: "Verbs" },
  verbsDesc: { sv: "Öva på spanska verb i olika tidsformer", en: "Practice Spanish verbs in different tenses" },
  nouns: { sv: "Substantiv", en: "Nouns" },
  nounsDesc: { sv: "Lär dig spanska substantiv och deras genus", en: "Learn Spanish nouns and their genders" },
  adjectives: { sv: "Adjektiv", en: "Adjectives" },
  adjectivesDesc: { sv: "Öva på spanska adjektiv och deras böjningar", en: "Practice Spanish adjectives and their forms" },
  quiz: { sv: "Förhör", en: "Quiz" },
  quizDesc: { sv: "Testa dina kunskaper med glosor och vardagsfraser", en: "Test your knowledge with vocabulary and everyday phrases" },

  // Profile
  profileTitle: { sv: "Min profil", en: "My profile" },
  displayName: { sv: "Visningsnamn", en: "Display name" },
  currentLevel: { sv: "Nuvarande nivå", en: "Current level" },
  learningFrom: { sv: "Jag lär mig från", en: "Learning from" },
  saveProfile: { sv: "Spara profil", en: "Save profile" },
  profileSaved: { sv: "Profil sparad!", en: "Profile saved!" },

  // Levels
  levelA1: { sv: "A1 - Nybörjare", en: "A1 - Beginner" },
  levelA2: { sv: "A2 - Elementär", en: "A2 - Elementary" },
  levelB1: { sv: "B1 - Mellannivå", en: "B1 - Intermediate" },
  levelB2: { sv: "B2 - Övre mellannivå", en: "B2 - Upper Intermediate" },
  levelC1: { sv: "C1 - Avancerad", en: "C1 - Advanced" },
  levelC2: { sv: "C2 - Mästare", en: "C2 - Mastery" },

  // Exercise common
  checkAnswer: { sv: "Kontrollera svar", en: "Check answer" },
  correct: { sv: "Rätt!", en: "Correct!" },
  incorrect: { sv: "Fel!", en: "Incorrect!" },
  nextQuestion: { sv: "Nästa fråga", en: "Next question" },
  score: { sv: "Poäng", en: "Score" },
  tense: { sv: "Tidsform", en: "Tense" },
  allTenses: { sv: "Alla tidsformer", en: "All tenses" },
  translate: { sv: "Översätt till spanska", en: "Translate to Spanish" },
  yourAnswer: { sv: "Ditt svar", en: "Your answer" },
  correctAnswer: { sv: "Rätt svar", en: "Correct answer" },
  category: { sv: "Kategori", en: "Category" },

  // Quiz categories
  vocabulary: { sv: "Glosor", en: "Vocabulary" },
  dailyPhrases: { sv: "Vardagsfraser", en: "Daily phrases" },
  atTheStore: { sv: "I affären", en: "At the store" },
  atTheRestaurant: { sv: "På restaurangen", en: "At the restaurant" },
  greetings: { sv: "Hälsningar", en: "Greetings" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "sv",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>("sv");

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
