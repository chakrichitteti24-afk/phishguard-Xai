"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function Testimonials() {
  const testimonials = [
    {
      name: "Sarah Jenkins",
      role: "CISO at TechCorp",
      content: "PhishGuard XAI fundamentally changed how our SOC team operates. The AI explanations cut our incident triage time by 70%. It's not just another black-box scanner.",
    },
    {
      name: "David Chen",
      role: "Security Researcher",
      content: "The zero-day detection capabilities are remarkable. It caught a sophisticated WhatsApp phishing campaign that bypassed all our enterprise filters.",
    },
    {
      name: "Elena Rodriguez",
      role: "IT Director",
      content: "Finally, a security tool that users can actually understand. The XAI risk reports educate our employees in real-time, preventing future mistakes.",
    },
  ];

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by <span className="text-gradient">Security Experts</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="glass-panel p-8 flex flex-col gap-6 relative group"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                <svg className="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              
              <p className="text-foreground/80 leading-relaxed flex-1 z-10 relative">
                &quot;{testimonial.content}&quot;
              </p>
              
              <div className="flex items-center gap-4 z-10 relative mt-auto">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-bold text-white">
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-semibold">{testimonial.name}</h4>
                  <p className="text-sm text-foreground/50">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
