export const volunteerRegistrationsData = {
  labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  values: [45, 68, 120, 185, 230, 310, 290],
  total: 1248,
  change: "+24% vs last week"
};

export const missingPersonReportsData = {
  labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
  reported: [12, 18, 25, 34, 28, 15, 10],
  resolved: [8, 14, 20, 29, 26, 14, 9]
};

export const lostItemReportsData = {
  labels: ["Mobiles", "Wallets", "Bags", "Documents", "Clothing", "Others"],
  values: [124, 98, 76, 45, 24, 18],
  colors: ["#FF7A00", "#1E3A8A", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"]
};

export const dailyActivityTrends = {
  labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
  visits: [120, 340, 1200, 2400, 3100, 1800],
  reports: [2, 5, 12, 28, 35, 18]
};

export const campOperationsStatus = [
  { nameKey: "admin.analytics.camps.medical", current: 85, target: 100, status: "optimal" },
  { nameKey: "admin.analytics.camps.volunteers", current: 94, target: 100, status: "critical" },
  { nameKey: "admin.analytics.camps.food", current: 78, target: 100, status: "optimal" },
  { nameKey: "admin.analytics.camps.sanitation", current: 62, target: 100, status: "warning" }
];
