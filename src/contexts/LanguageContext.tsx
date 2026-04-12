import React, { createContext, useContext, useState, ReactNode } from "react";

type Language = "sv" | "en";

interface Translations {
  [key: string]: { sv: string; en: string };
}

const translations: Translations = {
  // Login page
  welcome: { sv: "Välkommen till", en: "Welcome to" },
  appName: { sv: "Murciélingo", en: "Murciélingo" },
  appTagline: { sv: "Låt språket eka", en: "Echo the language" },
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
  welcomeBack: { sv: "Välkommen tillbaka,", en: "Welcome back," },
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

  // Learning features
  learn: { sv: "Lär dig", en: "Learn" },
  practice: { sv: "Öva", en: "Practice" },
  grammarLessons: { sv: "Grammatiklektioner", en: "Grammar Lessons" },
  grammarDesc: { sv: "Lär dig spansk grammatik steg för steg med regler, exempel och tips", en: "Learn Spanish grammar step by step with rules, examples and tips" },
  grammarLessonsDesc: { sv: "Interaktiva lektioner med regler, exempel och övningar", en: "Interactive lessons with rules, examples and exercises" },
  flashcards: { sv: "Flashcards", en: "Flashcards" },
  flashcardsDesc: { sv: "Öva ord med flashcards: klassiskt, skriv och tala", en: "Practice words with flashcards: classic, write and speak" },
  reading: { sv: "Läsförståelse", en: "Reading" },
  readingDesc: { sv: "Läs nivåanpassade texter och svara på frågor", en: "Read level-adapted texts and answer questions" },
  sentenceBuilder: { sv: "Meningsbyggare", en: "Sentence Builder" },
  sentenceBuilderDesc: { sv: "Bygg meningar genom att sätta ord i rätt ordning", en: "Build sentences by putting words in the correct order" },
  conversation: { sv: "Konversation", en: "Conversation" },
  conversationDesc: { sv: "Öva vardagssamtal med en AI-partner på spanska", en: "Practice everyday conversations with an AI partner in Spanish" },
  myDictionary: { sv: "Min ordbok", en: "My Dictionary" },
  myDictionaryDesc: { sv: "Dina sparade ord och fraser att öva på", en: "Your saved words and phrases to practice" },
  pronunciation: { sv: "Uttalsövning", en: "Pronunciation" },
  pronunciationDesc: { sv: "Öva ditt uttal med ord, fraser och meningar", en: "Practice your pronunciation with words, phrases and sentences" },
  echoLearning: { sv: "Echo Learning", en: "Echo Learning" },
  echoLearningDesc: { sv: "Lär dig ord genom att se, säga, fylla i och producera", en: "Learn words by seeing, saying, filling in and producing" },
  tapToFlip: { sv: "Tryck för att vända", en: "Tap to flip" },
  answer: { sv: "Svar", en: "Answer" },
  hard: { sv: "Svårt", en: "Hard" },
  ok: { sv: "Okej", en: "OK" },
  easy: { sv: "Lätt", en: "Easy" },
  reviewed: { sv: "repeterade", en: "reviewed" },
  noCards: { sv: "Inga kort tillgängliga", en: "No cards available" },
  questions: { sv: "Frågor", en: "Questions" },
  nextText: { sv: "Nästa text", en: "Next text" },
  tapWordsToOrder: { sv: "Tryck på orden i rätt ordning", en: "Tap words in correct order" },
  reset: { sv: "Börja om", en: "Reset" },

  // Profile
  profileTitle: { sv: "Min profil", en: "My profile" },
  displayName: { sv: "Visningsnamn", en: "Display name" },
  currentLevel: { sv: "Nuvarande nivå", en: "Current level" },
  learningFrom: { sv: "Jag lär mig från", en: "Learning from" },
  saveProfile: { sv: "Spara profil", en: "Save profile" },
  profileSaved: { sv: "Profil sparad!", en: "Profile saved!" },
  profileInfo: { sv: "Profilinformation", en: "Profile information" },
  learningSettings: { sv: "Inlärningsinställningar", en: "Learning settings" },
  accountSection: { sv: "Konto", en: "Account" },
  accountStatus: { sv: "Kontostatus", en: "Account status" },
  freeUser: { sv: "Gratis", en: "Free" },
  quickLinks: { sv: "Snabblänkar", en: "Quick links" },
  openDictionary: { sv: "Öppna ordbok", en: "Open Dictionary" },

  levelLabel: { sv: "Nivå", en: "Level" },
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

  // Grammar exercises
  stepLearn: { sv: "Lär dig", en: "Learn" },
  stepPractice: { sv: "Öva", en: "Practice" },
  startExercises: { sv: "Starta övningar", en: "Start exercises" },
  showHint: { sv: "Visa ledtråd", en: "Show hint" },
  seeResults: { sv: "Se resultat", en: "See results" },
  lessonPassed: { sv: "Lektion godkänd!", en: "Lesson passed!" },
  tryAgain: { sv: "Försök igen!", en: "Try again!" },
  correctAnswers: { sv: "rätt svar", en: "correct answers" },
  needScore: { sv: "Du behöver minst", en: "You need at least" },
  toPass: { sv: "för att klara lektionen", en: "to pass the lesson" },
  reviewLesson: { sv: "Repetera", en: "Review" },
  retryExercises: { sv: "Försök igen", en: "Try again" },
  nextLessonUnlocked: { sv: "Nästa lektion upplåst!", en: "Next lesson unlocked!" },
  bestScore: { sv: "Bästa resultat", en: "Best score" },
  attemptsLabel: { sv: "försök", en: "attempts" },
  progressLabel: { sv: "Framsteg", en: "Progress" },
  allLessonsCompleted: { sv: "Alla lektioner klarade!", en: "All lessons completed!" },
  levelUpPrompt: { sv: "Vill du låsa upp nästa nivå:", en: "Do you want to unlock the next level:" },
  stayCurrentLevel: { sv: "Stanna kvar", en: "Stay here" },
  unlockNextLevel: { sv: "Lås upp nästa nivå", en: "Unlock next level" },
  levelOverrideHint: { sv: "💡 Du kan ändra din nivå manuellt i din profil.", en: "💡 You can change your level manually in your profile." },
  "exerciseType_fill-blank": { sv: "Fyll i", en: "Fill in" },
  "exerciseType_multiple-choice": { sv: "Flerval", en: "Multiple choice" },
  exerciseType_translate: { sv: "Översätt", en: "Translate" },
  "exerciseType_error-correction": { sv: "Rätta felet", en: "Correct the error" },

  // Quiz categories
  vocabulary: { sv: "Glosor", en: "Vocabulary" },
  dailyPhrases: { sv: "Vardagsfraser", en: "Daily phrases" },
  atTheStore: { sv: "I affären", en: "At the store" },
  atTheRestaurant: { sv: "På restaurangen", en: "At the restaurant" },
  greetings: { sv: "Hälsningar", en: "Greetings" },

  // Progress Dashboard
  progressOverview: { sv: "Framsteg översikt", en: "Progress Overview" },
  trackYourLearning: { sv: "Följ din utveckling och framsteg", en: "Track your development and progress" },
  overallProgress: { sv: "Totalt framsteg", en: "Overall progress" },
  nextSteps: { sv: "Nästa steg", en: "Next Steps" },
  recommendedForYou: { sv: "Rekommenderat för dig", en: "Recommended for you" },
  recommendationNotStarted: { sv: "Du har inte börjat här än. Börja för att göra framsteg!", en: "You haven't started here yet. Begin to make progress!" },
  recommendationLowest: { sv: "Detta är ditt svagaste område. Fortsätt öva här!", en: "This is your weakest area. Keep practicing here!" },
  recommendationReview: { sv: "Fantastiskt! Repetera innehållet för att befästa dina kunskaper.", en: "Amazing! Review the content to consolidate your knowledge." },
  recommendationContinue: { sv: "Fortsätt lära dig här för bästa resultat.", en: "Continue learning here for best results." },
  startNow: { sv: "Starta nu", en: "Start now" },
  levelAdvancement: { sv: "Nivåuppgradering", en: "Level Advancement" },
  readyToAdvance: { sv: "Du är redo att avancera!", en: "You're ready to advance!" },
  keepLearning: { sv: "Fortsätt lära dig", en: "Keep learning" },
  congratulationsAdvance: { sv: "Grattis! Du har nått 80% och är redo för nästa nivå.", en: "Congratulations! You've reached 80% and are ready for the next level." },
  advanceToNextLevel: { sv: "Gå till nästa nivå", en: "Advance to next level" },
  progressToAdvance: { sv: "Framsteg för att avancera", en: "Progress to advance" },
  completeAllCategories: { sv: "Slutför övningar i alla kategorier för att låsa upp nästa nivå", en: "Complete exercises in all categories to unlock the next level" },
  complete: { sv: "slutfört", en: "complete" },
  recommendationAlmostFinished: { sv: "Nästan klart! Slutför detta för att öka ditt framsteg.", en: "Almost done! Finish this to boost your progress." },
  continueWhereYouLeftOff: { sv: "Fortsätt där du slutade", en: "Continue where you left off" },
  continueDesc: { sv: "Hoppa tillbaka till din senaste övning", en: "Jump back to your latest exercise" },
  continueButton: { sv: "Fortsätt", en: "Continue" },
  noPreviousActivity: { sv: "Starta din första övning!", en: "Start your first exercise!" },
  confirmLevelUp: { sv: "Bekräfta nivåuppgradering", en: "Confirm Level Up" },
  maxLevelReached: { sv: "Du har nått den högsta nivån! 🎉", en: "You've reached the highest level! 🎉" },
  practiceLevel: { sv: "Öva nivå", en: "Practice level" },
  currentLevelTag: { sv: "nuvarande", en: "current" },
  reviewTag: { sv: "repetition", en: "review" },

  // Streak
  streakTitle: { sv: "Din streak", en: "Your Streak" },
  currentStreak: { sv: "Dagar i rad", en: "Current days" },
  longestStreak: { sv: "Längsta streak", en: "Longest streak" },
  totalExercises: { sv: "Totala övningar", en: "Total exercises" },

  // Stats
  statistics: { sv: "Statistik", en: "Statistics" },
  weeklyActivity: { sv: "Veckoaktivitet", en: "Weekly Activity" },
  categoryBreakdown: { sv: "Kategorier", en: "Category Breakdown" },
  detailedProgress: { sv: "Detaljerat framsteg", en: "Detailed Progress" },
  activeDays: { sv: "Aktiva dagar", en: "Active Days" },
  exercisesUnit: { sv: "övningar", en: "exercises" },
  activity: { sv: "Aktivitet", en: "Activity" },

  // Admin
  adminPanel: { sv: "Admin-panel", en: "Admin Panel" },
  totalUsers: { sv: "Totalt antal användare", en: "Total Users" },
  activeStreaks: { sv: "Aktiva streaks", en: "Active Streaks" },
  adminCount: { sv: "Administratörer", en: "Administrators" },
  adminRoles: { sv: "Roller", en: "Roles" },
  registered: { sv: "Registrerad", en: "Registered" },
  adminOverview: { sv: "Översikt", en: "Overview" },
  adminUsers: { sv: "Användare", en: "Users" },
  adminSupport: { sv: "Support", en: "Support" },
  adminInsights: { sv: "Insikter", en: "Insights" },
  activeUsersWeek: { sv: "Aktiva (7 dagar)", en: "Active (7 days)" },
  recentSignups: { sv: "Nya (7 dagar)", en: "New (7 days)" },
  pendingMessages: { sv: "Väntande meddelanden", en: "Pending messages" },
  supportInbox: { sv: "Supportinkorg", en: "Support Inbox" },
  subject: { sv: "Ämne", en: "Subject" },
  sender: { sv: "Avsändare", en: "Sender" },
  messagePreview: { sv: "Förhandsgranskning", en: "Preview" },
  statusNew: { sv: "Ny", en: "New" },
  statusInProgress: { sv: "Pågående", en: "In Progress" },
  statusResolved: { sv: "Löst", en: "Resolved" },
  adminNotes: { sv: "Admin-anteckningar", en: "Admin notes" },
  saveNotes: { sv: "Spara", en: "Save" },
  levelDistribution: { sv: "Nivåfördelning", en: "Level Distribution" },
  categoryUsage: { sv: "Kategorianvändning", en: "Category Usage" },
  vocabularyGrowth: { sv: "Ordförråd", en: "Vocabulary" },
  wordsTotal: { sv: "Totalt ord", en: "Total words" },
  wordsLearned: { sv: "Inlärda ord", en: "Words learned" },
  lastActivity: { sv: "Senaste aktivitet", en: "Last Activity" },
  noData: { sv: "Ingen data", en: "No data" },
  permissionDenied: { sv: "Åtkomst nekad", en: "Permission denied" },
  serverError: { sv: "Serverfel", en: "Server error" },
  noMessages: { sv: "Inga meddelanden", en: "No messages" },
  noUsers: { sv: "Inga användare", en: "No users" },

  // Footer
  footerAbout: { sv: "Om oss", en: "About us" },
  footerContact: { sv: "Kontakta oss", en: "Contact us" },
  footerFaq: { sv: "Vanliga frågor", en: "FAQ / Help" },
  footerHowItWorks: { sv: "Hur det fungerar", en: "How it works" },
  footerPrivacy: { sv: "Integritetspolicy", en: "Privacy Policy" },
  footerTerms: { sv: "Användarvillkor", en: "Terms of Service" },
  footerCookies: { sv: "Cookiepolicy", en: "Cookie Policy" },
  footerReport: { sv: "Rapportera problem", en: "Report a problem" },
  footerRights: { sv: "Alla rättigheter förbehållna.", en: "All rights reserved." },
  footerAccessibility: { sv: "Tillgänglighet", en: "Accessibility" },
  footerSupport: { sv: "Support / Hjälpcenter", en: "Support / Help center" },
  footerPricing: { sv: "Priser / Planer", en: "Pricing / Plans" },
  footerChangelog: { sv: "Nyheter", en: "What's new" },
  footerDeleteAccount: { sv: "Radera konto / Dataförfrågan", en: "Delete account / Data request" },
  footerFeedback: { sv: "Feedback / Community", en: "Feedback / Community" },

  // Login
  loginMissingFields: { sv: "Fyll i e-post och lösenord", en: "Enter email and password" },
  signInWithApple: { sv: "Logga in med Apple", en: "Sign in with Apple" },
  registerWithApple: { sv: "Registrera med Apple", en: "Sign up with Apple" },

  // Freestyle
  freestyle: { sv: "Freestyle", en: "Freestyle" },
  freestyleDesc: { sv: "Välj ämne och öva fritt på din nivå", en: "Choose a topic and practice freely at your level" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  setProfileLang?: (lang: Language | null) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "sv",
  setLanguage: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem("publicLanguage") as Language) || "sv";
  });
  const [profileLanguage, setProfileLanguage] = useState<Language | null>(null);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("publicLanguage", lang);
  };

  const setProfileLang = (lang: Language | null) => {
    setProfileLanguage(lang);
  };

  const activeLang = profileLanguage ?? language;

  const t = (key: string): string => {
    return translations[key]?.[activeLang] || key;
  };

  return (
    <LanguageContext.Provider value={{ language: activeLang, setLanguage, t, setProfileLang } as any}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
