/**
 * Seed script to populate the database with sample data
 * Run with: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import models
const User = require('./app/models/User').default;
const MedicalReport = require('./app/models/MedicalReport').default;
const Alert = require('./app/models/Alert').default;
const { hashPassword } = require('./lib/password');
const { signToken } = require('./lib/auth');

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearDatabase() {
  console.log('Clearing database...');
  await User.deleteMany({});
  await MedicalReport.deleteMany({});
  await Alert.deleteMany({});
  console.log('✓ Database cleared');
}

async function seedUsers() {
  console.log('Seeding users...');

  const adminPassword = await hashPassword('password123');
  const userPassword = await hashPassword('password123');

  const users = await User.create([
    {
      name: 'Admin User',
      email: 'admin@health.com',
      password: adminPassword,
      role: 'admin',
      area: 'Central',
    },
    {
      name: 'John Doe',
      email: 'user@health.com',
      password: userPassword,
      role: 'user',
      area: 'North Delhi',
    },
    {
      name: 'Jane Smith',
      email: 'jane@health.com',
      password: userPassword,
      role: 'user',
      area: 'South Delhi',
    },
    {
      name: 'Mumbai User',
      email: 'mumbai@health.com',
      password: userPassword,
      role: 'user',
      area: 'Mumbai Central',
    },
  ]);

  console.log(`✓ Created ${users.length} users`);
  return users;
}

async function seedMedicalReports() {
  console.log('Seeding medical reports...');

  const areas = ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi', 'Mumbai Central', 'Bangalore', 'Chennai'];
  const diseases = ['Dengue', 'COVID-19', 'Influenza', 'Malaria', 'Typhoid', 'Chickenpox', 'Common Cold'];

  const reports = [];
  const baseDate = new Date();

  // Generate reports for last 30 days
  for (let day = 30; day >= 0; day--) {
    const reportDate = new Date(baseDate);
    reportDate.setDate(reportDate.getDate() - day);

    for (let i = 0; i < 15; i++) {
      const area = areas[Math.floor(Math.random() * areas.length)];
      const disease = diseases[Math.floor(Math.random() * diseases.length)];
      const caseCount = Math.floor(Math.random() * 50) + 5;

      reports.push({
        disease,
        area,
        caseCount,
        reportDate,
      });
    }
  }

  const createdReports = await MedicalReport.create(reports);
  console.log(`✓ Created ${createdReports.length} medical reports`);
  return createdReports;
}

async function seedAlerts(adminUser) {
  console.log('Seeding alerts...');

  const alerts = await Alert.create([
    {
      title: 'Dengue Alert - North Delhi',
      message: 'High incidence of Dengue cases detected in North Delhi area. Please take precautions and seek medical attention if symptoms appear.',
      disease: 'Dengue',
      area: 'North Delhi',
      riskLevel: 'high',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      title: 'COVID-19 Update - South Delhi',
      message: 'Moderate increase in COVID-19 cases noted. Wear masks in public areas and maintain hygiene.',
      disease: 'COVID-19',
      area: 'South Delhi',
      riskLevel: 'medium',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Influenza - East Delhi',
      message: 'Seasonal influenza activity detected. Get vaccinated if not already done.',
      disease: 'Influenza',
      area: 'East Delhi',
      riskLevel: 'low',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Malaria Alert - Mumbai Central',
      message: 'Cases of Malaria reported in Mumbai Central. Use mosquito nets and repellents.',
      disease: 'Malaria',
      area: 'Mumbai Central',
      riskLevel: 'high',
      isActive: true,
      createdBy: adminUser._id,
    },
    {
      title: 'Typhoid - Bangalore',
      message: 'Typhoid cases identified. Ensure drinking water safety and proper sanitation.',
      disease: 'Typhoid',
      area: 'Bangalore',
      riskLevel: 'medium',
      isActive: true,
      createdBy: adminUser._id,
    },
  ]);

  console.log(`✓ Created ${alerts.length} alerts`);
  return alerts;
}

async function seed() {
  try {
    await connectDB();
    await clearDatabase();

    const users = await seedUsers();
    const adminUser = users.find(u => u.role === 'admin');

    await seedMedicalReports();
    await seedAlerts(adminUser);

    console.log('\n✓ Database seeding completed successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin: admin@health.com / password123');
    console.log('User: user@health.com / password123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seed();
