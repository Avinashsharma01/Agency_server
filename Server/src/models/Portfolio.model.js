import mongoose from 'mongoose';

const portfolioSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Portfolio title is required'],
      trim: true,
      minlength: [2, 'Portfolio title must be at least 2 characters'],
      maxlength: [150, 'Portfolio title must not exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Portfolio slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    client: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true,
    },
    shortDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [300, 'Short description must not exceed 300 characters'],
    },
    fullDescription: {
      type: String,
      default: '',
    },
    featuredImage: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    galleryImages: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
        caption: { type: String, default: '' },
        order: { type: Number, default: 0 },
      },
    ],
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    projectUrl: {
      type: String,
      trim: true,
      default: '',
    },
    githubUrl: {
      type: String,
      trim: true,
      default: '',
    },
    completionDate: {
      type: Date,
      default: null,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    metaTitle: {
      type: String,
      trim: true,
      default: '',
      maxlength: [100, 'Meta title must not exceed 100 characters'],
    },
    metaDescription: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Meta description must not exceed 200 characters'],
    },
    isDeleted: {
      type: Boolean,
      default: false,
      select: false,
    },
    deletedAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.isDeleted;
        delete ret.deletedAt;
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
portfolioSchema.index({ isDeleted: 1, isActive: 1, isFeatured: 1, order: 1 });
portfolioSchema.index({ category: 1, isDeleted: 1, isActive: 1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

export default Portfolio;
