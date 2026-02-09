const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  disease: String,
  area: String,
  caseCount: Number,
  reportDate: Date
});

const MedicalReport = mongoose.model('MedicalReport', ReportSchema);

async function updateReports() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthpulse');
    
    console.log('Updating medical reports to match user areas...\n');
    
    // Get all existing reports
    const allReports = await MedicalReport.find().lean();
    console.log(`Found ${allReports.length} existing reports`);
    
    // Map old areas to new user areas
    const areaMap = {
      'Bangalore': 'patan',
      'Mumbai': '384265',
      'Delhi': 'patan'
    };
    
    // Update each report
    let updateCount = 0;
    for (const report of allReports) {
      if (areaMap[report.area]) {
        await MedicalReport.updateOne(
          { _id: report._id },
          { area: areaMap[report.area] }
        );
        updateCount++;
      }
    }
    
    console.log(`✓ Updated ${updateCount} reports\n`);
    
    // Show new distribution
    console.log('=== NEW REPORT DISTRIBUTION ===');
    const distribution = await MedicalReport.aggregate([
      { $group: { _id: '$area', count: { $sum: 1 }, totalCases: { $sum: '$caseCount' } } }
    ]);
    
    distribution.forEach(item => {
      console.log(`  ${item._id}: ${item.count} reports, ${item.totalCases} cases`);
    });
    
    console.log('\n=== USER AREAS ===');
    console.log('  patan: Suthar Prakash, Admin (admin@gmail.com)');
    console.log('  384265: Xyz (prarthanap40@gmail.com)');
    console.log('\n✓ Now areas match! Trends should work.');
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

updateReports();
