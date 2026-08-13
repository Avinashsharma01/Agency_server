import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Service title is required'],
      trim: true,
      minlength: [2, 'Service title must be at least 2 characters'],
      maxlength: [150, 'Service title must not exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Service slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
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
    icon: {
      type: String,
      trim: true,
      default: '',
    },
    featuredImage: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
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
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
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
serviceSchema.index({ isDeleted: 1, isActive: 1, isFeatured: 1, order: 1 });
serviceSchema.index({ category: 1, isDeleted: 1, isActive: 1 });

const Service = mongoose.model('Service', serviceSchema);

export default Service;
