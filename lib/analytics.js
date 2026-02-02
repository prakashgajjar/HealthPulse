// Utility functions for health analytics

/**
 * Calculate 7-day average for a given set of cases
 * @param {Array} reports - Array of medical reports
 * @returns {number} - Average cases per day
 */
export function calculate7DayAverage(reports) {
  if (reports.length === 0) return 0;
  const total = reports.reduce((sum, report) => sum + report.caseCount, 0);
  return Math.round(total / 7);
}

/**
 * Get reports for specific time period
 * @param {Array} reports - All reports
 * @param {number} days - Number of days back
 * @returns {Array} - Filtered reports
 */
export function getReportsByDays(reports, days = 7) {
  const now = new Date();
  const pastDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return reports.filter((report) => {
    const reportDate = new Date(report.reportDate);
    return reportDate >= pastDate && reportDate <= now;
  });
}

/**
 * Calculate daily total cases
 * @param {Array} reports - Medical reports for specific date
 * @returns {number} - Total cases
 */
export function calculateDailyTotal(reports) {
  return reports.reduce((sum, report) => sum + report.caseCount, 0);
}

/**
 * Detect high-risk areas based on threshold
 * Logic: If today's cases > (7-day average * 1.5), mark as HIGH RISK
 * @param {Array} todayReports - Today's reports
 * @param {Array} last7DaysReports - Last 7 days reports
 * @param {number} threshold - Risk threshold multiplier
 * @returns {Array} - High risk area alerts
 */
export function detectHighRiskAreas(todayReports, last7DaysReports, threshold = 1.5) {
  const areaMap = new Map();

  // Group today's reports by area
  todayReports.forEach((report) => {
    if (!areaMap.has(report.area)) {
      areaMap.set(report.area, { today: 0, last7Days: [] });
    }
    areaMap.get(report.area).today += report.caseCount;
  });

  // Group last 7 days reports by area
  last7DaysReports.forEach((report) => {
    if (!areaMap.has(report.area)) {
      areaMap.set(report.area, { today: 0, last7Days: [] });
    }
    areaMap.get(report.area).last7Days.push(report.caseCount);
  });

  const highRiskAreas = [];

  // Analyze each area
  areaMap.forEach((data, area) => {
    const average7Day = data.last7Days.length > 0 
      ? Math.round(data.last7Days.reduce((a, b) => a + b, 0) / 7)
      : 0;

    const riskThreshold = average7Day * threshold;

    // Determine risk level
    let riskLevel = 'low';
    if (data.today > riskThreshold) {
      if (data.today > average7Day * 2) {
        riskLevel = 'high';
      } else {
        riskLevel = 'medium';
      }
    }

    highRiskAreas.push({
      area,
      todayCases: data.today,
      sevenDayAverage: average7Day,
      riskLevel,
      percentageChange: average7Day > 0 
        ? Math.round(((data.today - average7Day) / average7Day) * 100)
        : 0,
    });
  });

  return highRiskAreas;
}

/**
 * Get area-wise disease distribution
 * @param {Array} reports - Medical reports
 * @returns {Object} - Structured disease by area data
 */
export function getAreaWiseDiseaseDistribution(reports) {
  const distribution = {};

  reports.forEach((report) => {
    if (!distribution[report.area]) {
      distribution[report.area] = {};
    }

    if (!distribution[report.area][report.disease]) {
      distribution[report.area][report.disease] = 0;
    }

    distribution[report.area][report.disease] += report.caseCount;
  });

  return distribution;
}

/**
 * Get trending diseases
 * @param {Array} reports - Medical reports
 * @returns {Array} - Top diseases by case count
 */
export function getTrendingDiseases(reports) {
  const diseaseMap = {};

  reports.forEach((report) => {
    if (!diseaseMap[report.disease]) {
      diseaseMap[report.disease] = 0;
    }
    diseaseMap[report.disease] += report.caseCount;
  });

  return Object.entries(diseaseMap)
    .map(([disease, count]) => ({ disease, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Determine risk level color for UI
 * @param {string} riskLevel - Risk level (low, medium, high)
 * @returns {string} - Color class
 */
export function getRiskLevelColor(riskLevel) {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-red-100 text-red-800 border-red-300',
  };
  return colors[riskLevel] || colors.low;
}

/**
 * Format date to readable string
 * @param {Date} date - Date to format
 * @returns {string} - Formatted date
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Get date range label (today, this week, this month)
 * @param {string} range - Range type
 * @returns {Object} - Start and end dates
 */
export function getDateRange(range = 'today') {
  const now = new Date();
  const start = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      break;
    case 'week':
      const dayOfWeek = now.getDay();
      start.setDate(now.getDate() - dayOfWeek);
      start.setHours(0, 0, 0, 0);
      break;
    case 'month':
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      break;
    default:
      break;
  }

  return { start, end: now };
}
