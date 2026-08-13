import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      trim: true,
      default: 'Agency CMS',
    },
    siteTagline: {
      type: String,
      trim: true,
      default: '',
    },
    siteLogo: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    favicon: {
      publicId: { type: String, default: null },
      url: { type: String, default: null },
    },
    contactEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: '',
    },
    contactPhone: {
      type: String,
      trim: true,
      default: '',
    },
    contactAddress: {
      type: String,
      trim: true,
      default: '',
    },
    socialLinks: {
      facebook: { type: String, trim: true, default: '' },
      twitter: { type: String, trim: true, default: '' },
      linkedin: { type: String, trim: true, default: '' },
      instagram: { type: String, trim: true, default: '' },
      youtube: { type: String, trim: true, default: '' },
      github: { type: String, trim: true, default: '' },
    },
    seo: {
      metaTitle: { type: String, trim: true, default: '' },
      metaDescription: { type: String, trim: true, default: '' },
      ogImage: {
        publicId: { type: String, default: null },
        url: { type: String, default: null },
      },
    },
    footerText: {
      type: String,
      trim: true,
      default: '',
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    analytics: {
      googleAnalyticsId: { type: String, trim: true, default: '' },
      facebookPixelId: { type: String, trim: true, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/**
 * Static method: Returns the single settings document, creating one with defaults if it doesn't exist.
 *
 * @returns {Promise<Document>} The singleton settings document
 */
settingSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;
