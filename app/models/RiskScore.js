import mongoose from 'mongoose';

const riskScoreSchema = new mongoose.Schema(
  {
    area: {
      type: String,
      required: [true, 'Please provide area/pincode'],
      trim: true,
      index: true,
    },
    disease: {
      type: String,
      required: [true, 'Please provide disease name'],
      trim: true,
    },
    // Risk score (0-100)
    riskScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    // Risk level classification
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: true,
    },
    // Factor breakdown for explainability
    growthRate: {
      type: Number,
      description: '% increase in cases from previous period',
    },
    caseDensity: {
      type: Number,
      description: 'Case count normalized (0-100)',
    },
    diseaseSeverity: {
      type: Number,
      description: 'Disease severity weight (0-100)',
    },
    historicalOutbreak: {
      type: Number,
      description: 'Historical outbreak presence (0-100)',
    },
    // Contributing factors for explainability panel
    contributingFactors: [
      {
        type: String,
        description: 'Key reasons for the risk score',
      },
    ],
    // Data used for calculation
    totalCases: {
      type: Number,
      description: 'Total cases in last 7 days',
    },
    previousPeriodCases: {
      type: Number,
      description: 'Cases in the 7 days before the last 7 days',
    },
    calculationDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
riskScoreSchema.index({ area: 1, disease: 1, calculationDate: -1 });
riskScoreSchema.index({ area: 1, calculationDate: -1 });

export default mongoose.models.RiskScore || mongoose.model('RiskScore', riskScoreSchema);
