import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import confusedOwl from "@/assets/confused-owl.png";

const faqs = [
  {
    question: "How does Vistara create my study plan?",
    answer: "Our AI analyzes your subjects, test dates, available time, and personal commitments. It creates an optimized schedule that spreads your revision evenly, prioritizes challenging topics, and respects your life outside of studying.",
  },
  {
    question: "What if I miss a study session?",
    answer: "No worries! Vistara automatically reschedules missed sessions into your upcoming free slots. The AI adapts your plan in real-time so you never fall behind.",
  },
  {
    question: "Is it really free to get started?",
    answer: "Yes! The free plan includes 1 timetable, daily regenerations, basic insights, and full session tracking. You can upgrade to Premium for unlimited timetables and advanced AI features when you're ready.",
  },
  {
    question: "How is this different from a regular calendar app?",
    answer: "Unlike basic calendars, Vistara uses AI to intelligently schedule your study sessions based on your learning patterns, exam dates, and topic difficulty. It also tracks your progress, provides insights, and automatically adjusts when life happens.",
  },
  {
    question: "Can I use Vistara for any subject?",
    answer: "Absolutely! Vistara works for any subject — from Maths and Sciences to Languages, History, and Arts. You can add as many subjects as you're studying and the AI will balance them all.",
  },
  {
    question: "What happens to my data?",
    answer: "Your data is encrypted and stored securely. We never share your personal information with third parties. You can delete your account and all associated data at any time.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 px-6 bg-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 via-secondary/5 to-accent/5 rounded-full blur-3xl" />

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Confused Owl - top right of heading */}
        <motion.img
          src={confusedOwl}
          alt=""
          className="absolute -right-4 md:right-8 top-0 w-24 h-24 md:w-32 md:h-32 object-contain opacity-90 -z-0 pointer-events-none"
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 0.9, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6"
          >
            <HelpCircle className="w-8 h-8 text-primary" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Frequently asked{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              questions
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Everything you need to know about Vistara
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <AccordionItem 
                  value={`item-${i}`}
                  className="bg-card rounded-2xl border border-border/50 px-6 shadow-sm hover:shadow-md transition-shadow data-[state=open]:shadow-lg data-[state=open]:border-primary/30"
                >
                  <AccordionTrigger className="text-left font-display font-semibold text-lg py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 text-base leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection;
