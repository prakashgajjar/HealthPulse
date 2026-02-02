import mongoose from 'mongoose';

const medicalReportSchema = new mongoose.Schema(
  {
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
    caseCount: {
      type: Number,
      required: [true, 'Please provide case count'],
      min: 0,
    },
    reportDate: {
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

// Compound index for efficient area + disease queries
medicalReportSchema.index({ area: 1, disease: 1, reportDate: -1 });

export default mongoose.models.MedicalReport || mongoose.model('MedicalReport', medicalReportSchema);
