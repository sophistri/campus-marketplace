import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: {
    type: String,
    enum: ['textbooks', 'electronics', 'furniture', 'clothing', 'other'],
    required: true,
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'worn'],
    required: true,
  },
  photos: [String],
  status: {
    type: String,
    enum: ['active', 'pending', 'sold', 'removed'],
    default: 'active',
  },
  location: String,
}, { timestamps: true });

listingSchema.index({ title: 'text', description: 'text' }); // enables text search

export default mongoose.model('Listing', listingSchema);
