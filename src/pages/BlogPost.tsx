import { Helmet } from 'react-helmet-async';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, ArrowLeft, ArrowRight, Share2, BookOpen, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';

interface BlogPostContent {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  content: React.ReactNode;
  keywords: string[];
  relatedPosts: string[];
}

const blogPostsData: Record<string, BlogPostContent> = {
  'active-recall-study-technique': {
    slug: 'active-recall-study-technique',
    title: 'Active Recall: The Most Effective Study Technique Backed by Science',
    excerpt: 'Discover why active recall outperforms passive reading and how to implement it in your study routine for better exam results.',
    category: 'Study Techniques',
    readTime: '8 min read',
    date: '2026-01-03',
    author: 'Vistara Team',
    keywords: ['active recall', 'study technique', 'memory', 'exam preparation', 'learning science', 'retrieval practice'],
    relatedPosts: ['spaced-repetition-guide', 'pomodoro-technique-students'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          If you've ever spent hours reading textbooks only to forget everything during the exam, you're not alone. The good news? There's a scientifically-proven technique that can dramatically improve your retention: <strong>Active Recall</strong>.
        </p>

        <h2>What is Active Recall?</h2>
        <p>
          Active recall is a learning strategy that involves actively stimulating your memory during the learning process. Instead of passively reading or highlighting, you challenge yourself to retrieve information from memory without looking at the source material.
        </p>
        <p>
          Research published in the journal <em>Science</em> found that students who used active recall retained 50% more information than those who used passive study methods like re-reading.
        </p>

        <h2>Why Active Recall Works</h2>
        <p>
          When you actively retrieve information, you strengthen the neural pathways associated with that knowledge. This process, called <strong>retrieval practice</strong>, makes memories more durable and accessible.
        </p>
        
        <div className="my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            Key Benefits of Active Recall
          </h3>
          <ul className="space-y-2">
            <li>✓ Strengthens long-term memory retention</li>
            <li>✓ Identifies knowledge gaps early</li>
            <li>✓ Builds confidence for exams</li>
            <li>✓ More time-efficient than passive reading</li>
            <li>✓ Improves ability to apply knowledge</li>
          </ul>
        </div>

        <h2>How to Practice Active Recall</h2>
        
        <h3>1. The Blurting Method</h3>
        <p>
          After reading a topic, close your book and write down everything you can remember. Then, check what you missed and repeat. This is exactly what our <Link to="/practice" className="text-primary hover:underline">BlurtAI feature</Link> automates for you.
        </p>

        <h3>2. Flashcards Done Right</h3>
        <p>
          Create flashcards with questions on one side and answers on the other. The key is to genuinely try to recall the answer before flipping the card—no peeking!
        </p>

        <h3>3. Practice Problems</h3>
        <p>
          For subjects like maths and science, work through problems without looking at examples first. Struggle is part of the learning process.
        </p>

        <h3>4. Teach What You Learn</h3>
        <p>
          Explaining concepts to others (or even to yourself) forces you to retrieve and organize information actively.
        </p>

        <h2>Combining Active Recall with Spaced Repetition</h2>
        <p>
          Active recall becomes even more powerful when combined with <Link to="/blog/spaced-repetition-guide" className="text-primary hover:underline">spaced repetition</Link>. This involves reviewing material at increasing intervals, which optimizes the timing of your recall practice.
        </p>

        <h2>Getting Started Today</h2>
        <p>
          Start small: after your next study session, close your notes and write down everything you remember. You'll be surprised how effective this simple change can be.
        </p>
        <p>
          With Vistara, you can integrate active recall into your study routine automatically. Our AI-powered timetable includes dedicated recall sessions, and BlurtAI helps you practice retrieval for any topic.
        </p>
      </>
    )
  },
  'spaced-repetition-guide': {
    slug: 'spaced-repetition-guide',
    title: 'Spaced Repetition: How to Remember Everything You Learn',
    excerpt: 'Learn the science behind spaced repetition and how to use it to retain information for exams and beyond.',
    category: 'Memory',
    readTime: '10 min read',
    date: '2026-01-02',
    author: 'Vistara Team',
    keywords: ['spaced repetition', 'memory technique', 'forgetting curve', 'study schedule', 'long-term memory', 'exam revision'],
    relatedPosts: ['active-recall-study-technique', 'study-timetable-creation'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          Ever crammed for an exam only to forget everything a week later? Spaced repetition is the antidote to the forgetting curve, helping you remember information for months or even years.
        </p>

        <h2>The Forgetting Curve</h2>
        <p>
          In 1885, psychologist Hermann Ebbinghaus discovered that we forget approximately 70% of new information within 24 hours. However, each time we review material, we remember it for longer. This is the foundation of spaced repetition.
        </p>

        <h2>What is Spaced Repetition?</h2>
        <p>
          Spaced repetition is a learning technique where you review material at strategically increasing intervals. Instead of reviewing everything every day, you review difficult concepts more frequently and easier ones less often.
        </p>

        <div className="my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Optimal Review Schedule</h3>
          <ul className="space-y-2">
            <li><strong>First review:</strong> 1 day after learning</li>
            <li><strong>Second review:</strong> 3 days after first review</li>
            <li><strong>Third review:</strong> 1 week after second review</li>
            <li><strong>Fourth review:</strong> 2 weeks after third review</li>
            <li><strong>Fifth review:</strong> 1 month after fourth review</li>
          </ul>
        </div>

        <h2>How to Implement Spaced Repetition</h2>
        
        <h3>1. Use a Spaced Repetition System (SRS)</h3>
        <p>
          Apps like Anki automate the scheduling for you. Vistara's study timetable also incorporates spaced repetition principles, automatically scheduling review sessions at optimal intervals.
        </p>

        <h3>2. Combine with Active Recall</h3>
        <p>
          Spaced repetition works best when combined with <Link to="/blog/active-recall-study-technique" className="text-primary hover:underline">active recall</Link>. Don't just re-read—test yourself during each review session.
        </p>

        <h3>3. Track Your Progress</h3>
        <p>
          Monitor which topics need more frequent review. Vistara's insights help you identify struggling areas so you can focus your efforts effectively.
        </p>

        <h2>The Science Behind the Intervals</h2>
        <p>
          Research shows that the optimal spacing follows an expanding schedule. Each successful recall strengthens the memory trace, allowing for longer intervals between reviews.
        </p>

        <h2>Start Your Spaced Repetition Journey</h2>
        <p>
          Begin by identifying key concepts from your subjects and scheduling review sessions. With consistent practice, you'll find yourself remembering more while studying less.
        </p>
      </>
    )
  },
  'pomodoro-technique-students': {
    slug: 'pomodoro-technique-students',
    title: 'The Pomodoro Technique for Students: Boost Focus and Productivity',
    excerpt: 'Master the Pomodoro Technique to study more effectively, beat procrastination, and maintain high energy levels.',
    category: 'Productivity',
    readTime: '6 min read',
    date: '2026-01-01',
    author: 'Vistara Team',
    keywords: ['pomodoro technique', 'study productivity', 'focus', 'time management', 'procrastination', 'study breaks'],
    relatedPosts: ['study-timetable-creation', 'exam-anxiety-tips'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          Struggling to stay focused during study sessions? The Pomodoro Technique is a simple but powerful time management method that can revolutionize your productivity.
        </p>

        <h2>What is the Pomodoro Technique?</h2>
        <p>
          Developed by Francesco Cirillo in the late 1980s, the Pomodoro Technique involves working in focused 25-minute intervals (called "Pomodoros") followed by short 5-minute breaks. After four Pomodoros, you take a longer 15-30 minute break.
        </p>

        <div className="my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">The Basic Pomodoro Cycle</h3>
          <ol className="space-y-2">
            <li><strong>1.</strong> Choose a task to work on</li>
            <li><strong>2.</strong> Set a timer for 25 minutes</li>
            <li><strong>3.</strong> Work until the timer rings</li>
            <li><strong>4.</strong> Take a 5-minute break</li>
            <li><strong>5.</strong> Every 4 Pomodoros, take a 15-30 minute break</li>
          </ol>
        </div>

        <h2>Why It Works for Students</h2>
        
        <h3>Beats Procrastination</h3>
        <p>
          25 minutes feels manageable. It's easier to start when you know there's a break coming soon.
        </p>

        <h3>Maintains Focus</h3>
        <p>
          The time constraint creates urgency, helping you stay focused and avoid distractions.
        </p>

        <h3>Prevents Burnout</h3>
        <p>
          Regular breaks prevent mental fatigue and keep your energy levels consistent throughout the day.
        </p>

        <h2>Customizing for Your Needs</h2>
        <p>
          While 25 minutes is standard, some students prefer 45-50 minute sessions for deeper work. Experiment to find your optimal duration. Vistara's session timer helps you track and optimize your Pomodoro sessions.
        </p>

        <h2>Pro Tips</h2>
        <ul>
          <li>During breaks, stand up, stretch, or get some fresh air</li>
          <li>Avoid checking social media during breaks—it makes returning to work harder</li>
          <li>Track how many Pomodoros different tasks take to improve planning</li>
        </ul>
      </>
    )
  },
  'study-timetable-creation': {
    slug: 'study-timetable-creation',
    title: 'How to Create the Perfect Study Timetable for Exam Success',
    excerpt: 'Step-by-step guide to creating a balanced study schedule that covers all subjects and prevents burnout.',
    category: 'Planning',
    readTime: '12 min read',
    date: '2025-12-30',
    author: 'Vistara Team',
    keywords: ['study timetable', 'study schedule', 'exam planning', 'revision timetable', 'study organization', 'time management'],
    relatedPosts: ['pomodoro-technique-students', 'spaced-repetition-guide'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          A well-structured study timetable is the foundation of exam success. Here's how to create one that actually works.
        </p>

        <h2>Why You Need a Study Timetable</h2>
        <p>
          Without a plan, it's easy to spend too much time on favorite subjects while neglecting others. A timetable ensures balanced coverage and reduces last-minute panic.
        </p>

        <h2>Step 1: Audit Your Time</h2>
        <p>
          Start by mapping out your fixed commitments: school hours, extracurriculars, meals, and sleep. The remaining time is available for study.
        </p>

        <h2>Step 2: List Your Subjects and Topics</h2>
        <p>
          Break down each subject into specific topics. This helps you allocate time proportionally based on difficulty and importance.
        </p>

        <h2>Step 3: Prioritize Based on Exams</h2>
        <p>
          Work backwards from your exam dates. Subjects with earlier exams or more content need more study time.
        </p>

        <div className="my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Timetable Best Practices</h3>
          <ul className="space-y-2">
            <li>✓ Study difficult subjects when you're most alert</li>
            <li>✓ Include regular breaks (every 45-60 minutes)</li>
            <li>✓ Build in buffer time for unexpected events</li>
            <li>✓ Schedule review sessions, not just new learning</li>
            <li>✓ Keep weekends lighter to prevent burnout</li>
          </ul>
        </div>

        <h2>Step 4: Be Realistic</h2>
        <p>
          Don't plan 12-hour study days. Sustainable progress beats intense bursts followed by burnout.
        </p>

        <h2>Let AI Do the Heavy Lifting</h2>
        <p>
          Creating the perfect timetable manually is time-consuming. Vistara's AI analyzes your subjects, exam dates, and preferences to generate an optimized schedule in minutes. <Link to="/auth" className="text-primary hover:underline">Try it free</Link>.
        </p>
      </>
    )
  },
  'group-study-benefits': {
    slug: 'group-study-benefits',
    title: '5 Proven Benefits of Study Groups and How to Start One',
    excerpt: 'Research shows study groups can improve grades by up to 20%. Learn how to form an effective study group.',
    category: 'Collaboration',
    readTime: '7 min read',
    date: '2025-12-28',
    author: 'Vistara Team',
    keywords: ['study groups', 'collaborative learning', 'peer study', 'group revision', 'study partners', 'academic success'],
    relatedPosts: ['active-recall-study-technique', 'exam-anxiety-tips'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          Studying with others isn't just more fun—it's scientifically proven to improve learning outcomes. Here's how to make the most of collaborative study.
        </p>

        <h2>The Science of Social Learning</h2>
        <p>
          Research from the University of Minnesota found that students in study groups performed up to 20% better than those studying alone. Why? Teaching others reinforces your own understanding.
        </p>

        <h2>5 Key Benefits</h2>
        
        <h3>1. Accountability</h3>
        <p>Scheduled group sessions create commitment. You're less likely to skip studying when others are counting on you.</p>
        
        <h3>2. Multiple Perspectives</h3>
        <p>Different people understand concepts in different ways. Hearing alternative explanations can clarify confusing topics.</p>
        
        <h3>3. Gap Identification</h3>
        <p>Explaining concepts to others quickly reveals what you don't fully understand.</p>
        
        <h3>4. Motivation Boost</h3>
        <p>Seeing peers work hard inspires you to match their effort.</p>
        
        <h3>5. Resource Sharing</h3>
        <p>Share notes, past papers, and study materials to benefit everyone.</p>

        <h2>How to Form an Effective Study Group</h2>
        <ul>
          <li>Keep groups small (3-5 people)</li>
          <li>Choose members with similar commitment levels</li>
          <li>Set clear goals for each session</li>
          <li>Rotate teaching responsibilities</li>
          <li>Use tools like Vistara Groups to coordinate schedules</li>
        </ul>

        <p>
          Ready to study together? <Link to="/connect" className="text-primary hover:underline">Create or join a study group</Link> on Vistara.
        </p>
      </>
    )
  },
  'exam-anxiety-tips': {
    slug: 'exam-anxiety-tips',
    title: 'Overcome Exam Anxiety: 10 Techniques That Actually Work',
    excerpt: 'Combat test anxiety with proven strategies from psychologists and top-performing students.',
    category: 'Wellness',
    readTime: '9 min read',
    date: '2025-12-25',
    author: 'Vistara Team',
    keywords: ['exam anxiety', 'test anxiety', 'exam stress', 'study stress', 'mental health students', 'exam preparation tips'],
    relatedPosts: ['pomodoro-technique-students', 'study-timetable-creation'],
    content: (
      <>
        <p className="lead text-xl text-muted-foreground mb-8">
          Sweaty palms, racing heart, blank mind—exam anxiety affects millions of students. Here are evidence-based techniques to manage it.
        </p>

        <h2>Understanding Exam Anxiety</h2>
        <p>
          Some stress before exams is normal and can even improve performance. But when anxiety becomes overwhelming, it can sabotage your ability to recall what you've learned.
        </p>

        <h2>10 Proven Techniques</h2>

        <h3>1. Prepare Thoroughly</h3>
        <p>The best antidote to anxiety is confidence, and confidence comes from preparation. A solid study timetable removes uncertainty about whether you've covered everything.</p>

        <h3>2. Practice Under Exam Conditions</h3>
        <p>Do timed practice papers in a quiet room. Familiarity with the exam format reduces surprises and stress.</p>

        <h3>3. Use Deep Breathing</h3>
        <p>When anxiety spikes, try 4-7-8 breathing: inhale for 4 seconds, hold for 7, exhale for 8. This activates your parasympathetic nervous system.</p>

        <h3>4. Reframe Your Thoughts</h3>
        <p>Instead of "I'm going to fail," try "I've prepared well, and I'll do my best." Cognitive reframing can significantly reduce anxiety.</p>

        <h3>5. Visualize Success</h3>
        <p>Spend a few minutes each day imagining yourself calmly answering questions and feeling confident.</p>

        <h3>6. Get Enough Sleep</h3>
        <p>Sleep is essential for memory consolidation. Pulling all-nighters typically hurts more than it helps.</p>

        <h3>7. Exercise Regularly</h3>
        <p>Physical activity reduces cortisol (stress hormone) and releases endorphins. Even a 20-minute walk helps.</p>

        <h3>8. Limit Caffeine</h3>
        <p>While a coffee can boost alertness, too much caffeine can worsen anxiety symptoms.</p>

        <h3>9. Talk to Someone</h3>
        <p>Share your feelings with friends, family, or a counselor. You're not alone in feeling this way.</p>

        <h3>10. Have a Pre-Exam Routine</h3>
        <p>Create a calming routine for exam mornings: a good breakfast, light review, and arriving early.</p>

        <div className="my-8 p-6 bg-primary/5 rounded-xl border border-primary/20">
          <h3 className="text-lg font-semibold mb-4">Quick Anxiety Relief During Exams</h3>
          <ul className="space-y-2">
            <li>✓ If you blank out, move to an easier question and return later</li>
            <li>✓ Take slow, deep breaths</li>
            <li>✓ Focus only on the current question, not the entire exam</li>
            <li>✓ Remind yourself that some anxiety is normal and manageable</li>
          </ul>
        </div>

        <p>
          Remember: your worth isn't defined by exam results. With the right strategies and consistent preparation using tools like Vistara, you can approach exams with confidence.
        </p>
      </>
    )
  }
};

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? blogPostsData[slug] : null;

  if (!post) {
    return <Navigate to="/blog" replace />;
  }

  const relatedPosts = post.relatedPosts
    .map(relatedSlug => blogPostsData[relatedSlug])
    .filter(Boolean);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Organization",
      "name": post.author
    },
    "publisher": {
      "@type": "Organization",
      "name": "Vistara",
      "logo": {
        "@type": "ImageObject",
        "url": "https://vistara.study/favicon.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://vistara.study/blog/${post.slug}`
    },
    "keywords": post.keywords.join(', ')
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.title} | Vistara Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta name="keywords" content={post.keywords.join(', ')} />
        <link rel="canonical" href={`https://vistara.study/blog/${post.slug}`} />
        
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={`https://vistara.study/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post.date} />
        <meta property="article:author" content={post.author} />
        <meta property="article:section" content={post.category} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <Header />
        
        <main className="container mx-auto px-4 py-12">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </nav>

          <article className="max-w-3xl mx-auto">
            {/* Header */}
            <header className="mb-12">
              <Badge className="mb-4">{post.category}</Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
                <span>By {post.author}</span>
              </div>
            </header>

            {/* Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:text-muted-foreground prose-p:leading-relaxed prose-li:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              {post.content}
            </div>

            {/* Share */}
            <div className="mt-12 pt-8 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Found this helpful?</span>
                <Button variant="outline" onClick={handleShare} className="gap-2">
                  <Share2 className="w-4 h-4" />
                  Share Article
                </Button>
              </div>
            </div>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-16">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Card key={relatedPost.slug} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <Badge variant="outline" className="mb-3">{relatedPost.category}</Badge>
                        <h3 className="font-bold mb-2 line-clamp-2">
                          <Link to={`/blog/${relatedPost.slug}`} className="hover:text-primary transition-colors">
                            {relatedPost.title}
                          </Link>
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* CTA */}
            <section className="mt-16 text-center bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl p-12">
              <BookOpen className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">
                Put These Tips Into Practice
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your personalized AI-powered study timetable and start studying smarter today.
              </p>
              <Link 
                to="/auth"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-colors"
              >
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
            </section>
          </article>
        </main>
      </div>
    </>
  );
}
