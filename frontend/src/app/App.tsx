import { useEffect, useMemo, useRef } from 'react';
import { LearnTransition } from '@/features/onboarding/LearnTransition';
import { useLearnTransition } from '@/features/onboarding/learnTransitionStore';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router';
import { AppShell } from '@/components/layout/AppShell';
import { Alphabet } from '@/features/alphabet/Alphabet';
import { LessonPlayer } from '@/features/lesson/LessonPlayer';
import { HandSheet } from '@/dev/HandSheet';
import { AccountMenu } from '@/features/account/AccountMenu';
import { LoginPage } from '@/features/account/LoginPage';
import { AboutPage } from '@/features/onboarding/AboutPage';
import { Banners } from '@/features/onboarding/Banners';
import { FeaturesPage } from '@/features/onboarding/FeaturesPage';
import { HowItWorksPage } from '@/features/onboarding/HowItWorksPage';
import { Landing } from '@/features/onboarding/Landing';
import { Lab } from '@/features/lab/Lab';
import { Leaderboard } from '@/features/leaderboard/Leaderboard';
import { Profile } from '@/features/profile/Profile';
import { Settings } from '@/features/settings/Settings';
import { SkillTree } from '@/features/skill-tree/SkillTree';
import { Collect } from '@/features/collect/Collect';
import { Practice } from '@/features/practice/Practice';
import { vi } from '@/i18n/vi';
import { createSound } from '@/lib/sound';
import { attachUiSound } from '@/lib/uiSound';
import { useLearner } from '@/storage/useLearner';
import { useAccount } from '@/sync/useAccount';

function Placeholder({ title }: { title: string }) {
  return (
    <section>
      <h1 className="text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-text-muted">{vi.common.comingSoon}</p>
    </section>
  );
}

function ConnectedShell() {
  const stats = useLearner((s) => s.stats);
  const hasAccount = useAccount((s) => s.status === 'signed_in' || s.status === 'signed_out');
  return <AppShell stats={{ streak: stats.current_streak, xp: stats.total_xp, hearts: stats.hearts }} banner={<Banners />} account={hasAccount ? <AccountMenu /> : undefined} />;
}

/** Pre-app 3-page marketing routes. First visit to `/` shows Home; returning visits go straight to `/learn`. */
function useStartApp() {
  const complete = useLearner((s) => s.completeOnboarding);
  const navigate = useNavigate();
  const play = useLearnTransition((s) => s.play);
  return () => {
    complete();
    play(() => navigate('/learn'));
  };
}

function Home() {
  const onboarded = useLearner((s) => s.onboarded);
  return <Landing onStart={useStartApp()} returning={onboarded} />;
}

function WelcomeRoute() {
  const onboarded = useLearner((s) => s.onboarded);
  return <Landing onStart={useStartApp()} returning={onboarded} />;
}

function FeaturesRoute() {
  return <FeaturesPage onStart={useStartApp()} />;
}

function AboutRoute() {
  return <AboutPage onStart={useStartApp()} />;
}

function HowItWorksRoute() {
  return <HowItWorksPage onStart={useStartApp()} />;
}

/** Plays subtle Duolingo-style pop/tick sounds on interactive clicks while sound is enabled. */
function useGlobalUiSound() {
  const soundOn = useLearner((s) => s.settings.sound_on);
  const enabledRef = useRef(soundOn);
  enabledRef.current = soundOn;
  const sound = useMemo(() => createSound({ enabled: () => enabledRef.current }), []);
  useEffect(() => attachUiSound((kind) => sound.play(kind)), [sound]);
}

/** Resets window scroll to the top whenever the user navigates to a different route. */
function useScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    try {
      window.scrollTo(0, 0);
    } catch {
      /* jsdom does not implement window.scrollTo */
    }
  }, [pathname]);
}

export function AppRoutes() {
  useGlobalUiSound();
  useScrollToTop();
  return (
    <>
    <LearnTransition />
    <Routes>
      <Route index element={<Home />} />
      <Route path="welcome" element={<WelcomeRoute />} />
      <Route path="features" element={<FeaturesRoute />} />
      <Route path="how-it-works" element={<HowItWorksRoute />} />
      <Route path="about" element={<AboutRoute />} />
      <Route path="login" element={<LoginPage />} />
      <Route path="register" element={<LoginPage mode="register" />} />
      {import.meta.env.DEV && <Route path="dev/hands" element={<HandSheet />} />}
      <Route path="lesson/:code" element={<LessonPlayer />} />
      <Route element={<ConnectedShell />}>
        <Route path="learn" element={<SkillTree />} />
        <Route path="practice" element={<Practice />} />
        <Route path="collect" element={<Collect />} />
        <Route path="alphabet" element={<Alphabet />} />
        <Route path="alphabet/:letter" element={<Alphabet />} />
        <Route path="dictionary" element={<Navigate to="/alphabet" replace />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="lab" element={<Lab />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Placeholder title={vi.common.notFound} />} />
      </Route>
    </Routes>
    </>
  );
}
