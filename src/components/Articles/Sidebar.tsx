'use client';

import Image from "next/image";
import type { BlogPost } from "@/lib/blog";

// Testimonios escalables por categoría
const testimonialsByCategory: Record<string, {
  quote: string;
  name: string;
  role: string;
  image: string;
  icon: string;
}> = {
  Services: {
    quote: "The deep cleaning service exceeded all my expectations. My home has never looked this pristine! The team was professional, thorough, and paid attention to every detail. I highly recommend Integrity Clean Solutions to anyone looking for top-quality cleaning.",
    name: "Maria Rodriguez",
    role: "Homeowner",
    image: "/images/services/customer-img.jpg",
    icon: "/images/icon/cleaning-icon.svg"
  },
  Guides: {
    quote: "Following their cleaning guides has transformed how I maintain my home. The tips are practical, easy to follow, and actually work! I've saved so much time and my house stays cleaner longer. Thank you for sharing these valuable insights!",
    name: "Jennifer & Michael Chen",
    role: "First-time Homeowners",
    image: "/images/services/customer-img.jpg",
    icon: "/images/icon/guide-icon.svg"
  },
  Benefits: {
    quote: "Switching to professional cleaning was the best decision for my family's health. The eco-friendly products and thorough sanitization have made such a difference, especially for my kids' allergies. Worth every penny!",
    name: "Sarah Thompson",
    role: "Busy Mom of Three",
    image: "/images/services/customer-img.jpg",
    icon: "/images/icon/leaf-icon.svg"
  },
  Airbnb: {
    quote: "Since hiring Integrity Clean for my Airbnb turnovers, my ratings have skyrocketed! Guests consistently mention how spotless everything is. The reliable service helps me maintain Superhost status effortlessly.",
    name: "David Martinez",
    role: "Airbnb Superhost",
    image: "/images/services/customer-img.jpg",
    icon: "/images/icon/home-icon.svg"
  },
  default: {
    quote: "Integrity Clean Solutions transformed my home! The attention to detail, professional service, and friendly team made the entire experience exceptional. My house has never looked or smelled better. I recommend them to all my friends and family!",
    name: "Emily & John Smith",
    role: "Satisfied Customers",
    image: "/images/services/customer-img.jpg",
    icon: "/images/icon/home-icon.svg"
  }
};

// Fallback por tags si no hay categoría específica
const getTestimonial = (post: BlogPost) => {
  const category = post.frontmatter.category;
  
  // Primero buscar por categoría exacta
  if (testimonialsByCategory[category]) {
    return testimonialsByCategory[category];
  }
  
  // Fallback por tags
  const tags = post.frontmatter.tags || [];
  if (tags.some(tag => tag.toLowerCase().includes('airbnb'))) {
    return testimonialsByCategory.Airbnb;
  }
  if (tags.some(tag => tag.toLowerCase().includes('eco') || tag.toLowerCase().includes('green'))) {
    return testimonialsByCategory.Benefits;
  }
  
  // Default
  return testimonialsByCategory.default;
};

interface SidebarProps {
  post: BlogPost;
  publishedDate: string;
}

export function Sidebar({ post, publishedDate }: SidebarProps) {
  const testimonial = getTestimonial(post);
  
  return (
    <aside className="flex flex-col gap-4 sm:gap-8 w-full lg:w-[320px] xl:w-[360px] lg:shrink-0 lg:sticky lg:top-24 h-fit">
      {/* Info Card */}
      <div className="relative bg-secondary shadow-xl p-5 xl:py-8 xl:px-6 w-full rounded-md">
        <div className="relative z-10 flex flex-col gap-6 rounded-md">
          <div className="flex flex-col flex-wrap gap-2">
            <span className="text-white/80 text-sm uppercase tracking-wide">
              Category
            </span>
            <h4 className="text-white font-semibold text-lg">{post.frontmatter.category}</h4>
          </div>
          
          <ul className="relative flex flex-col gap-3">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white">Published: {publishedDate}</p>
            </li>
            
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white">Reading time: {post.readingTime} min</p>
            </li>
            
            {post.frontmatter.featured && (
              <li className="flex items-center gap-3">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-yellow-400 font-medium">Featured Article</p>
              </li>
            )}
          </ul>
        </div>
        
        {/* Decorative element */}
        <div className="absolute right-0 bottom-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" className="w-full h-full fill-white">
            <circle cx="80" cy="80" r="60" />
          </svg>
        </div>
      </div>

      {/* Testimonial Card - Sticky */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg flex flex-col gap-4 sm:gap-5 rounded-md p-5 xl:py-8 xl:px-6">
        {/* Icon */}
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        </div>
        
        {/* Quote */}
        <blockquote className="text-secondary/80 dark:text-white/80 text-base leading-relaxed italic">
          &ldquo;{testimonial.quote}&rdquo;
        </blockquote>
        
        {/* Customer Info */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex-shrink-0">
            <Image
              src={testimonial.image}
              alt={testimonial.name}
              height={48}
              width={48}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h6 className="font-semibold text-secondary dark:text-white">{testimonial.name}</h6>
            <p className="text-sm text-secondary/60 dark:text-white/60">{testimonial.role}</p>
          </div>
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-gradient-to-br from-primary to-deep-blue p-5 xl:py-6 xl:px-6 rounded-md text-white">
        <h5 className="font-semibold text-lg mb-2">Ready for a Cleaner Home?</h5>
        <p className="text-white/80 text-sm mb-4">
          Experience the difference professional cleaning makes. Book your service today!
        </p>
        <a 
          href="/contact-us" 
          className="inline-block bg-white text-primary font-semibold px-4 py-2 rounded-md hover:bg-gray-100 transition-colors text-sm"
        >
          Get a Free Quote
        </a>
      </div>
    </aside>
  );
}
