export const dashboardStats = [
  {
    id: "volunteers",
    labelKey: "admin.dashboard.total_volunteers",
    value: "1,248",
    change: "+12% this week",
    isPositive: true,
    colorClass: "bg-orange-50 text-primary border-orange-100 dark:bg-orange-950/20 dark:text-primary-light dark:border-primary-dark/20",
    iconName: "Users"
  },
  {
    id: "missing",
    labelKey: "admin.dashboard.missing_persons",
    value: "142",
    change: "+5 today",
    isPositive: false,
    colorClass: "bg-red-50 text-red-650 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/20",
    iconName: "UserX"
  },
  {
    id: "found",
    labelKey: "admin.dashboard.found_persons",
    value: "118",
    change: "83% resolution",
    isPositive: true,
    colorClass: "bg-emerald-50 text-emerald-650 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20",
    iconName: "UserCheck"
  },
  {
    id: "lost_items",
    labelKey: "admin.dashboard.lost_items",
    value: "385",
    change: "+14 today",
    isPositive: false,
    colorClass: "bg-amber-50 text-amber-650 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20",
    iconName: "Package"
  },
  {
    id: "found_items",
    labelKey: "admin.dashboard.found_items",
    value: "294",
    change: "76% returned",
    isPositive: true,
    colorClass: "bg-sky-50 text-sky-650 border-sky-150 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/20",
    iconName: "Inbox"
  },
  {
    id: "emergencies",
    labelKey: "admin.dashboard.emergency_requests",
    value: "34",
    change: "All resolved",
    isPositive: true,
    colorClass: "bg-rose-50 text-rose-650 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20",
    iconName: "ShieldAlert"
  },
  {
    id: "visitors",
    labelKey: "admin.dashboard.visitors",
    value: "45.2K",
    change: "+28% vs yesterday",
    isPositive: true,
    colorClass: "bg-indigo-50 text-indigo-650 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/20",
    iconName: "Eye"
  },
  {
    id: "announcements",
    labelKey: "admin.dashboard.active_announcements",
    value: "8",
    change: "2 high priority",
    isPositive: false,
    colorClass: "bg-purple-50 text-purple-650 border-purple-150 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/20",
    iconName: "Megaphone"
  },
  {
    id: "reports",
    labelKey: "admin.dashboard.today_reports",
    value: "14",
    change: "Generated at 18:00",
    isPositive: true,
    colorClass: "bg-teal-50 text-teal-650 border-teal-150 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/20",
    iconName: "FileText"
  }
];

export const recentActivities = [
  {
    id: 1,
    type: "volunteer",
    titleKey: "admin.activities.volunteer_registered",
    titleArgs: { name: "Rahul Deshmukh" },
    timestamp: "2026-07-17T18:15:00Z",
    status: "pending",
    details: "NSS Unit Code: ENG-402, College: COEP Pune"
  },
  {
    id: 2,
    type: "missing",
    titleKey: "admin.activities.missing_person_reported",
    titleArgs: { name: "Vitthal Rao" },
    timestamp: "2026-07-17T17:45:00Z",
    status: "active",
    details: "Age 68, Last seen near Wakhari Palkhi Halt"
  },
  {
    id: 3,
    type: "lost_found",
    titleKey: "admin.activities.lost_item_found",
    titleArgs: { item: "Black Leather Wallet" },
    timestamp: "2026-07-17T17:10:00Z",
    status: "claimed",
    details: "Handed over to Camp #4 by Volunteer Amit"
  },
  {
    id: 4,
    type: "emergency",
    titleKey: "admin.activities.emergency_received",
    titleArgs: { type: "Medical Assistance" },
    timestamp: "2026-07-17T16:30:00Z",
    status: "resolved",
    details: "Camp #3 coordinated ambulance dispatch"
  },
  {
    id: 5,
    type: "gallery",
    titleKey: "admin.activities.gallery_updated",
    titleArgs: { count: 4 },
    timestamp: "2026-07-17T15:20:00Z",
    status: "success",
    details: "Swachh Bharat Cleanliness drive albums"
  },
  {
    id: 6,
    type: "announcement",
    titleKey: "admin.activities.announcement_posted",
    titleArgs: { title: "Heavy Rain Alert & Shelters" },
    timestamp: "2026-07-17T14:05:00Z",
    status: "published",
    details: "Category: Safety, Priority: High"
  }
];
