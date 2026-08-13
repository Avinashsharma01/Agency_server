import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: [true, 'Client name is required'],
      trim: true,
      minlength: [2, 'Client name must be at least 2 characters'],
      maxlength: [100, 'Client name must not exceed 100 characters'],
    },
    clientDesignation: {
      type: String,
      trim: true,
      default: '',
    },
    clientCompany: {
      type: String,
      trim: true,
      default: '',
    },
    clientAvatar: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
      trim: true,
      minlength: [5, 'Testimonial content must be at least 5 characters'],
      maxlength: [1000, 'Testimonial content must not exceed 1000 characters'],
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
      default: 5,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      default: null,
      index: true,
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
testimonialSchema.index({ isDeleted: 1, isActive: 1, isFeatured: 1, order: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
