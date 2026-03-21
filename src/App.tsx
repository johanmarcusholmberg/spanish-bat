import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProgressProvider } from "@/contexts/ProgressContext";
import { StreakProvider } from "@/contexts/StreakContext";
import ScrollToTop from "@/components/ScrollToTop";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ExercisesPage from "./pages/ExercisesPage";
import VerbExercisePage from "./pages/VerbExercisePage";
import NounExercisePage from "./pages/NounExercisePage";
import AdjectiveExercisePage from "./pages/AdjectiveExercisePage";
import QuizExercisePage from "./pages/QuizExercisePage";
import GrammarPage from "./pages/GrammarPage";
import FlashcardsPage from "./pages/FlashcardsPage";
import ReadingPage from "./pages/ReadingPage";
import SentenceBuilderPage from "./pages/SentenceBuilderPage";
import ConversationPage from "./pages/ConversationPage";
import VocabularyPage from "./pages/VocabularyPage";
import PronunciationPage from "./pages/PronunciationPage";
import StatsPage from "./pages/StatsPage";
import NotFound from "./pages/NotFound";
import AdminPage from "./pages/AdminPage";
import ContactPage from "./pages/ContactPage";
import StaticPage from "./pages/StaticPage";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/about" element={<StaticPage />} />
      <Route path="/faq" element={<StaticPage />} />
      <Route path="/how-it-works" element={<StaticPage />} />
      <Route path="/privacy" element={<StaticPage />} />
      <Route path="/terms" element={<StaticPage />} />
      <Route path="/cookies" element={<StaticPage />} />
      <Route path="/accessibility" element={<StaticPage />} />
      <Route path="/support" element={<StaticPage />} />
      <Route path="/pricing" element={<StaticPage />} />
      <Route path="/changelog" element={<StaticPage />} />
      <Route path="/delete-account" element={<StaticPage />} />
      <Route path="/feedback" element={<StaticPage />} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
      <Route path="/exercises/verbs" element={<ProtectedRoute><VerbExercisePage /></ProtectedRoute>} />
      <Route path="/exercises/nouns" element={<ProtectedRoute><NounExercisePage /></ProtectedRoute>} />
      <Route path="/exercises/adjectives" element={<ProtectedRoute><AdjectiveExercisePage /></ProtectedRoute>} />
      <Route path="/exercises/quiz" element={<ProtectedRoute><QuizExercisePage /></ProtectedRoute>} />
      <Route path="/learn/grammar" element={<ProtectedRoute><GrammarPage /></ProtectedRoute>} />
      <Route path="/learn/flashcards" element={<ProtectedRoute><FlashcardsPage /></ProtectedRoute>} />
      <Route path="/learn/reading" element={<ProtectedRoute><ReadingPage /></ProtectedRoute>} />
      <Route path="/learn/sentences" element={<ProtectedRoute><SentenceBuilderPage /></ProtectedRoute>} />
      <Route path="/learn/conversation" element={<ProtectedRoute><ConversationPage /></ProtectedRoute>} />
      <Route path="/learn/vocabulary" element={<ProtectedRoute><VocabularyPage /></ProtectedRoute>} />
      <Route path="/learn/pronunciation" element={<ProtectedRoute><PronunciationPage /></ProtectedRoute>} />
      <Route path="/stats" element={<ProtectedRoute><StatsPage /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <ProgressProvider>
          <StreakProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </StreakProvider>
        </ProgressProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
