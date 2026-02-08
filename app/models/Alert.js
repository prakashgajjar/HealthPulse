import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide alert title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide alert message'],
    },
    disease: {
      type: String,
      required: [true, 'Please provide disease name'],
      trim: true,
    },
    area: {
      type: String,
      required: [true, 'Please provide area'],
      trim: true,
      index: true,
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // AI-related fields for anomaly detection
    source: {
      type: String,
      enum: ['manual', 'AI'],
      default: 'manual',
    },
    type: {
      type: String,
      enum: ['general', 'anomaly', 'trend'],
      default: 'general',
    },
    spikePercentage: {
      type: Number,
      description: 'For anomaly alerts - percentage increase in cases',
    },
    // Explainability data
    explanations: [
      {
        type: String,
        description: 'Reasons why this alert was generated',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

alertSchema.index({ area: 1, createdAt: -1 });

export default mongoose.models.Alert || mongoose.model('Alert', alertSchema);
