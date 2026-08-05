import mongoose from 'mongoose';
import { ROLE_LIST } from '../constants/index.js';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      enum: {
        values: ROLE_LIST,
        message: 'Role must be one of: {VALUE}',
      },
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────────────────────
// name index is auto-created by `unique: true` in the schema definition

const Role = mongoose.model('Role', roleSchema);

export default Role;
