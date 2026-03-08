import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
    <Route path="/exercises" element={<ProtectedRoute><ExercisesPage /></ProtectedRoute>} />
    <Route path="/exercises/verbs" element={<ProtectedRoute><VerbExercisePage /></ProtectedRoute>} />
    <Route path="/exercises/nouns" element={<ProtectedRoute><NounExercisePage /></ProtectedRoute>} />
    <Route path="/exercises/adjectives" element={<ProtectedRoute><AdjectiveExercisePage /></ProtectedRoute>} />
    <Route path="/exercises/quiz" element={<ProtectedRoute><QuizExercisePage /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
