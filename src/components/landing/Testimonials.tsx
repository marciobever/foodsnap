import React from 'react';
import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Testimonials: React.FC = () => {
  const { t } = useLanguage();

  const reviews = [
    {
      name: "Rafael Silva",
      role: t.testimonials.r1Role,
      image: "https://picsum.photos/100/100?random=10",
      content: t.testimonials.r1Content
    },
    {
      name: "Dra. Mariana Costa",
      role: t.testimonials.r2Role,
      image: "https://picsum.photos/100/100?random=11",
      content: t.testimonials.r2Content
    },
    {
      name: "Lucas Mendes",
      role: t.testimonials.r3Role,
      image: "https://picsum.photos/100/100?random=12",
      content: t.testimonials.r3Content
    }
  ];

  return (
    <section className="py-24 bg-gray-50 border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-4 tracking-tight">{t.testimonials.title}</h2>
          <p className="text-lg text-gray-600">{t.testimonials.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <div key={index} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl hover:scale-[1.02] hover:bg-brand-50/20 transition-all duration-300 border border-gray-100 flex flex-col relative group">
              <Quote className="absolute top-8 right-8 text-gray-100 group-hover:text-brand-100 transition-colors" size={40} />

              <div className="flex gap-1 mb-6 text-yellow-400">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="currentColor" />)}
              </div>

              <p className="text-gray-600 leading-relaxed mb-8 flex-grow relative z-10">"{review.content}"</p>

              <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-6 group-hover:border-brand-100/50 transition-colors">
                <img
                  src={review.image}
                  alt={review.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-brand-100 transition-all"
                />
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{review.name}</h4>
                  <p className="text-xs text-brand-600 font-medium">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;