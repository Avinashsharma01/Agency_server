import mongoose from 'mongoose';
import 'dotenv/config';
import connectDatabase, { disconnectDatabase } from '../../config/database.js';
import Role from '../../models/Role.model.js';
import User from '../../models/User.model.js';
import Setting from '../../models/Setting.model.js';
import Category from '../../models/Category.model.js';
import Service from '../../models/Service.model.js';
import Package from '../../models/Package.model.js';
import Portfolio from '../../models/Portfolio.model.js';
import Blog from '../../models/Blog.model.js';
import Faq from '../../models/Faq.model.js';
import TeamMember from '../../models/TeamMember.model.js';
import Testimonial from '../../models/Testimonial.model.js';
import Lead from '../../models/Lead.model.js';
import config from '../../config/index.js';
import { ROLES, ROLE_LIST } from '../../constants/index.js';
import logger from '../../utils/logger.js';

/**
 * Master Seeder Script for ParaSiteMedia
 * Populates complete seed data across all modules for frontend & API testing.
 *
 * Usage: node src/database/seeds/masterSeeder.js
 */
const seedAllData = async () => {
  try {
    await connectDatabase();
    logger.info('🌱 Starting Master Database Seeding...\n');

    // ─── 1. Roles ─────────────────────────────────────────────────────────────
    logger.info('🔹 1. Seeding Roles...');
    const roleDescriptions = {
      admin: 'Full system access. Can manage all resources, users, and settings.',
      manager: 'Can manage content, services, leads, and team members.',
      editor: 'Can create and edit content such as blogs, portfolio, and media.',
    };

    const roleMap = {};
    for (const roleName of ROLE_LIST) {
      let roleDoc = await Role.findOne({ name: roleName });
      if (!roleDoc) {
        roleDoc = await Role.create({
          name: roleName,
          description: roleDescriptions[roleName] || '',
          isActive: true,
        });
        logger.info(`   ✅ Role '${roleName}' created`);
      } else {
        logger.info(`   ⏩ Role '${roleName}' exists`);
      }
      roleMap[roleName] = roleDoc._id;
    }

    // ─── 2. Super Admin User ──────────────────────────────────────────────────
    logger.info('\n🔹 2. Seeding Admin User...');
    let adminUser = await User.findOne({ email: config.seed.adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        name: config.seed.adminName,
        email: config.seed.adminEmail,
        password: config.seed.adminPassword,
        role: roleMap.admin,
        isActive: true,
      });
      logger.info(`   ✅ Admin user '${adminUser.email}' created`);
    } else {
      logger.info(`   ⏩ Admin user '${adminUser.email}' exists`);
    }

    // ─── 3. Site Settings ─────────────────────────────────────────────────────
    logger.info('\n🔹 3. Seeding Site Settings...');
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        siteName: 'ParaSiteMedia',
        siteTagline: 'Transforming Digital Visions into Enterprise Software Solutions',
        contactEmail: 'contact@agency.com',
        contactPhone: '+91 98765 43210',
        contactAddress: 'Innovation Tech Park, Sector 62, Noida, India',
        socialLinks: {
          twitter: 'https://twitter.com/agencycms',
          linkedin: 'https://linkedin.com/company/agencycms',
          github: 'https://github.com/agencycms',
          instagram: 'https://instagram.com/agencycms',
        },
        seo: {
          metaTitle: 'ParaSiteMedia — Full Service Digital Agency',
          metaDescription: 'Custom web development, mobile apps, UI/UX product design, and AI workflow engineering.',
        },
        footerText: '© 2026 ParaSiteMedia Portal. All rights reserved.',
      });
      logger.info('   ✅ Site settings initialized');
    } else {
      logger.info('   ⏩ Site settings exist');
    }

    // ─── 4. Categories ────────────────────────────────────────────────────────
    logger.info('\n🔹 4. Seeding Categories...');
    const categoryData = [
      { name: 'Web Development', slug: 'web-development', description: 'Full-stack custom web applications and SaaS platforms', icon: 'Code', order: 1 },
      { name: 'Mobile Apps', slug: 'mobile-apps', description: 'Cross-platform iOS and Android mobile solutions', icon: 'Smartphone', order: 2 },
      { name: 'UI/UX & Design', slug: 'ui-ux-design', description: 'User experience strategy, interface design & branding', icon: 'Palette', order: 3 },
      { name: 'Cloud & DevOps', slug: 'cloud-devops', description: 'Cloud infrastructure architecture and CI/CD pipelines', icon: 'Cloud', order: 4 },
      { name: 'AI & Automation', slug: 'ai-automation', description: 'AI agents, LLM integrations & workflow automation', icon: 'Cpu', order: 5 },
    ];

    const categoryMap = {};
    for (const cat of categoryData) {
      let doc = await Category.findOne({ slug: cat.slug });
      if (!doc) {
        doc = await Category.create(cat);
        logger.info(`   ✅ Category '${cat.name}' created`);
      } else {
        logger.info(`   ⏩ Category '${cat.name}' exists`);
      }
      categoryMap[cat.slug] = doc._id;
    }

    // ─── 5. Services ──────────────────────────────────────────────────────────
    logger.info('\n🔹 5. Seeding Services...');
    const serviceData = [
      {
        title: 'Custom Full-Stack Web Development',
        slug: 'custom-web-development',
        category: categoryMap['web-development'],
        shortDescription: 'Modern, high-performance web applications built with Next.js, Node, and scalable microservices.',
        fullDescription: '<p>We engineer enterprise-grade web applications with modern frontend frameworks and resilient backend architectures designed for high throughput and seamless user experience.</p>',
        icon: 'Layers',
        isFeatured: true,
        order: 1,
        tags: ['nextjs', 'react', 'nodejs', 'typescript'],
      },
      {
        title: 'Cross-Platform Mobile Applications',
        slug: 'cross-platform-mobile-apps',
        category: categoryMap['mobile-apps'],
        shortDescription: 'Native-feel iOS & Android apps engineered with React Native and Flutter.',
        fullDescription: '<p>Deliver smooth mobile user experiences with robust offline-first architecture, push notifications, and biometrics support.</p>',
        icon: 'Smartphone',
        isFeatured: true,
        order: 2,
        tags: ['react-native', 'flutter', 'ios', 'android'],
      },
      {
        title: 'UI/UX Product Architecture & Design Systems',
        slug: 'ui-ux-product-design',
        category: categoryMap['ui-ux-design'],
        shortDescription: 'Data-driven user experience research, design systems, and modern UI prototyping.',
        fullDescription: '<p>Create intuitive interfaces that convert users and elevate your brand identity with scalable design tokens and components.</p>',
        icon: 'Figma',
        isFeatured: true,
        order: 3,
        tags: ['figma', 'design-systems', 'ux-research'],
      },
      {
        title: 'Cloud Infrastructure & Automated DevOps',
        slug: 'cloud-infrastructure-devops',
        category: categoryMap['cloud-devops'],
        shortDescription: 'Automated CI/CD pipelines, Docker containerization, Kubernetes & AWS/GCP architecture.',
        fullDescription: '<p>Scale infrastructure effortlessly with infrastructure-as-code (Terraform), zero-downtime deployment pipelines, and 24/7 security monitoring.</p>',
        icon: 'Cloud',
        isFeatured: false,
        order: 4,
        tags: ['aws', 'docker', 'kubernetes', 'terraform'],
      },
      {
        title: 'AI Agents & Intelligent Workflow Automation',
        slug: 'ai-agents-workflow-automation',
        category: categoryMap['ai-automation'],
        shortDescription: 'Custom GenAI solutions, internal agent tools, RAG systems, and LLM integrations.',
        fullDescription: '<p>Automate repetitive business workflows and empower teams with contextual AI capabilities embedded directly into your software suite.</p>',
        icon: 'Bot',
        isFeatured: true,
        order: 5,
        tags: ['ai', 'llm', 'langchain', 'openai'],
      },
    ];

    const serviceDocs = [];
    for (const svc of serviceData) {
      let doc = await Service.findOne({ slug: svc.slug });
      if (!doc) {
        doc = await Service.create(svc);
        logger.info(`   ✅ Service '${svc.title}' created`);
      } else {
        logger.info(`   ⏩ Service '${svc.title}' exists`);
      }
      serviceDocs.push(doc);
    }

    // ─── 6. Pricing Packages ──────────────────────────────────────────────────
    logger.info('\n🔹 6. Seeding Pricing Packages...');
    const packageData = [
      {
        name: 'Starter Launch',
        service: serviceDocs[0]._id,
        packageType: 'basic',
        price: 99999,
        currency: 'INR',
        billingPeriod: 'one_time',
        description: 'Ideal for early-stage startups needing a high-converting web presence.',
        isPopular: false,
        isActive: true,
        features: [
          { text: 'Custom 5-Page Responsive Website', isIncluded: true },
          { text: 'CMS Content Integration', isIncluded: true },
          { text: 'Basic Technical SEO Tuning', isIncluded: true },
          { text: 'Domain & SSL Security Setup', isIncluded: true },
          { text: '24/7 Priority Support SLA', isIncluded: false },
        ],
      },
      {
        name: 'Professional Growth',
        service: serviceDocs[0]._id,
        packageType: 'standard',
        price: 249999,
        currency: 'INR',
        billingPeriod: 'one_time',
        description: 'Complete full-stack web application solution with modern APIs and custom design.',
        isPopular: true,
        isActive: true,
        features: [
          { text: 'Full Custom Web Application', isIncluded: true },
          { text: 'Advanced Admin CMS Dashboard', isIncluded: true },
          { text: 'REST API & Database Architecture', isIncluded: true },
          { text: 'Full Technical SEO Suite', isIncluded: true },
          { text: '3 Months Dedicated Tech Support', isIncluded: true },
        ],
      },
      {
        name: 'Enterprise Custom',
        service: serviceDocs[0]._id,
        packageType: 'premium',
        price: 499999,
        currency: 'INR',
        billingPeriod: 'one_time',
        description: 'Bespoke engineering architecture for high-traffic platforms and multi-tenant SaaS.',
        isPopular: false,
        isActive: true,
        features: [
          { text: 'Microservices & Event-Driven Arch', isIncluded: true },
          { text: 'Custom Security & RBAC Suite', isIncluded: true },
          { text: 'Multi-Cloud CI/CD Deployment', isIncluded: true },
          { text: 'Dedicated Solutions Architect', isIncluded: true },
          { text: '24/7 Monitoring & SLA Guarantee', isIncluded: true },
        ],
      },
    ];

    for (const pkg of packageData) {
      let doc = await Package.findOne({ name: pkg.name });
      if (!doc) {
        await Package.create(pkg);
        logger.info(`   ✅ Package '${pkg.name}' created`);
      } else {
        logger.info(`   ⏩ Package '${pkg.name}' exists`);
      }
    }

    // ─── 7. Portfolio / Case Studies ──────────────────────────────────────────
    logger.info('\n🔹 7. Seeding Portfolio Projects...');
    const portfolioData = [
      {
        title: 'FinTech SaaS Analytics Platform',
        slug: 'fintech-saas-analytics-platform',
        category: categoryMap['web-development'],
        service: serviceDocs[0]._id,
        clientName: 'NexaFlow Global',
        projectUrl: 'https://nexaflow.example.com',
        shortDescription: 'Real-time financial transaction monitoring dashboard handling 10M+ daily events.',
        fullDescription: '<p>Built a high-frequency financial tracking dashboard with WebSockets, interactive charts, and real-time fraud detection alerts.</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop',
        },
        technologies: ['Next.js', 'Node.js', 'Redux Toolkit', 'PostgreSQL', 'Tailwind CSS'],
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Omnichannel E-Commerce Global Storefront',
        slug: 'omnichannel-ecommerce-storefront',
        category: categoryMap['web-development'],
        service: serviceDocs[0]._id,
        clientName: 'Vogue & Co.',
        projectUrl: 'https://vogueco.example.com',
        shortDescription: 'Headless e-commerce platform with sub-second page loads and localized multi-currency checkout.',
        fullDescription: '<p>Migrated legacy store to a modern headless Next.js solution connected to Stripe payments and Cloudinary CDN image optimization.</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
        },
        technologies: ['React', 'Next.js', 'Tailwind CSS', 'Stripe API', 'Cloudinary'],
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'Telemedicine & HealthTech Mobile Platform',
        slug: 'telemedicine-healthtech-platform',
        category: categoryMap['mobile-apps'],
        service: serviceDocs[1]._id,
        clientName: 'Elevate Health Inc.',
        projectUrl: 'https://elevatehealth.example.com',
        shortDescription: 'HIPAA-compliant doctor consultation app with integrated video calls and digital prescriptions.',
        fullDescription: '<p>Engineered a seamless patient-doctor mobile application with encrypted WebRTC video streaming and automated push reminders.</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1000&auto=format&fit=crop',
        },
        technologies: ['React Native', 'WebRTC', 'Express.js', 'MongoDB', 'AWS S3'],
        isFeatured: true,
        isActive: true,
      },
      {
        title: 'AI Document Intelligence & Automation Suite',
        slug: 'ai-document-intelligence-suite',
        category: categoryMap['ai-automation'],
        service: serviceDocs[4]._id,
        clientName: 'Apex Legal Logistics',
        projectUrl: 'https://apexlegal.example.com',
        shortDescription: 'Automated legal document parser extracting metadata and summarizing contracts in seconds.',
        fullDescription: '<p>Developed an enterprise AI pipeline that automatically ingests PDFs, performs OCR, extracts structured data, and answers contextual questions.</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?q=80&w=1000&auto=format&fit=crop',
        },
        technologies: ['Python', 'FastAPI', 'OpenAI API', 'LangChain', 'React'],
        isFeatured: true,
        isActive: true,
      },
    ];

    for (const pf of portfolioData) {
      let doc = await Portfolio.findOne({ slug: pf.slug });
      if (!doc) {
        await Portfolio.create(pf);
        logger.info(`   ✅ Portfolio '${pf.title}' created`);
      } else {
        await Portfolio.updateOne({ slug: pf.slug }, { $set: { featuredImage: pf.featuredImage, isActive: true } });
        logger.info(`   🔄 Portfolio '${pf.title}' updated`);
      }
    }

    // ─── 8. Blog Posts ────────────────────────────────────────────────────────
    logger.info('\n🔹 8. Seeding Blog Posts...');
    const blogData = [
      {
        title: 'How AI Workflows are Transforming Modern Web Development in 2026',
        slug: 'ai-workflows-transforming-web-development-2026',
        author: adminUser._id,
        category: categoryMap['ai-automation'],
        excerpt: 'Explore how generative AI models and intelligent agents are revolutionizing software development velocity and product quality.',
        content: '<p>Artificial intelligence is no longer just a buzzword—it is actively transforming how software engineering teams design, build, and deploy digital products.</p><p>From automated code generation to AI-assisted code reviews and continuous integration testing, intelligence is embedded directly into developer workflows...</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop',
        },
        tags: ['ai', 'webdev', 'technology', 'future'],
        status: 'published',
        publishedAt: new Date(),
      },
      {
        title: 'Top 10 Architectural Patterns for Scalable Next.js 16 Applications',
        slug: 'top-10-architectural-patterns-nextjs-16',
        author: adminUser._id,
        category: categoryMap['web-development'],
        excerpt: 'Learn best practices for structuring Next.js App Router applications, RTK Query caching, and server actions.',
        content: '<p>Building large-scale frontend applications requires a disciplined file architecture, strict state boundaries, and resilient API integration patterns.</p><p>In Next.js 16, App Router capabilities combined with state management tools like RTK Query deliver unprecedented speed...</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop',
        },
        tags: ['nextjs', 'react', 'architecture', 'typescript'],
        status: 'published',
        publishedAt: new Date(),
      },
      {
        title: 'Designing Accessible & High-Converting UI Component Libraries',
        slug: 'designing-accessible-high-converting-ui-component-libraries',
        author: adminUser._id,
        category: categoryMap['ui-ux-design'],
        excerpt: 'A deep dive into building modular design systems with Tailwind CSS, proper ARIA attributes, and micro-animations.',
        content: '<p>User experience is defined by accessibility and speed. In this article, we break down how to design UI components that perform seamlessly for all users.</p>',
        featuredImage: {
          publicId: null,
          url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1000&auto=format&fit=crop',
        },
        tags: ['design', 'ui-ux', 'tailwindcss', 'accessibility'],
        status: 'published',
        publishedAt: new Date(),
      },
    ];

    for (const blog of blogData) {
      let doc = await Blog.findOne({ slug: blog.slug });
      if (!doc) {
        await Blog.create(blog);
        logger.info(`   ✅ Blog '${blog.title}' created`);
      } else {
        await Blog.updateOne({ slug: blog.slug }, { $set: { status: 'published', excerpt: blog.excerpt, featuredImage: blog.featuredImage, content: blog.content } });
        logger.info(`   🔄 Blog '${blog.title}' updated to published status`);
      }
    }

    // ─── 9. FAQs ──────────────────────────────────────────────────────────────
    logger.info('\n🔹 9. Seeding FAQs...');
    const faqData = [
      {
        question: 'What is your typical project development lifecycle?',
        answer: 'We follow an Agile development process: Discovery & Architecture → UI/UX Design Prototyping → Sprint Engineering → Automated QA & Security Audits → Deployment & Post-Launch SLAs.',
        service: serviceDocs[0]._id,
        isGlobal: true,
        order: 1,
        isActive: true,
      },
      {
        question: 'Do you provide post-launch support and SLAs?',
        answer: 'Yes! All custom development packages include dedicated post-launch technical support, maintenance updates, and 24/7 uptime monitoring SLAs.',
        isGlobal: true,
        order: 2,
        isActive: true,
      },
      {
        question: 'Who owns the intellectual property and source code?',
        answer: 'You retain 100% full ownership of all source code, IP rights, design assets, and database schemas upon project completion.',
        isGlobal: true,
        order: 3,
        isActive: true,
      },
      {
        question: 'Can you integrate with our existing backend infrastructure?',
        answer: 'Absoltely. We routinely integrate with legacy REST/GraphQL APIs, enterprise ERPs, payment gateways, and custom database clusters.',
        isGlobal: true,
        order: 4,
        isActive: true,
      },
    ];

    for (const fq of faqData) {
      let doc = await Faq.findOne({ question: fq.question });
      if (!doc) {
        await Faq.create(fq);
        logger.info(`   ✅ FAQ '${fq.question.substring(0, 35)}...' created`);
      } else {
        logger.info(`   ⏩ FAQ '${fq.question.substring(0, 35)}...' exists`);
      }
    }

    // ─── 10. Team Members ─────────────────────────────────────────────────────
    logger.info('\n🔹 10. Seeding Team Members...');
    const teamData = [
      {
        name: 'Avinash Sharma',
        designation: 'Founder & Principal Architect',
        bio: 'Over 10 years of experience building enterprise web software and high-throughput cloud infrastructure.',
        email: 'avinash@agency.com',
        phone: '+91 98765 00001',
        linkedin: 'https://linkedin.com',
        twitter: 'https://twitter.com',
        github: 'https://github.com',
        order: 1,
        isActive: true,
      },
      {
        name: 'Sarah Jenkins',
        designation: 'Head of UI/UX & Product Design',
        bio: 'Passionate about creating intuitive, accessible design systems and conversion-focused digital products.',
        email: 'sarah@agency.com',
        linkedin: 'https://linkedin.com',
        order: 2,
        isActive: true,
      },
      {
        name: 'David Miller',
        designation: 'Senior Full-Stack Engineer',
        bio: 'Specialist in Next.js, Node.js microservices, real-time architectures, and database query optimization.',
        email: 'david@agency.com',
        github: 'https://github.com',
        order: 3,
        isActive: true,
      },
      {
        name: 'Elena Rostova',
        designation: 'AI & Cloud Infrastructure Lead',
        bio: 'Focuses on container orchestration, automated DevOps pipelines, and custom GenAI agent workflows.',
        email: 'elena@agency.com',
        linkedin: 'https://linkedin.com',
        order: 4,
        isActive: true,
      },
    ];

    for (const tm of teamData) {
      let doc = await TeamMember.findOne({ email: tm.email });
      if (!doc) {
        await TeamMember.create(tm);
        logger.info(`   ✅ Team Member '${tm.name}' created`);
      } else {
        logger.info(`   ⏩ Team Member '${tm.name}' exists`);
      }
    }

    // ─── 11. Testimonials ─────────────────────────────────────────────────────
    logger.info('\n🔹 11. Seeding Testimonials...');
    const testimonialData = [
      {
        clientName: 'Alex Rivera',
        clientDesignation: 'CTO',
        clientCompany: 'NexaFlow Global',
        content: 'The team transformed our product velocity. Their Next.js and API architecture enabled us to handle 10M+ daily events seamlessly.',
        rating: 5,
        service: serviceDocs[0]._id,
        isFeatured: true,
        isActive: true,
      },
      {
        clientName: 'Marcus Vance',
        clientDesignation: 'VP of Product',
        clientCompany: 'Elevate Health',
        content: 'Phenomenal UI design and lightning-fast mobile execution. Our patient engagement jumped 45% within 60 days of launch.',
        rating: 5,
        service: serviceDocs[1]._id,
        isFeatured: true,
        isActive: true,
      },
      {
        clientName: 'Sophia Lin',
        clientDesignation: 'Founder & CEO',
        clientCompany: 'SaaSify',
        content: 'Hands down the best engineering team we have hired. Exceptional communication, clean code standards, and top-tier security.',
        rating: 5,
        service: serviceDocs[0]._id,
        isFeatured: true,
        isActive: true,
      },
    ];

    for (const tst of testimonialData) {
      let doc = await Testimonial.findOne({ clientName: tst.clientName, clientCompany: tst.clientCompany });
      if (!doc) {
        await Testimonial.create(tst);
        logger.info(`   ✅ Testimonial by '${tst.clientName}' created`);
      } else {
        logger.info(`   ⏩ Testimonial by '${tst.clientName}' exists`);
      }
    }

    // ─── 12. Lead Pipeline Submissions ───────────────────────────────────────
    logger.info('\n🔹 12. Seeding Lead Pipeline Submissions...');
    const leadData = [
      {
        name: 'Robert Vance',
        email: 'robert@fintechgrowth.io',
        phone: '+1 (555) 234-5678',
        subject: 'Custom SaaS Dashboard Development Inquiry',
        message: 'Hello, we are looking for a full-stack engineering team to build a financial analytics SaaS platform with Next.js and Node.js.',
        status: 'new',
        budget: '₹2,00,000 - ₹5,00,000',
      },
      {
        name: 'Jessica Alba',
        email: 'jessica@retailgroup.com',
        phone: '+1 (555) 876-5432',
        subject: 'Headless E-Commerce Migration Project',
        message: 'We want to migrate our existing Shopify storefront to a custom Next.js headless setup. Please get in touch!',
        status: 'qualified',
        budget: '₹5,00,000+',
      },
      {
        name: 'Michael Scott',
        email: 'mscott@dundermifflin.com',
        phone: '+1 (555) 999-1111',
        subject: 'Internal Enterprise Portal',
        message: 'Looking for a clean admin dashboard to manage inventory and customer inquiries.',
        status: 'contacted',
        budget: '₹1,00,000 - ₹2,00,000',
      },
    ];

    for (const ld of leadData) {
      let doc = await Lead.findOne({ email: ld.email });
      if (!doc) {
        await Lead.create(ld);
        logger.info(`   ✅ Lead '${ld.name}' created`);
      } else {
        logger.info(`   ⏩ Lead '${ld.name}' exists`);
      }
    }

    logger.info('\n🎉 Master Database Seeding Completed Successfully!');
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error(`❌ Master Seeding Failed: ${error.message}`);
    console.error(error);
    await disconnectDatabase();
    process.exit(1);
  }
};

seedAllData();
