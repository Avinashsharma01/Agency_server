import swaggerJSDoc from 'swagger-jsdoc';
import config from './config/index.js';

/**
 * Swagger/OpenAPI 3.0 configuration.
 * Scans all route files for @swagger JSDoc annotations and generates the spec.
 */
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Agency CMS — REST API',
    version: '1.0.0',
    description:
      'Production-ready RESTful API for the Agency Management System. ' +
      'Covers authentication, user management, content management (services, packages, FAQs, ' +
      'portfolio, blogs, team, testimonials, leads), media uploads (Cloudinary), and website settings.',
    contact: {
      name: 'API Support',
      email: 'admin@agency.com',
    },
    license: {
      name: 'ISC',
    },
  },
  servers: [
    {
      url: `http://localhost:${config.app.port}/api/${config.app.apiVersion}`,
      description: 'Development server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token (obtained from POST /auth/login)',
      },
    },
    schemas: {
      // ─── Common Schemas ──────────────────────────────────────────────
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          errors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                message: { type: 'string' },
              },
            },
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalItems: { type: 'integer', example: 50 },
          totalPages: { type: 'integer', example: 5 },
          hasNextPage: { type: 'boolean', example: true },
          hasPrevPage: { type: 'boolean', example: false },
        },
      },

      // ─── Auth ────────────────────────────────────────────────────────
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@agency.com' },
          password: { type: 'string', example: 'Admin@123456' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/User' },
              accessToken: { type: 'string' },
            },
          },
        },
      },

      // ─── User ────────────────────────────────────────────────────────
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Super Admin' },
          email: { type: 'string', format: 'email' },
          avatar: { type: 'string', nullable: true },
          role: { type: 'string', example: 'super_admin' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Category ────────────────────────────────────────────────────
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Web Development' },
          slug: { type: 'string', example: 'web-development' },
          description: { type: 'string' },
          icon: { type: 'string' },
          isActive: { type: 'boolean' },
          order: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Service ─────────────────────────────────────────────────────
      Service: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Custom Website Design' },
          slug: { type: 'string', example: 'custom-website-design' },
          shortDescription: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          bannerImage: { type: 'string' },
          icon: { type: 'string' },
          status: { type: 'string', enum: ['active', 'inactive', 'draft'] },
          isFeatured: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Package ─────────────────────────────────────────────────────
      Package: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Basic Plan' },
          service: { type: 'string' },
          price: { type: 'number', example: 499 },
          features: { type: 'array', items: { type: 'string' } },
          isPopular: { type: 'boolean' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── FAQ ─────────────────────────────────────────────────────────
      Faq: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          question: { type: 'string', example: 'What is your turnaround time?' },
          answer: { type: 'string' },
          service: { type: 'string' },
          order: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Portfolio ───────────────────────────────────────────────────
      Portfolio: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'E-Commerce Redesign' },
          slug: { type: 'string' },
          description: { type: 'string' },
          client: { type: 'string' },
          projectUrl: { type: 'string' },
          technologies: { type: 'array', items: { type: 'string' } },
          images: { type: 'array', items: { type: 'string' } },
          isFeatured: { type: 'boolean' },
          status: { type: 'string', enum: ['active', 'inactive', 'draft'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Blog ────────────────────────────────────────────────────────
      Blog: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string', example: 'Top 10 Web Design Trends' },
          slug: { type: 'string' },
          content: { type: 'string' },
          excerpt: { type: 'string' },
          featuredImage: { type: 'string' },
          category: { type: 'string' },
          author: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['draft', 'published'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── TeamMember ──────────────────────────────────────────────────
      TeamMember: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Jane Doe' },
          position: { type: 'string', example: 'Senior Designer' },
          bio: { type: 'string' },
          avatar: { type: 'string' },
          socialLinks: {
            type: 'object',
            properties: {
              linkedin: { type: 'string' },
              twitter: { type: 'string' },
              github: { type: 'string' },
            },
          },
          order: { type: 'integer' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Testimonial ────────────────────────────────────────────────
      Testimonial: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          clientName: { type: 'string', example: 'John Smith' },
          company: { type: 'string', example: 'TechCorp' },
          content: { type: 'string' },
          rating: { type: 'integer', minimum: 1, maximum: 5 },
          avatar: { type: 'string' },
          isActive: { type: 'boolean' },
          isFeatured: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Lead ────────────────────────────────────────────────────────
      Lead: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string', example: 'Alice Johnson' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          subject: { type: 'string' },
          message: { type: 'string' },
          service: { type: 'string' },
          status: { type: 'string', enum: ['new', 'contacted', 'qualified', 'converted', 'closed'] },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Media ───────────────────────────────────────────────────────
      Media: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          filename: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string', example: 'image/png' },
          format: { type: 'string', example: 'png' },
          size: { type: 'integer', description: 'File size in bytes' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          publicId: { type: 'string', description: 'Cloudinary public_id' },
          url: { type: 'string', description: 'Cloudinary secure_url or local URL' },
          folder: { type: 'string', example: 'banners' },
          alt: { type: 'string' },
          caption: { type: 'string' },
          uploadedBy: { $ref: '#/components/schemas/User' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },

      // ─── Settings ────────────────────────────────────────────────────
      Settings: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          siteName: { type: 'string', example: 'Agency CMS' },
          siteTagline: { type: 'string' },
          siteLogo: {
            type: 'object',
            properties: {
              publicId: { type: 'string', nullable: true },
              url: { type: 'string', nullable: true },
            },
          },
          contactEmail: { type: 'string', format: 'email' },
          contactPhone: { type: 'string' },
          contactAddress: { type: 'string' },
          socialLinks: {
            type: 'object',
            properties: {
              facebook: { type: 'string' },
              twitter: { type: 'string' },
              linkedin: { type: 'string' },
              instagram: { type: 'string' },
              youtube: { type: 'string' },
              github: { type: 'string' },
            },
          },
          seo: {
            type: 'object',
            properties: {
              metaTitle: { type: 'string' },
              metaDescription: { type: 'string' },
            },
          },
          footerText: { type: 'string' },
          maintenanceMode: { type: 'boolean' },
          analytics: {
            type: 'object',
            properties: {
              googleAnalyticsId: { type: 'string' },
              facebookPixelId: { type: 'string' },
            },
          },
        },
      },
    },
  },
  tags: [
    { name: 'Auth', description: 'Authentication & password management' },
    { name: 'Users', description: 'User management (Admin only)' },
    { name: 'Categories', description: 'Service category management' },
    { name: 'Services', description: 'Agency service management' },
    { name: 'Packages', description: 'Service pricing packages' },
    { name: 'FAQs', description: 'Frequently asked questions (per service)' },
    { name: 'Portfolio', description: 'Portfolio project showcase' },
    { name: 'Blogs', description: 'Blog content management' },
    { name: 'Team', description: 'Team member management' },
    { name: 'Testimonials', description: 'Client testimonial management' },
    { name: 'Leads', description: 'Lead / contact form management' },
    { name: 'Media', description: 'Cloudinary media library (upload, browse, delete)' },
    { name: 'Settings', description: 'Singleton website configuration' },
  ],
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.routes.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
