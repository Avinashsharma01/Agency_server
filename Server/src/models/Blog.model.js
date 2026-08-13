import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [2, 'Blog title must be at least 2 characters'],
      maxlength: [200, 'Blog title must not exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Blog slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
    },
    excerpt: {
      type: String,
      trim: true,
      default: '',
      maxlength: [400, 'Excerpt must not exceed 400 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
      index: true,
    },
    featuredImage: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 1,
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
blogSchema.index({ status: 1, isDeleted: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1, isDeleted: 1 });
blogSchema.index({ author: 1, isDeleted: 1 });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
