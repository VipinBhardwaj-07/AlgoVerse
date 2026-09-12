const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  line1: { type: String, default: '' },
  line2: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  zip: { type: String, default: '' },
  country: { type: String, default: '' },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String }, // not required for Google-only accounts
  googleId: { type: String, default: null },
  provider: { type: String, enum: ['local', 'google'], default: 'local' },
  address: { type: AddressSchema, default: () => ({}) },
  photoUrl: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);