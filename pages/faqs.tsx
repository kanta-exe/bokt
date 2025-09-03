import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  // For Businesses
  {
    question: "How does BOKT work?",
    answer: "BOKT connects brands with professional models. Simply browse our model directory, select your preferred model, choose your shoot details (duration, location, budget), and book your session.",
    category: "For Businesses"
  },
  {
    question: "How do I book a model?",
    answer: "Browse profiles, select a model, and send a booking request with date, budget, time, and details",
    category: "For Businesses"
  },
  {
    question: "How much does it cost to book a model?",
    answer: "You set your own budget. Yet pricing varies based on the model's experience, shoot duration, and location. Half-day sessions start at 2,500 EGP, full-day sessions at 3,500 EGP, and multiple-day sessions at 3,500 EGP per day.",
    category: "For Businesses"
  },
  {
    question: "What is included in the booking fee?",
    answer: "The booking fee covers the model's time, basic coordination, and platform service fees. Additional costs like makeup, styling, or location fees are not included and should be discussed separately with the model.",
    category: "For Businesses"
  },
  {
    question: "Can I cancel or reschedule a booking?",
    answer: "Yes, you can cancel or reschedule bookings according to our cancellation policy. Cancellations made more than 24 hours before the shoot are typically fully refundable. Late cancellations may incur fees.",
    category: "For Businesses"
  },

  {
    question: "What happens if the model doesn't show up?",
    answer: "f a model cancels, we help you find alternatives. If they are a no-show, you get a full refund and replacement options.",
    category: "For Businesses"
  },
  {
    question: "How do payments work?",
    answer: "We accept all major credit cards and digital payment methods. Payments are processed securely through our platform. For models, payments are released after the shoot is completed and confirmed by both parties.",
    category: "For Businesses"
  },
  {
    question: "Who covers transportation?",
    answer: "You must cover transportation if the shoot is outside the model’s living city.",
    category: "For Businesses"
  },
  {
    question: "What if I have a dispute with a model?",
    answer: "We encourage open communication between parties. If you encounter any issues, contact our support team immediately. We'll mediate the situation and ensure a fair resolution for all parties involved.",
    category: "For Businesses"
  },

  {
    question: "Can I book models for international shoots?",
    answer: "Currently, we primarily serve the Egyptian market. However, we're expanding and may offer international bookings in the future. Contact us directly for special international arrangements.",
    category: "For Businesses"
  },
  {
    question: "How do I contact customer support?",
    answer: "You can reach our support team via email at support@bokt.dev, phone at +20 115 888 9002, or WhatsApp at the same number. We typically respond within 2-4 hours during business hours.",
    category: "For Businesses"
  },
  
  // For Models
  {
    question: "Can I accept, refuse, or counter offers?",
    answer: "Yes, you have full control over your bookings. You can accept, refuse, or counter any offers from businesses. This gives you the flexibility to negotiate terms that work best for you.",
    category: "For Models"
  },
  {
    question: "What are the minimum rates for different session types?",
    answer: "Half-day sessions (≤4 hours) have a minimum rate of 2,500 EGP. Full-day sessions (>4 hours) have a minimum rate of 3,500 EGP. These are base rates and you can set higher rates based on your experience and demand.",
    category: "For Models"
  },
  {
    question: "What commission does BOKT take?",
    answer: "BOKT takes a 20% commission per booking. This covers our platform services, and customer support. The remaining 80% goes directly to you.",
    category: "For Models"
  },
  {
    question: "When do I get paid?",
    answer: "You will be paid within 2 business days after the shoot is completed and confirmed by both parties. There are no upfront fees required from you.",
    category: "For Models"
  },
  {
    question: "Do I pay to join BOKT",
    answer: "No, there are no upfront fees for models.",
    category: "For Models"
  },
  {
    question: "Who covers transportation costs?",
    answer: "Transportation is covered by the business if the job is outside your city. This ensures you don't incur additional costs for travel to different locations.",
    category: "For Models"
  },
  {
    question: "How do I become a model on BOKT?",
    answer: "To become a model, visit our application page and submit your details including photos, measurements, and experience. Our team will review your application and get back to you within 48 hours.",
    category: "For Models"
  },
  {
    question: "What are the requirements to be a model?",
    answer: "We welcome models of all ages, sizes, and experience levels. While professional experience is beneficial, we also accept new models who are passionate about modeling. You must be at least 18 years old and provide accurate information.",
    category: "For Models"
  }
];

const categories = ["For Businesses", "For Models"];

export default function FAQs() {
  const [selectedCategory, setSelectedCategory] = useState("For Businesses");
  const [openItems, setOpenItems] = useState<number[]>([]);

  const filteredFaqs = faqs.filter(faq => faq.category === selectedCategory);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="container-page py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Find answers to common questions for businesses and models
        </p>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-accent text-black"
                    : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left bg-muted hover:bg-muted/80 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-foreground">{faq.question}</span>
                {openItems.includes(index) ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
              {openItems.includes(index) && (
                <div className="px-6 py-4 bg-background border-t border-border">
                  <p className="text-foreground leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div className="mt-12 p-6 bg-muted rounded-lg text-center">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="mailto:support@bokt.dev"
              className="inline-flex items-center justify-center px-6 py-3 bg-accent text-black font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              Email Support
            </Link>
            <Link
              href="tel:+201158889002"
              className="inline-flex items-center justify-center px-6 py-3 border border-border text-foreground font-medium rounded-lg hover:bg-muted transition-colors"
            >
              Call Us
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <Link 
            href="/" 
            className="inline-flex items-center text-accent hover:text-accent/80 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {}
  };
};
