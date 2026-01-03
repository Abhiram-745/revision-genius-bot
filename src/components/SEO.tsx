import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  noIndex?: boolean;
  structuredData?: object;
  author?: string;
}

const BASE_URL = 'https://vistara-ai.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;
const SITE_NAME = 'Vistara';

export const SEO = ({
  title = 'Vistara - AI Study Planner & Revision Timetable Generator',
  description = 'Create personalized study timetables with AI. Track progress, manage homework, join study groups, and ace your exams. Made by students, for students.',
  keywords = 'study planner, revision timetable, AI study app, exam preparation, study schedule, homework tracker, student app, GCSE revision, A-Level revision',
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_IMAGE,
  noIndex = false,
  structuredData,
  author = 'Vistara'
}: SEOProps) => {
  const fullTitle = title.includes('Vistara') ? title : `${title} | Vistara`;
  const canonical = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : BASE_URL);

  // Default structured data for the website
  const defaultStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Vistara',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Web',
    description: description,
    url: BASE_URL,
    author: {
      '@type': 'Organization',
      name: 'Vistara'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'GBP',
      description: 'Free tier available'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
      bestRating: '5',
      worstRating: '1'
    }
  };

  const jsonLd = structuredData || defaultStructuredData;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow'} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_GB" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@VistaraApp" />
      <meta name="twitter:creator" content="@VistaraApp" />

      {/* Additional SEO */}
      <meta name="theme-color" content="#22c55e" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};

// Pre-configured SEO for common pages
export const LandingSEO = () => (
  <SEO
    title="Vistara - AI Study Planner & Revision Timetable Generator for Students"
    description="Feeling overwhelmed by exams? Vistara creates personalized AI-powered study timetables that adapt to your schedule. Track progress, join study groups, and boost your grades. Free to start!"
    keywords="AI study planner, revision timetable generator, exam preparation app, study schedule creator, GCSE revision planner, A-Level study app, homework tracker, student productivity, smart study planner"
    canonicalUrl="https://vistara-ai.app"
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'Vistara',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web, iOS, Android',
      description: 'AI-powered study planner that creates personalized revision timetables for students',
      url: 'https://vistara-ai.app',
      screenshot: 'https://vistara-ai.app/og-image.png',
      featureList: [
        'AI-generated study timetables',
        'Progress tracking and analytics',
        'Study group collaboration',
        'Homework management',
        'Exam countdown timers',
        'Personalized study insights'
      ],
      author: {
        '@type': 'Organization',
        name: 'Vistara',
        url: 'https://vistara-ai.app'
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'GBP',
        description: 'Free tier with premium upgrade available'
      },
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.8',
        ratingCount: '1250',
        bestRating: '5',
        worstRating: '1'
      }
    }}
  />
);

export const DashboardSEO = () => (
  <SEO
    title="Dashboard - Your Study Overview"
    description="View your personalized study dashboard with upcoming sessions, progress tracking, achievements, and AI-powered insights. Stay on top of your revision with Vistara."
    keywords="study dashboard, student progress tracker, revision overview, study analytics, academic performance"
    noIndex={true}
  />
);

export const TimetablesSEO = () => (
  <SEO
    title="My Timetables - Manage Your Study Schedules"
    description="Create, view, and manage your personalized study timetables. Vistara's AI generates optimized revision schedules based on your subjects, exam dates, and preferences."
    keywords="study timetable, revision schedule, exam planner, study calendar, AI timetable generator"
    noIndex={true}
  />
);

export const TimetableViewSEO = () => (
  <SEO
    title="Timetable View - Daily Study Schedule"
    description="View your daily and weekly study sessions. Track completed topics, start timers, and stay focused with your personalized AI-generated timetable."
    keywords="daily study schedule, weekly timetable, study sessions, revision tracker, study timer"
    noIndex={true}
  />
);

export const InsightsSEO = () => (
  <SEO
    title="Study Insights & Analytics"
    description="Get AI-powered insights into your study patterns. View analytics, track topic mastery, identify weak areas, and receive personalized recommendations to improve your grades."
    keywords="study analytics, learning insights, academic performance, topic mastery, study patterns, AI recommendations"
    noIndex={true}
  />
);

