import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  LanguageCode,
  FALLBACK_LANGUAGE,
  resolveLanguage,
  getEnabledLanguages,
  LanguageOption,
} from "@/i18n/languages";
import { languageStorage } from "@/i18n/storage";

type Language = LanguageCode;

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

  // Readiness model (Phase 12)
  readinessTitle: { sv: "Nivåberedskap", en: "Level readiness" },
  readinessDescription: { sv: "Hur nära du är nästa nivåtest", en: "How close you are to the next level check" },
  readinessFor: { sv: "{level} beredskap", en: "{level} readiness" },
  msgKeepPracticing: { sv: "Fortsätt öva. Du bygger självförtroende.", en: "Keep practicing. You're building confidence." },
  msgTestRecommended: { sv: "Du ser redo ut för {next}-kollen. Gör testet nu, eller fortsätt öva på {current}.", en: "You look ready for the {next} check. Take the test now, or keep practicing {current}." },
  msgPassedCanContinue: { sv: "Du klarade {current}-kollen. Gå vidare till {next}, eller fortsätt stärka {current}.", en: "You passed the {current} check. Move to {next}, or keep strengthening {current}." },
  msgPassedTopLevel: { sv: "Du har klarat den högsta nivån. Fortsätt öva för att hålla det skarpt.", en: "You've passed the highest level. Keep practicing to stay sharp." },
  takeLevelCheck: { sv: "Gör nivåkollen", en: "Take level check" },
  keepPracticingThisLevel: { sv: "Fortsätt öva på den här nivån", en: "Keep practicing this level" },
  practiceWeakSpots: { sv: "Öva svaga punkter", en: "Practice weak spots" },
  moveToNextLevel: { sv: "Gå vidare till nästa nivå", en: "Move to next level" },
  continueCurrentLevel: { sv: "Fortsätt på nuvarande nivå", en: "Continue current level" },
  mixCurrentAndNext: { sv: "Mixa nuvarande + nästa nivå", en: "Mix current + next level" },
  buildingConfidence: { sv: "Du bygger självförtroende", en: "You're building confidence" },
  nearlyReady: { sv: "Nästan redo för {next}-kollen", en: "Nearly ready for the {next} check" },
  weakSpotsLabel: { sv: "Områden att stärka", en: "Areas to strengthen" },
  catVocabulary: { sv: "Ordförråd", en: "Vocabulary" },
  catGrammar: { sv: "Grammatik", en: "Grammar" },
  catSentences: { sv: "Meningsbygge", en: "Sentence building" },
  catReading: { sv: "Läsning", en: "Reading" },
  catListening: { sv: "Lyssna", en: "Listening" },
  catSpeaking: { sv: "Tala", en: "Speaking" },

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
  adaptivePractice: { sv: "Adaptiv övning", en: "Adaptive Practice" },
  adaptivePracticeDesc: { sv: "Snabb mix, svaga punkter, nivåövning och mer", en: "Quick mix, weak spots, level practice and more" },

  // Phase 19: practice mode titles & descriptions
  practiceMode_quick_title: { sv: "Snabb övning", en: "Quick practice" },
  practiceMode_quick_desc: {
    sv: "En kort blandad session — perfekt när du bara har en minut.",
    en: "A short mixed session — perfect when you only have a minute.",
  },
  practiceMode_weak_spots_title: { sv: "Fokusområden", en: "Weak spots" },
  practiceMode_weak_spots_desc: {
    sv: "Mjuka övningar på det du fortfarande bygger upp.",
    en: "Gentle drills on the things you're still building.",
  },
  practiceMode_level_title: { sv: "Nivåövning", en: "Level practice" },
  practiceMode_level_desc: {
    sv: "Stanna på din nuvarande nivå och bygg självförtroende.",
    en: "Stay in your current level and build confidence.",
  },
  practiceMode_review_previous_title: { sv: "Repetition", en: "Review" },
  practiceMode_review_previous_desc: {
    sv: "Repetera tidigare nivåer för att hålla grunderna varma.",
    en: "Revisit earlier levels to keep your foundations warm.",
  },
  practiceMode_test_prep_title: { sv: "Inför nivåkollen", en: "Test prep" },
  practiceMode_test_prep_desc: {
    sv: "En balanserad mix som liknar nivåkollen.",
    en: "A balanced set that feels like the level check.",
  },
  practiceMode_challenge_title: { sv: "Utmana mig", en: "Challenge me" },
  practiceMode_challenge_desc: {
    sv: "En tuffare mix med en titt på nästa nivå.",
    en: "A tougher mix with a peek at the next level.",
  },
  practiceMode_due_review_title: { sv: "Daglig repetition", en: "Daily review" },
  practiceMode_due_review_desc: {
    sv: "Saker som din hjärna är redo att fräscha upp idag.",
    en: "Items your brain is ready to refresh today.",
  },
  practiceDueBadge: {
    sv: "{n} att repetera",
    en: "{n} due today",
  },
  practiceQuestions: { sv: "frågor", en: "questions" },
  practiceRecommended: { sv: "Rekommenderat", en: "Recommended" },
  practiceTodaysLabel: { sv: "Dagens övning", en: "Today's practice" },
  practiceContinue: { sv: "Fortsätt öva", en: "Continue practice" },
  practiceLetsGo: { sv: "Sätt igång", en: "Let's go" },
  practiceChangeMode: { sv: "Byt läge", en: "Change mode" },
  practiceTodaysSession: { sv: "Dagens session", en: "Today's session" },
  practiceFocusSkills: { sv: "Fokus", en: "Focus skills" },
  practiceQuestionsLabel: { sv: "Frågor", en: "Questions" },
  practiceTimeLabel: { sv: "Tid", en: "Time" },
  practiceLevelLabel: { sv: "Nivå", en: "Level" },
  practiceAccuracy: { sv: "Träffsäkerhet", en: "Accuracy" },
  practiceCorrect: { sv: "Rätt", en: "Correct" },
  practiceStrengthened: { sv: "Du stärkte", en: "You strengthened" },
  practiceWhatNext: { sv: "Föreslås härnäst", en: "What to practice next" },
  practiceAgain: { sv: "Öva igen", en: "Practice again" },
  practiceFocusAreas: { sv: "Öva fokusområden", en: "Practice focus areas" },
  practiceBackToDashboard: { sv: "Tillbaka till start", en: "Back to dashboard" },
  practiceReadyForLevelCheck: {
    sv: "Du ser redo ut för en nivåkoll",
    en: "You look ready for a level check",
  },

  // Phase 22: Today / Practice / Library / Progress navigation
  navToday: { sv: "Idag", en: "Today" },
  navPractice: { sv: "Öva", en: "Practice" },
  navLibrary: { sv: "Bibliotek", en: "Library" },
  navProgress: { sv: "Framsteg", en: "Progress" },
  todayGreeting: { sv: "Vad sägs om en kort övning?", en: "Up for a short practice?" },
  todaysFocusLabel: { sv: "Dagens fokus", en: "Today's focus" },
  todaysReadiness: { sv: "Nivåberedskap", en: "Level readiness" },
  echoTagline: { sv: "Eka språket", en: "Echo the language" },
  echoStepSee: { sv: "Se", en: "See" },
  echoStepHear: { sv: "Hör", en: "Hear" },
  echoStepEcho: { sv: "Eka", en: "Echo" },
  echoStepBuild: { sv: "Bygg", en: "Build" },
  echoStepUse: { sv: "Använd", en: "Use" },

  // Today's Echo hero
  todaysEchoEyebrow: { sv: "Dagens Echo", en: "Today's Echo" },
  todaysEchoFocus: { sv: "Dagens fokus", en: "Today's focus" },
  todaysEchoLevel: { sv: "Nuvarande nivå", en: "Current level" },
  todaysEchoMin: { sv: "min", en: "min" },
  todaysEchoStart: { sv: "Starta dagens övning", en: "Start today's practice" },
  todaysEchoResume: { sv: "Fortsätt dagens övning", en: "Resume today's practice" },
  todaysEchoUnlock: { sv: "Lås upp full adaptiv träning", en: "Unlock full adaptive practice" },
  practiceAreasTitle: { sv: "Fortsätt lära dig", en: "Continue learning" },

  // Language selector
  appLanguage: { sv: "Appspråk", en: "App language" },
  chooseLanguage: { sv: "Välj språk", en: "Choose language" },
  language: { sv: "Språk", en: "Language" },
  placementTestTitle: { sv: "Placeringstest", en: "Placement Test" },
  placementTestDesc: { sv: "Testa din spanskanivå igen", en: "Retake the Spanish level test" },

  // ===== Public homepage =====
  homeNavPreview: { sv: "Förhandsvisning", en: "Preview" },
  homeNavHowItWorks: { sv: "Så funkar det", en: "How it works" },
  homeNavPractice: { sv: "Övningar", en: "Practice" },
  homeNavMobile: { sv: "Mobilapp", en: "Mobile app" },
  homeCtaLogin: { sv: "Logga in", en: "Log in" },
  homeCtaStart: { sv: "Börja lära dig", en: "Start learning" },
  homeCtaPreview: { sv: "Förhandsvisa appen", en: "Preview the app" },

  // Hero
  homeHeroHeadline: { sv: "Låt språket eka", en: "Echo the language" },
  homeHeroSubhead: {
    sv: "Spansk övning som kommer tillbaka till dig.",
    en: "Spanish practice that comes back to you.",
  },
  homeHeroBody: {
    sv: "Lär dig spanska genom korta, varierade övningar — så att ord, ljud och meningar börjar dyka upp av sig själva.",
    en: "Learn Spanish through short, varied practice that helps words, sounds, and sentence patterns come back naturally.",
  },

  // Hero preview card
  homeHeroPreviewBadge: { sv: "Echo-övning", en: "Echo practice" },
  homeHeroPreviewLesson: { sv: "Lektion 1 · Hälsningar", en: "Lesson 1 · Greetings" },
  homeHeroPreviewListenAndRepeat: { sv: "Lyssna och upprepa", en: "Listen and repeat" },
  homeHeroPreviewPhraseTranslation: { sv: "Vad heter du?", en: "What's your name?" },
  homeHeroPreviewListen: { sv: "Lyssna", en: "Listen" },
  homeHeroPreviewRepeat: { sv: "Upprepa", en: "Repeat" },
  homeHeroPreviewProgress: { sv: "Lite framsteg, varje dag.", en: "A little progress, every day." },

  // Learning loop
  homeLoopHeadline: {
    sv: "Spanskan börjar fastna när du möter den fler än en gång.",
    en: "Spanish starts to stick when you meet it more than once.",
  },
  homeLoopHearLabel: { sv: "Hör det", en: "Hear it" },
  homeLoopHearDesc: { sv: "Möt nyttig spanska i små bitar.", en: "Meet useful Spanish in small pieces." },
  homeLoopRepeatLabel: { sv: "Upprepa det", en: "Repeat it" },
  homeLoopRepeatDesc: { sv: "Eka ljud, ord och fraser.", en: "Echo sounds, words, and phrases." },
  homeLoopBuildLabel: { sv: "Bygg det", en: "Build it" },
  homeLoopBuildDesc: { sv: "Skapa meningar steg för steg.", en: "Create sentences step by step." },
  homeLoopUseLabel: { sv: "Använd det", en: "Use it" },
  homeLoopUseDesc: {
    sv: "Öva i sammanhang genom läsning och samtal.",
    en: "Practice in context through reading and conversation.",
  },
  homeLoopRememberLabel: { sv: "Minns det", en: "Remember it" },
  homeLoopRememberDesc: {
    sv: "Återkalla språket tills det börjar komma naturligt.",
    en: "Recall language until it starts to come back naturally.",
  },

  // App preview section
  homePreviewGoodMorning: { sv: "God morgon", en: "Good morning" },
  homePreviewBadge: { sv: "Förhandsvisning", en: "Preview" },
  homePreviewHeadline: { sv: "Se hur övningen känns", en: "See what practice feels like" },
  homePreviewListen: { sv: "Lyssna", en: "Listen" },
  homePreviewBuild: { sv: "Bygg", en: "Build" },
  homePreviewConversation: { sv: "Samtal", en: "Conversation" },
  homePreviewRemember: { sv: "Minns", en: "Remember" },
  homePreviewArrange: { sv: "Sätt orden i ordning:", en: "Arrange the words:" },
  homePreviewConfirm: { sv: "Bekräfta", en: "Confirm" },
  homePreviewYourReply: { sv: "Ditt svar…", en: "Your reply…" },
  homePreviewPracticeToday: { sv: "Öva idag", en: "Practice today" },
  homePreviewFewMinutes: { sv: "Några minuter räcker.", en: "A few minutes is enough." },
  homePreviewKeepGoing: { sv: "Fortsätt", en: "Keep going" },

  // Practice variety
  homeVarietyHeadline: {
    sv: "Övning ska inte kännas som en checklista.",
    en: "Practice should not feel like a checklist.",
  },
  homeVarietyBody: {
    sv: "Murcielingo ger dig olika sätt att möta samma språk igen: lyssna, upprepa, välja, bygga, läsa, tala och minnas. När en övning är klar finns det alltid ett annat användbart sätt att fortsätta.",
    en: "Murcielingo gives you different ways to meet the same language again: listen, repeat, choose, build, read, speak, and recall. So when one practice is done, another useful way to keep learning can begin.",
  },

  // Practice modes
  homeModeEchoName: { sv: "Echo-övning", en: "Echo Practice" },
  homeModeEchoDesc: {
    sv: "Lyssna, upprepa och minns spanska tills det börjar fastna.",
    en: "Listen, repeat, and recall Spanish until it starts to stick.",
  },
  homeModeSentenceName: { sv: "Meningsbyggare", en: "Sentence Builder" },
  homeModeSentenceDesc: {
    sv: "Bygg användbara meningar steg för steg.",
    en: "Build useful sentences step by step.",
  },
  homeModeFlashName: { sv: "Flashcards", en: "Flashcards" },
  homeModeFlashDesc: {
    sv: "Möt viktiga ord igen vid rätt tillfälle.",
    en: "Meet important words again at the right moment.",
  },
  homeModeVocabName: { sv: "Ordförråd", en: "Vocabulary" },
  homeModeVocabDesc: {
    sv: "Öva ord i sammanhang, inte bara som listor.",
    en: "Practice words in context, not just as lists.",
  },
  homeModeGrammarName: { sv: "Grammatik", en: "Grammar" },
  homeModeGrammarDesc: {
    sv: "Förstå mönster genom enkla exempel.",
    en: "Understand patterns through simple examples.",
  },
  homeModeReadingName: { sv: "Läsning", en: "Reading" },
  homeModeReadingDesc: {
    sv: "Läs korta spanska texter med stöd.",
    en: "Read short Spanish texts with support.",
  },
  homeModeConvName: { sv: "Konversation", en: "Conversation" },
  homeModeConvDesc: {
    sv: "Öva vardagsspanska i små dialoger.",
    en: "Practice everyday Spanish in small dialogues.",
  },
  homeModePronName: { sv: "Uttal", en: "Pronunciation" },
  homeModePronDesc: {
    sv: "Träna ljud, rytm och självförtroende.",
    en: "Train sounds, rhythm, and confidence.",
  },

  // Mobile section
  homeMobileBadge: { sv: "Mobil", en: "Mobile" },
  homeMobileHeadline: { sv: "Öva var du vill", en: "Practice anywhere" },
  homeMobileBody: {
    sv: "Murcielingo förbereds för mobilen, så att din spanska övning kan följa med dig genom dagen.",
    en: "Murcielingo is being prepared for mobile, so your Spanish practice can follow you through the day.",
  },
  homeMobileComingSoon: { sv: "Kommer snart till", en: "Coming soon to" },
  homeMobileToday: { sv: "Idag", en: "Today" },
  homeMobilePracticePhrase: { sv: "Övningsfras", en: "Practice phrase" },
  homeMobileStart: { sv: "Starta", en: "Start" },

  // Trust
  homeTrustDaily: { sv: "Byggd för korta dagliga övningar", en: "Built for short daily practice" },
  homeTrustBeginners: {
    sv: "Designad för nybörjare och återvändande inlärare",
    en: "Designed for beginners and returning learners",
  },
  homeTrustSkills: {
    sv: "Öva läsning, tal, hörförståelse och minne",
    en: "Practice reading, speaking, listening, and recall",
  },
  homeTrustConfidence: {
    sv: "Ett mjukare sätt att bygga självförtroende på spanska",
    en: "A softer way to build Spanish confidence",
  },

  // Final CTA
  homeFinalHeadline: { sv: "Redo att låta spanskan eka tillbaka?", en: "Ready to let Spanish echo back?" },
  homeFinalBody: {
    sv: "Börja med några minuters övning och bygg därifrån.",
    en: "Start with a few minutes of practice and build from there.",
  },
  homeFooterContact: { sv: "Kontakt", en: "Contact" },

  // ===== Login / Register polish =====
  loginSubtitlePassword: { sv: "Logga in med ditt lösenord.", en: "Sign in with your password." },
  loginSubtitleCode: { sv: "Vi skickar en engångskod till din e-post.", en: "We'll email you a one-time code." },
  loginCodeSentTo: { sv: "Kod skickad till {email}", en: "Code sent to {email}" },
  loginMfaSentTo: { sv: "Tvåfaktorskod skickad till {email}", en: "Two-factor code sent to {email}" },
  loginTotpSubtitle: {
    sv: "Ange den 6-siffriga koden från din authenticator-app.",
    en: "Enter the 6-digit code from your authenticator app.",
  },
  loginBackupSubtitle: {
    sv: "Ange en av dina återställningskoder.",
    en: "Enter one of your backup codes.",
  },
  loginResetRequestSubtitle: {
    sv: "Vi skickar en kod för att återställa lösenordet.",
    en: "We'll email you a reset code.",
  },
  loginResetCodeSentTo: { sv: "Återställningskod skickad till {email}", en: "Reset code sent to {email}" },
  loginInvalidEmail: { sv: "Ange en giltig e-postadress", en: "Please enter a valid email address" },
  loginEnterPassword: { sv: "Ange ditt lösenord", en: "Please enter your password" },
  loginEnterCode: { sv: "Ange koden från e-posten", en: "Please enter the code from your email" },
  loginOpenAuthenticator: {
    sv: "Öppna din authenticator-app för att hämta koden.",
    en: "Open your authenticator app to get the code.",
  },
  loginCodeSentEmail: { sv: "Vi har skickat en kod till din e-post.", en: "We've sent a code to your email." },
  loginNewCodeOnWay: { sv: "En ny kod är på väg.", en: "A new code is on its way." },
  loginResetCodeSent: {
    sv: "Återställningskod skickad till din e-post.",
    en: "We've sent a reset code to your email.",
  },
  loginPasswordTooShort: {
    sv: "Välj ett lösenord på minst 8 tecken",
    en: "Choose a password with at least 8 characters",
  },
  loginPasswordUpdated: { sv: "Lösenordet är uppdaterat.", en: "Your password has been updated." },
  loginPasswordLabel: { sv: "Lösenord", en: "Password" },
  loginSubmit: { sv: "Logga in", en: "Sign in" },
  loginUseCodeInstead: { sv: "Logga in med en kod istället", en: "Sign in with a code instead" },
  loginUsePassword: { sv: "Använd lösenord", en: "Use password" },
  loginSendCode: { sv: "Skicka kod", en: "Send code" },
  loginBack: { sv: "Tillbaka", en: "Back" },
  loginBackToSignIn: { sv: "Tillbaka till inloggning", en: "Back to sign in" },
  loginVerify: { sv: "Verifiera", en: "Verify" },
  loginVerificationCode: { sv: "Verifieringskod", en: "Verification code" },
  loginAuthenticatorCode: { sv: "Authenticator-kod", en: "Authenticator code" },
  loginBackupCode: { sv: "Återställningskod", en: "Backup code" },
  loginUseAuthenticatorInstead: {
    sv: "Använd authenticator-kod istället",
    en: "Use authenticator code instead",
  },
  loginUseBackupInstead: {
    sv: "Använd en återställningskod istället",
    en: "Use a backup code instead",
  },
  loginResend: { sv: "Skicka koden igen", en: "Resend code" },
  loginSending: { sv: "Skickar…", en: "Sending…" },
  loginSendResetCode: { sv: "Skicka återställningskod", en: "Send reset code" },
  loginChangeEmail: { sv: "Ändra e-post", en: "Change email" },
  loginNewPasswordLabel: { sv: "Nytt lösenord", en: "New password" },
  loginResetAndSignIn: { sv: "Återställ och logga in", en: "Reset & sign in" },
  loginNoAccount: { sv: "Har du inget konto?", en: "Don't have an account?" },

  registerSubtitle: { sv: "Det tar bara en minut.", en: "It only takes a minute." },
  registerCodeSentTo: { sv: "Kod skickad till {email}", en: "Code sent to {email}" },
  registerEnterName: { sv: "Ange ditt namn", en: "Please enter your name" },
  registerYourName: { sv: "Ditt namn", en: "Your name" },
  registerNamePlaceholder: { sv: "Vad ska vi kalla dig?", en: "What should we call you?" },
  registerOptional: { sv: "Valfritt", en: "Optional" },
  registerPasswordPlaceholder: {
    sv: "Lämna tomt för kod-inloggning",
    en: "Leave empty for code sign-in",
  },
  registerSendCode: { sv: "Skicka kod", en: "Send code" },
  registerEditDetails: { sv: "Ändra uppgifter", en: "Edit details" },
  registerCreate: { sv: "Skapa konto", en: "Create account" },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  setProfileLang?: (lang: Language | null) => void;
  availableLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType>({
  language: FALLBACK_LANGUAGE,
  setLanguage: () => {},
  t: (key) => key,
  availableLanguages: getEnabledLanguages(),
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() =>
    resolveLanguage(languageStorage.read())
  );
  const [profileLanguage, setProfileLanguage] = useState<Language | null>(null);

  const setLanguage = (lang: Language) => {
    const safe = resolveLanguage(lang);
    setLanguageState(safe);
    languageStorage.write(safe);
    // Keep the profile-driven language in sync so the global selector
    // immediately reflects the user's choice without waiting for a save.
    setProfileLanguage(safe);
  };

  const setProfileLang = (lang: Language | null) => {
    setProfileLanguage(lang === null ? null : resolveLanguage(lang));
  };

  const activeLang = profileLanguage ?? language;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = activeLang;
    }
  }, [activeLang]);

  const t = (key: string): string => {
    return translations[key]?.[activeLang] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language: activeLang,
        setLanguage,
        t,
        setProfileLang,
        availableLanguages: getEnabledLanguages(),
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
