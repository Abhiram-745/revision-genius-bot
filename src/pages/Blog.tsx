import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, ArrowRight, BookOpen, Brain, Target, Zap, Users } from 'lucide-react';
import Header from '@/components/Header';

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  icon: React.ReactNode;
}

const blogPosts: BlogPost[] = [
  {
    slug: 'active-recall-study-technique',
    title: 'Active Recall: The Most Effective Study Technique Backed by Science',
    excerpt: 'Discover why active recall outperforms passive reading and how to implement it in your study routine for better exam results.',
    category: 'Study Techniques',
    readTime: '8 min read',
    date: '2026-01-03',
    image: '/placeholder.svg',
    icon: <Brain className="w-5 h-5" />
  },
  {
    slug: 'spaced-repetition-guide',
    title: 'Spaced Repetition: How to Remember Everything You Learn',
    excerpt: 'Learn the science behind spaced repetition and how to use it to retain information for exams and beyond.',
    category: 'Memory',
    readTime: '10 min read',
    date: '2026-01-02',
    image: '/placeholder.svg',
    icon: <Zap className="w-5 h-5" />
  },
  {
    slug: 'pomodoro-technique-students',
    title: 'The Pomodoro Technique for Students: Boost Focus and Productivity',
    excerpt: 'Master the Pomodoro Technique to study more effectively, beat procrastination, and maintain high energy levels.',
    category: 'Productivity',
    readTime: '6 min read',
    date: '2026-01-01',
    image: '/placeholder.svg',
    icon: <Clock className="w-5 h-5" />
  },
  {
    slug: 'study-timetable-creation',
    title: 'How to Create the Perfect Study Timetable for Exam Success',
    excerpt: 'Step-by-step guide to creating a balanced study schedule that covers all subjects and prevents burnout.',
    category: 'Planning',
    readTime: '12 min read',
    date: '2025-12-30',
    image: '/placeholder.svg',
    icon: <Target className="w-5 h-5" />
  },
  {
    slug: 'group-study-benefits',
    title: '5 Proven Benefits of Study Groups and How to Start One',
    excerpt: 'Research shows study groups can improve grades by up to 20%. Learn how to form an effective study group.',
    category: 'Collaboration',
    readTime: '7 min read',
    date: '2025-12-28',
    image: '/placeholder.svg',
    icon: <Users className="w-5 h-5" />
  },
  {
    slug: 'exam-anxiety-tips',
    title: 'Overcome Exam Anxiety: 10 Techniques That Actually Work',
    excerpt: 'Combat test anxiety with proven strategies from psychologists and top-performing students.',
    category: 'Wellness',
    readTime: '9 min read',
    date: '2025-12-25',
    image: '/placeholder.svg',
    icon: <BookOpen className="w-5 h-5" />
  }
];

const categories = ['All', 'Study Techniques', 'Memory', 'Productivity', 'Planning', 'Collaboration', 'Wellness'];

export default function Blog() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Vistara Study Tips Blog",
    "description": "Expert study tips, techniques, and strategies to help students achieve better grades and academic success.",
    "url": "https://vistara.study/blog",
    "publisher": {
      "@type": "Organization",
      "name": "Vistara",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vistara.study/favicon.png"
      }
    },
    "blogPost": blogPosts.map(post => ({
      "@type": "BlogPosting",
      "headline": post.title,
      "description": post.excerpt,
      "datePublished": post.date,
      "url": `https://vistara.study/blog/${post.slug}`
    }))
  };

  return (
    <>
      <Helmet>
        <title>Study Tips Blog | Vistara - Expert Advice for Academic Success</title>
        <meta name="description" content="Discover proven study techniques, memory strategies, and productivity tips from experts. Improve your grades with our science-backed study advice." />
        <meta name="keywords" content="study tips, study techniques, exam preparation, active recall, spaced repetition, student productivity, memory improvement, study guide" />
        <link rel="canonical" href="https://vistara.study/blog" />
        
        <meta property="og:title" content="Study Tips Blog | Vistara" />
        <meta property="og:description" content="Expert study tips and techniques to help you achieve academic success. Science-backed strategies for better grades." />
        <meta property="og:url" content="https://vistara.study/blog" />
        <meta property="og:type" content="website" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Study Tips Blog | Vistara" />
        <meta name="twitter:description" content="Expert study tips and techniques for academic success." />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              <BookOpen className="w-3 h-3 mr-1" />
              Study Tips Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Master Your Studies
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Science-backed study techniques, productivity tips, and expert advice to help you achieve academic excellence.
            </p>
          </section>

          {/* Categories */}
          <section className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((category) => (
              <Badge 
                key={category} 
                variant={category === 'All' ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-4 py-2"
              >
                {category}
              </Badge>
            ))}
          </section>

          {/* Featured Article */}
          <section className="mb-16">
            <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="aspect-video md:aspect-auto bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Brain className="w-24 h-24 text-primary/40" />
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <Badge className="w-fit mb-4 bg-primary/10 text-primary">Featured</Badge>
                  <h2 className="text-2xl md:text-3xl font-bold mb-4">
                    {blogPosts[0].title}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {blogPosts[0].excerpt}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(blogPosts[0].date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {blogPosts[0].readTime}
                    </span>
                  </div>
                  <Link 
                    to={`/blog/${blogPosts[0].slug}`}
                    className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
                  >
                    Read Article <ArrowRight className="w-4 h-4" />
                  </Link>
                </CardContent>
              </div>
            </Card>
          </section>

          {/* Article Grid */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(1).map((post) => (
                <Card key={post.slug} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {post.icon}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <Badge variant="outline" className="mb-3">{post.category}</Badge>
                    <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                      <Link 
                        to={`/blog/${post.slug}`}
                        className="text-primary font-medium hover:underline inline-flex items-center gap-1"
                      >
                        Read <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-20 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Study Habits?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              Put these tips into action with Vistara's AI-powered study planner. Create your personalized timetable in minutes.
            </p>
            <Link 
              to="/auth"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </section>
        </main>
      </div>
    </>
  );
}