export const PracticeSEO = () => (
  <SEO
    title="Practice Hub - Active Recall & Study Tools"
    description="Practice with Blurt AI, flashcards, past papers, and more. Use active recall techniques to improve memory retention and ace your exams."
    keywords="active recall, flashcards, past papers, study practice, Blurt AI, revision techniques, memory retention"
    noIndex={true}
  />
);

export const GroupsSEO = () => (
  <SEO
    title="Study Groups - Collaborate with Friends"
    description="Join or create study groups, share timetables, compete on leaderboards, and motivate each other. Study better together with Vistara's social features."
    keywords="study groups, collaborative learning, study with friends, group revision, study leaderboard, peer learning"
    noIndex={true}
  />
);

export const SocialSEO = () => (
  <SEO
    title="Social - Friends & Leaderboards"
    description="Connect with friends, compare study progress, and compete on leaderboards. Stay motivated with social accountability and friendly competition."
    keywords="study friends, student leaderboard, academic competition, study accountability, peer motivation"
    noIndex={true}
  />
);

export const PricingSEO = () => (
  <SEO
    title="Pricing - Free & Premium Plans"
    description="Compare Vistara's free and premium plans. Get unlimited timetables, advanced AI insights, priority support, and more with Premium. Start free, upgrade anytime."
    keywords="study app pricing, premium features, student subscription, free study app, Vistara premium"
    canonicalUrl="https://vistara-ai.app/pricing"
    structuredData={{
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Vistara Premium',
      description: 'Premium subscription for unlimited study features',
      brand: {
        '@type': 'Brand',
        name: 'Vistara'
      },
      offers: [
        {
          '@type': 'Offer',
          name: 'Free Plan',
          price: '0',
          priceCurrency: 'GBP',
          description: '1 timetable, basic features'
        },
        {
          '@type': 'Offer',
          name: 'Premium Plan',
          price: '4.99',
          priceCurrency: 'GBP',
          priceValidUntil: '2025-12-31',
          description: 'Unlimited timetables, advanced AI, priority support'
        }
      ]
    }}
  />
);

export const AuthSEO = () => (
  <SEO
    title="Sign In or Create Account"
    description="Sign in to your Vistara account or create a new one. Access your personalized study timetables, track progress, and achieve your academic goals."
    keywords="student login, study app sign up, create account, Vistara login"
    noIndex={true}
  />
);

export const AgendaSEO = () => (
  <SEO
    title="Agenda - Homework & Deadlines"
    description="Manage your homework, assignments, and deadlines. Never miss a due date with Vistara's agenda and task management features."
    keywords="homework tracker, assignment manager, student deadlines, task planner, due date reminder"
    noIndex={true}
  />
);

export const CalendarSEO = () => (
  <SEO
    title="Calendar - Events & Schedule"
    description="View all your study sessions, exams, and events in one calendar. Plan ahead and stay organized with Vistara's integrated calendar view."
    keywords="study calendar, exam schedule, student planner, event calendar, academic calendar"
    noIndex={true}
  />
);

export const ReflectionsSEO = () => (
  <SEO
    title="Study Reflections - Review Your Progress"
    description="Reflect on completed study sessions, track what you've learned, and identify areas for improvement. Build better study habits with regular reflection."
    keywords="study reflection, learning review, progress journal, study habits, self-assessment"
    noIndex={true}
  />
);

export const BlurtAISEO = () => (
  <SEO
    title="Blurt AI - Active Recall Practice"
    description="Practice active recall with Blurt AI. Write everything you know about a topic, get AI feedback, and improve your understanding and memory retention."
    keywords="Blurt method, active recall, AI study assistant, memory technique, revision practice, topic recall"
    noIndex={true}
  />
);

export const ConnectSEO = () => (
  <SEO
    title="Connect - Find Study Partners"
    description="Connect with other students, find study partners, and build your study network. Collaborate and learn together with Vistara's social features."
    keywords="study partners, student network, collaborative studying, peer learning, study community"
    noIndex={true}
  />
);

export const NotFoundSEO = () => (
  <SEO
    title="Page Not Found - 404"
    description="Oops! The page you're looking for doesn't exist. Return to the dashboard or explore Vistara's study features."
    noIndex={true}
  />
);

export default SEO;
