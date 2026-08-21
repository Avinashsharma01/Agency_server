import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Package name is required'],
      trim: true,
      minlength: [2, 'Package name must be at least 2 characters'],
      maxlength: [100, 'Package name must not exceed 100 characters'],
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service reference is required'],
      index: true,
    },
    packageType: {
      type: String,
      enum: {
        values: ['basic', 'standard', 'premium', 'custom'],
        message: '{VALUE} is not a valid package type',
      },
      default: 'standard',
    },
    price: {
      type: Number,
      required: [true, 'Package price is required'],
      min: [0, 'Price cannot be negative'],
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: 'INR',
    },
    billingPeriod: {
      type: String,
      enum: {
        values: ['one_time', 'monthly', 'yearly'],
        message: '{VALUE} is not a valid billing period',
      },
      default: 'one_time',
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    features: [
      {
        text: { type: String, required: true, trim: true },
        isIncluded: { type: Boolean, default: true },
      },
    ],
    isPopular: {
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
packageSchema.index({ service: 1, isDeleted: 1, isActive: 1, order: 1 });
packageSchema.index({ packageType: 1, isDeleted: 1 });

const Package = mongoose.model('Package', packageSchema);

export default Package;
