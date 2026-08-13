import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import {
  Category,
  Service,
  Package,
  Faq,
  Portfolio,
  Blog,
  TeamMember,
  Testimonial,
  User,
} from '../../models/index.js';
import settingRepository from '../../repositories/setting.repository.js';
import { slugify } from '../../utils/slugify.js';
import logger from '../../utils/logger.js';

/**
 * Seeds demo data across all modules: Categories, Services, Packages, FAQs,
 * Portfolio, Blogs, Team, Testimonials, and Website Settings.
 */
export const seedDemoData = async () => {
  logger.info('🌱 Seeding demo data across all modules...');

  // Get admin user for author reference
  const admin = await User.findOne();
  const authorId = admin ? admin._id : null;

  // 1. Categories
  const categoriesData = [
    { name: 'Web Development', description: 'Full-stack web apps and modern frontend solutions', icon: 'code', order: 1 },
    { name: 'UI/UX Design', description: 'User-centric interface design and prototyping', icon: 'palette', order: 2 },
    { name: 'Digital Marketing', description: 'SEO, performance marketing, and lead growth', icon: 'trending-up', order: 3 },
    { name: 'Mobile Apps', description: 'iOS & Android native and cross-platform apps', icon: 'smartphone', order: 4 },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const slug = slugify(cat.name);
    const existing = await Category.findOne({ slug });
    if (existing) {
      categories.push(existing);
    } else {
      const created = await Category.create({ ...cat, slug });
      categories.push(created);
    }
  }
  logger.info(`  ✅ Categories: ${categories.length} ready`);

  // 2. Services
  const webCat = categories.find((c) => c.name === 'Web Development');
  const designCat = categories.find((c) => c.name === 'UI/UX Design');

  const servicesData = [
    {
      title: 'Custom Web Application Development',
      shortDescription: 'Scalable, performant React/Node.js web applications tailored to your business.',
      description: 'We build high-performance, secure, and scalable web applications using modern tech stacks like Node.js, Express, MongoDB, and Next.js. Tailored architecture designed to scale with your user base.',
      category: webCat ? webCat._id : categories[0]._id,
      status: 'active',
      isFeatured: true,
    },
    {
      title: 'Product UI/UX & System Design',
      shortDescription: 'Stunning user interfaces and intuitive user experiences for modern products.',
      description: 'From wireframes to interactive high-fidelity Figma prototypes, we design seamless digital products that convert visitors into loyal customers.',
      category: designCat ? designCat._id : categories[1]._id,
      status: 'active',
      isFeatured: true,
    },
  ];

  const services = [];
  for (const srv of servicesData) {
    const slug = slugify(srv.title);
    const existing = await Service.findOne({ slug });
    if (existing) {
      services.push(existing);
    } else {
      const created = await Service.create({ ...srv, slug });
      services.push(created);
    }
  }
  logger.info(`  ✅ Services: ${services.length} ready`);

  // 3. Packages (bound to service)
  if (services.length > 0) {
    const targetService = services[0];
    const packagesData = [
      {
        name: 'Starter Tier',
        service: targetService._id,
        price: 999,
        billingPeriod: 'one_time',
        features: [
          { text: 'Up to 5 Custom Pages', isIncluded: true },
          { text: 'Responsive Design', isIncluded: true },
          { text: 'Basic SEO Setup', isIncluded: true },
          { text: '1 Month Support', isIncluded: true },
        ],
        isPopular: false,
      },
      {
        name: 'Growth Tier',
        service: targetService._id,
        price: 2499,
        billingPeriod: 'one_time',
        features: [
          { text: 'Up to 15 Custom Pages', isIncluded: true },
          { text: 'CMS Integration', isIncluded: true },
          { text: 'Advanced SEO & Analytics', isIncluded: true },
          { text: '3 Months Support', isIncluded: true },
        ],
        isPopular: true,
      },
    ];

    for (const pkg of packagesData) {
      const existing = await Package.findOne({ name: pkg.name, service: targetService._id });
      if (!existing) {
        await Package.create(pkg);
      }
    }
    logger.info('  ✅ Packages: Seeded');

    // 4. FAQs (bound to service)
    const faqsData = [
      {
        question: 'What technologies do you use for web development?',
        answer: 'We specialize in Node.js, Express, React, Next.js, Vue, MongoDB, PostgreSQL, and AWS/Vercel Cloud deployments.',
        service: targetService._id,
        order: 1,
      },
      {
        question: 'How long does a standard web development project take?',
        answer: 'Most standard web projects take between 3 to 6 weeks from initial discovery to final deployment.',
        service: targetService._id,
        order: 2,
      },
    ];

    for (const faq of faqsData) {
      const existing = await Faq.findOne({ question: faq.question });
      if (!existing) {
        await Faq.create(faq);
      }
    }
    logger.info('  ✅ FAQs: Seeded');
  }

  // 5. Portfolio Items
  const portfolioData = [
    {
      title: 'Fintech Dashboard Platform',
      description: 'A real-time financial analytics dashboard with custom charts, transaction logging, and automated reporting.',
      category: webCat ? webCat._id : categories[0]._id,
      client: 'Acme Financial Ltd',
      projectUrl: 'https://example.com/portfolio/fintech',
      technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js'],
      isFeatured: true,
      status: 'active',
    },
    {
      title: 'E-Commerce Marketplace App',
      description: 'Multi-vendor e-commerce platform with real-time inventory management and Stripe payment integration.',
      category: webCat ? webCat._id : categories[0]._id,
      client: 'RetailX Global',
      projectUrl: 'https://example.com/portfolio/retailx',
      technologies: ['Next.js', 'Express', 'Stripe API', 'TailwindCSS'],
      isFeatured: true,
      status: 'active',
    },
  ];

  for (const item of portfolioData) {
    const slug = slugify(item.title);
    const existing = await Portfolio.findOne({ slug });
    if (!existing) {
      await Portfolio.create({ ...item, slug });
    }
  }
  logger.info('  ✅ Portfolio: Seeded');

  // 6. Blog Posts
  const blogData = [
    {
      title: '10 Proven Web Design Trends for 2026',
      content: 'Digital design evolves rapidly. Here are the top 10 web design trends including glassmorphism, micro-interactions, dark mode defaults, and AI-driven personalization.',
      excerpt: 'Explore the top web design trends shaping modern digital products in 2026.',
      category: webCat ? webCat._id : categories[0]._id,
      author: authorId,
      tags: ['Design', 'Web Development', 'Trends'],
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Why Micro-Animations Matter in Modern UI',
      content: 'Micro-animations guide user attention, provide instant visual feedback, and turn dull static interfaces into living interactive experiences.',
      excerpt: 'How subtle motion design improves UX and user engagement.',
      category: designCat ? designCat._id : categories[1]._id,
      author: authorId,
      tags: ['UI', 'UX', 'Animation'],
      status: 'published',
      publishedAt: new Date(),
    },
  ];

  for (const post of blogData) {
    const slug = slugify(post.title);
    const existing = await Blog.findOne({ slug });
    if (!existing) {
      await Blog.create({ ...post, slug });
    }
  }
  logger.info('  ✅ Blogs: Seeded');

  // 7. Team Members
  const teamData = [
    {
      name: 'Alexander Wright',
      designation: 'Head of Engineering',
      bio: '10+ years leading full-stack engineering teams and architecting cloud systems.',
      order: 1,
      isActive: true,
    },
    {
      name: 'Sophia Chen',
      designation: 'Lead Product Designer',
      bio: 'Passionate about crafting intuitive, accessible, and beautiful UI/UX designs.',
      order: 2,
      isActive: true,
    },
  ];

  for (const member of teamData) {
    const existing = await TeamMember.findOne({ name: member.name });
    if (!existing) {
      await TeamMember.create(member);
    }
  }
  logger.info('  ✅ Team Members: Seeded');

  // 8. Testimonials
  const testimonialsData = [
    {
      clientName: 'Marcus Vance',
      company: 'CEO, TechSphere',
      content: 'The team delivered our web application weeks ahead of schedule with flawless code quality and top-notch security.',
      rating: 5,
      isFeatured: true,
      isActive: true,
    },
    {
      clientName: 'Elena Rostova',
      company: 'Product Lead, Vantage Media',
      content: 'Our conversion rates doubled within 30 days after launching the new redesign. Highly recommended agency!',
      rating: 5,
      isFeatured: true,
      isActive: true,
    },
  ];

  for (const item of testimonialsData) {
    const existing = await Testimonial.findOne({ clientName: item.clientName });
    if (!existing) {
      await Testimonial.create(item);
    }
  }
  logger.info('  ✅ Testimonials: Seeded');

  // 9. Website Settings (Singleton)
  await settingRepository.updateSingleton({
    siteName: 'Agency CMS',
    siteTagline: 'We Build Modern Digital Products & Experiences',
    contactEmail: 'contact@agency.com',
    contactPhone: '+1 (555) 019-2831',
    contactAddress: '100 Innovation Way, Suite 500, San Francisco, CA 94107',
    socialLinks: {
      github: 'https://github.com',
      linkedin: 'https://linkedin.com',
      twitter: 'https://twitter.com',
    },
    seo: {
      metaTitle: 'Agency CMS — Full-Service Digital Agency',
      metaDescription: 'Production-grade digital agency services for web development, UI/UX design, and growth marketing.',
    },
    footerText: '© 2026 Agency CMS. All rights reserved.',
  });
  logger.info('  ✅ Settings: Seeded');

  logger.info('🎉 All demo data successfully seeded!');
};

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  connectDatabase()
    .then(() => seedDemoData())
    .then(() => disconnectDatabase())
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`❌ Demo seeding error: ${err.message}`);
      process.exit(1);
    });
}
