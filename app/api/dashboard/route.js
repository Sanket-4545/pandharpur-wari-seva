export const dynamic = "force-dynamic";

import { getDb } from "@/lib/db";
import { requireRole, handleAuthError, successResponse } from "@/lib/api-helpers";

const STAT_CONFIGS = [
  { id: "volunteers", labelKey: "admin.dashboard.total_volunteers", iconName: "Users", colorClass: "bg-orange-50 text-primary border-orange-100 dark:bg-orange-950/20 dark:text-primary-light dark:border-primary-dark/20", positiveIsUp: true },
  { id: "missing", labelKey: "admin.dashboard.missing_persons", iconName: "UserX", colorClass: "bg-red-50 text-red-650 border-red-150 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/20", positiveIsUp: false },
  { id: "found", labelKey: "admin.dashboard.found_persons", iconName: "UserCheck", colorClass: "bg-emerald-50 text-emerald-650 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/20", positiveIsUp: true },
  { id: "lost_items", labelKey: "admin.dashboard.lost_items", iconName: "Package", colorClass: "bg-amber-50 text-amber-650 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/20", positiveIsUp: false },
  { id: "found_items", labelKey: "admin.dashboard.found_items", iconName: "Inbox", colorClass: "bg-sky-50 text-sky-650 border-sky-150 dark:bg-sky-950/20 dark:text-sky-400 dark:border-sky-900/20", positiveIsUp: true },
  { id: "contact_messages", labelKey: "admin.dashboard.contact_messages", iconName: "ShieldAlert", colorClass: "bg-rose-50 text-rose-650 border-rose-150 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/20", positiveIsUp: false },
  { id: "engagement", labelKey: "admin.dashboard.engagement", iconName: "Eye", colorClass: "bg-indigo-50 text-indigo-650 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/20", positiveIsUp: true },
  { id: "announcements", labelKey: "admin.dashboard.active_announcements", iconName: "Megaphone", colorClass: "bg-purple-50 text-purple-650 border-purple-150 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/20", positiveIsUp: true },
  { id: "reports", labelKey: "admin.dashboard.today_reports", iconName: "FileText", colorClass: "bg-teal-50 text-teal-650 border-teal-150 dark:bg-teal-950/20 dark:text-teal-400 dark:border-teal-900/20", positiveIsUp: true },
];

const LOST_ITEM_COLORS = ["#FF7A00", "#1E3A8A", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#06B6D4"];

function formatNumber(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toLocaleString();
}

function getDateRange(range) {
  const now = new Date();
  let start, previousStart;
  if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    previousStart = new Date(start.getTime() - 86400000);
  } else if (range === "week") {
    start = new Date(now.getTime() - 7 * 86400000);
    previousStart = new Date(start.getTime() - 7 * 86400000);
  } else if (range === "month") {
    start = new Date(now.getTime() - 30 * 86400000);
    previousStart = new Date(start.getTime() - 30 * 86400000);
  } else {
    start = new Date(now.getTime() - 365 * 86400000);
    previousStart = new Date(start.getTime() - 365 * 86400000);
  }
  return { start, previousStart };
}

async function getCounts(db, collection, filter = {}) {
  return db.collection(collection).countDocuments(filter);
}

function getFilterRecent(start) {
  return { createdAt: { $gte: start } };
}

function getFilterPrevious(previousStart, start) {
  return { createdAt: { $gte: previousStart, $lt: start } };
}

async function queryCounts(db, collection, start, previousStart) {
  const [total, recent, previous] = await Promise.all([
    getCounts(db, collection),
    getCounts(db, collection, getFilterRecent(start)),
    getCounts(db, collection, getFilterPrevious(previousStart, start)),
  ]);
  return { total, recent, previous };
}

async function getRecentItems(db, collectionName, projection, limit = 3) {
  const coll = db.collection(collectionName);
  return coll.find({}, { projection }).sort({ createdAt: -1 }).limit(limit).toArray();
}

async function getVolunteerAnalytics(db, start, range) {
  const coll = db.collection("volunteers");
  let groupId;
  if (range === "today") {
    groupId = { $dateToString: { format: "%H:00", date: "$createdAt" } };
  } else {
    groupId = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
  }
  const pipeline = [
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: groupId, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const results = await coll.aggregate(pipeline).toArray();
  const labels = results.map((r) => r._id);
  const values = results.map((r) => r.count);
  const total = values.reduce((s, v) => s + v, 0);

  const coll2 = db.collection("volunteers");
  const [{ count: prevCount } = { count: 0 }] = await coll2.aggregate([
    { $match: { createdAt: { $lt: start } } },
    { $count: "count" },
  ]).toArray();
  const change = prevCount > 0 ? `+${((total / prevCount) * 100).toFixed(0)}% vs prior` : "New";

  return { labels, values, total, change };
}

async function getLostItemCategories(db, start) {
  const coll = db.collection("lost_items");
  const pipeline = [
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ];
  const results = await coll.aggregate(pipeline).toArray();
  const labels = results.map((r) => r._id || "Other");
  const values = results.map((r) => r.count);
  const colors = labels.map((_, i) => LOST_ITEM_COLORS[i % LOST_ITEM_COLORS.length]);
  return { labels, values, colors };
}

async function getDailyActivityTrends(db, start) {
  const coll = db.collection("contact_messages");
  const pipeline = [
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: "%H:00", date: "$createdAt" } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const results = await coll.aggregate(pipeline).toArray();
  const hourMap = {};
  for (let i = 0; i < 24; i++) {
    const key = `${String(i).padStart(2, "0")}:00`;
    hourMap[key] = 0;
  }
  for (const r of results) {
    hourMap[r._id] = r.count;
  }
  return {
    labels: Object.keys(hourMap).filter((_, i) => i % 4 === 0),
    values: Object.keys(hourMap).filter((_, i) => i % 4 === 0).map((h) => hourMap[h]),
  };
}

async function getMissingPersonReports(db, start) {
  const coll = db.collection("missing_persons");
  const pipeline = [
    { $match: { createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, reported: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const reported = await coll.aggregate(pipeline).toArray();
  const foundPipeline = [
    { $match: { status: "Found", createdAt: { $gte: start } } },
    { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, resolved: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ];
  const found = await coll.aggregate(foundPipeline).toArray();
  const allDates = [...new Set([...reported.map((r) => r._id), ...found.map((r) => r._id)])].sort();
  return {
    labels: allDates.slice(0, 10),
    reported: allDates.slice(0, 10).map((d) => {
      const foundR = reported.find((r) => r._id === d);
      return foundR ? foundR.reported : 0;
    }),
    resolved: allDates.slice(0, 10).map((d) => {
      const foundF = found.find((r) => r._id === d);
      return foundF ? foundF.resolved : 0;
    }),
  };
}

async function getCampOperations(db) {
  const [totalVolunteers, approvedVolunteers, totalMissing, foundMissing, totalMessages, readMessages, totalItems, claimedItems] = await Promise.all([
    getCounts(db, "volunteers"),
    getCounts(db, "volunteers", { status: "approved" }),
    getCounts(db, "missing_persons"),
    getCounts(db, "missing_persons", { status: "Found" }),
    getCounts(db, "contact_messages"),
    getCounts(db, "contact_messages", { isRead: true }),
    getCounts(db, "lost_items"),
    getCounts(db, "lost_items", { status: { $in: ["Found", "Claimed"] } }),
  ]);

  const medicalPct = totalMissing > 0 ? Math.round((foundMissing / totalMissing) * 100) : 100;
  const volunteerPct = totalVolunteers > 0 ? Math.round((approvedVolunteers / totalVolunteers) * 100) : 100;
  const foodPct = totalMessages > 0 ? Math.round((readMessages / totalMessages) * 100) : 100;
  const sanitationPct = totalItems > 0 ? Math.round((claimedItems / totalItems) * 100) : 100;

  const getStatus = (pct) => {
    if (pct >= 80) return "optimal";
    if (pct >= 50) return "warning";
    return "critical";
  };

  return [
    { nameKey: "admin.analytics.camps.medical", current: Math.min(medicalPct, 100), target: 100, status: getStatus(medicalPct) },
    { nameKey: "admin.analytics.camps.volunteers", current: Math.min(volunteerPct, 100), target: 100, status: getStatus(volunteerPct) },
    { nameKey: "admin.analytics.camps.food", current: Math.min(foodPct, 100), target: 100, status: getStatus(foodPct) },
    { nameKey: "admin.analytics.camps.sanitation", current: Math.min(sanitationPct, 100), target: 100, status: getStatus(sanitationPct) },
  ];
}

export async function GET(request) {
  try {
    await requireRole(request, ["super_admin", "admin", "coordinator"]);
    const { searchParams } = new URL(request.url);
    const range = searchParams.get("range") || "week";
    const db = await getDb();
    const { start, previousStart } = getDateRange(range);

    const countPromises = STAT_CONFIGS.map((cfg) => {
      if (cfg.id === "volunteers") return queryCounts(db, "volunteers", start, previousStart);
      if (cfg.id === "missing") return queryCounts(db, "missing_persons", start, previousStart);
      if (cfg.id === "found") {
        return (async () => {
          const coll = db.collection("missing_persons");
          const [total, recent, previous] = await Promise.all([
            coll.countDocuments({ status: "Found" }),
            coll.countDocuments({ status: "Found", createdAt: { $gte: start } }),
            coll.countDocuments({ status: "Found", createdAt: { $gte: previousStart, $lt: start } }),
          ]);
          return { total, recent, previous };
        })();
      }
      if (cfg.id === "lost_items") {
        return (async () => {
          const coll = db.collection("lost_items");
          const [total, recent, previous] = await Promise.all([
            coll.countDocuments({ status: "Lost" }),
            coll.countDocuments({ status: "Lost", createdAt: { $gte: start } }),
            coll.countDocuments({ status: "Lost", createdAt: { $gte: previousStart, $lt: start } }),
          ]);
          return { total, recent, previous };
        })();
      }
      if (cfg.id === "found_items") {
        return (async () => {
          const coll = db.collection("lost_items");
          const [total, recent, previous] = await Promise.all([
            coll.countDocuments({ status: { $in: ["Found", "Claimed"] } }),
            coll.countDocuments({ status: { $in: ["Found", "Claimed"] }, createdAt: { $gte: start } }),
            coll.countDocuments({ status: { $in: ["Found", "Claimed"] }, createdAt: { $gte: previousStart, $lt: start } }),
          ]);
          return { total, recent, previous };
        })();
      }
      if (cfg.id === "contact_messages") return queryCounts(db, "contact_messages", start, previousStart);
      if (cfg.id === "engagement") {
        return (async () => {
          const [v, m, l, c, a] = await Promise.all([
            getCounts(db, "volunteers"),
            getCounts(db, "missing_persons"),
            getCounts(db, "lost_items"),
            getCounts(db, "contact_messages"),
            getCounts(db, "announcements"),
          ]);
          const total = v + m + l + c + a;
          const [vR, mR, lR, cR, aR] = await Promise.all([
            getCounts(db, "volunteers", getFilterRecent(start)),
            getCounts(db, "missing_persons", getFilterRecent(start)),
            getCounts(db, "lost_items", getFilterRecent(start)),
            getCounts(db, "contact_messages", getFilterRecent(start)),
            getCounts(db, "announcements", getFilterRecent(start)),
          ]);
          const recent = vR + mR + lR + cR + aR;
          const [vP, mP, lP, cP, aP] = await Promise.all([
            getCounts(db, "volunteers", getFilterPrevious(previousStart, start)),
            getCounts(db, "missing_persons", getFilterPrevious(previousStart, start)),
            getCounts(db, "lost_items", getFilterPrevious(previousStart, start)),
            getCounts(db, "contact_messages", getFilterPrevious(previousStart, start)),
            getCounts(db, "announcements", getFilterPrevious(previousStart, start)),
          ]);
          const previous = vP + mP + lP + cP + aP;
          return { total, recent, previous };
        })();
      }
      if (cfg.id === "announcements") {
        return (async () => {
          const coll = db.collection("announcements");
          const [total, recent, previous] = await Promise.all([
            coll.countDocuments({ status: "published" }),
            coll.countDocuments({ status: "published", createdAt: { $gte: start } }),
            coll.countDocuments({ status: "published", createdAt: { $gte: previousStart, $lt: start } }),
          ]);
          return { total, recent, previous };
        })();
      }
      if (cfg.id === "reports") return queryCounts(db, "reports", start, previousStart);
      return { total: 0, recent: 0, previous: 0 };
    });

    const countResults = await Promise.all(countPromises);

    const stats = STAT_CONFIGS.map((cfg, i) => {
      const { total, recent, previous } = countResults[i];
      const diff = recent - previous;
      const changeText = diff >= 0 ? `+${diff} this period` : `${diff} this period`;
      return {
        id: cfg.id,
        labelKey: cfg.labelKey,
        value: formatNumber(total),
        change: changeText,
        isPositive: cfg.positiveIsUp ? diff >= 0 : diff <= 0,
        colorClass: cfg.colorClass,
        iconName: cfg.iconName,
      };
    });

    const [recentVolunteers, recentMissing, recentLost, recentMessages, recentAnnouncements] = await Promise.all([
      getRecentItems(db, "volunteers", { name: 1, volunteerId: 1, nssUnit: 1, college: 1, createdAt: 1 }),
      getRecentItems(db, "missing_persons", { name: 1, caseId: 1, age: 1, lastSeenLocation: 1, status: 1, createdAt: 1 }),
      getRecentItems(db, "lost_items", { name: 1, itemId: 1, category: 1, locationFound: 1, status: 1, createdAt: 1 }),
      getRecentItems(db, "contact_messages", { name: 1, email: 1, message: 1, createdAt: 1 }),
      getRecentItems(db, "announcements", { title: 1, announcementId: 1, category: 1, priority: 1, createdAt: 1 }),
    ]);

    const rawActivities = [
      ...recentVolunteers.map((v) => ({
        id: v._id.toString(),
        type: "volunteer",
        titleKey: "admin.activities.volunteer_registered",
        titleArgs: { name: v.name || "Unknown" },
        timestamp: v.createdAt || new Date(),
        details: v.nssUnit ? `NSS Unit: ${v.nssUnit}, ${v.college || ""}` : "New volunteer registration",
      })),
      ...recentMissing.map((m) => ({
        id: m._id.toString(),
        type: "missing",
        titleKey: "admin.activities.missing_person_reported",
        titleArgs: { name: m.name || "Unknown" },
        timestamp: m.createdAt || new Date(),
        details: `Age ${m.age || "?"}, Status: ${m.status || "Missing"}`,
      })),
      ...recentLost.map((l) => ({
        id: l._id.toString(),
        type: "lost_found",
        titleKey: "admin.activities.lost_item_found",
        titleArgs: { item: l.name || "Unknown" },
        timestamp: l.createdAt || new Date(),
        details: `Category: ${l.category || "N/A"}, Location: ${l.locationFound || "N/A"}`,
      })),
      ...recentMessages.map((c) => ({
        id: c._id.toString(),
        type: "emergency",
        titleKey: "admin.activities.emergency_received",
        titleArgs: { type: "Contact Form" },
        timestamp: c.createdAt || new Date(),
        details: `From: ${c.name || "Unknown"} <${c.email || "N/A"}>`,
      })),
      ...recentAnnouncements.map((a) => ({
        id: a._id.toString(),
        type: "announcement",
        titleKey: "admin.activities.announcements_posted",
        titleArgs: { title: a.title || "Untitled" },
        timestamp: a.createdAt || new Date(),
        details: `Category: ${a.category || "N/A"}, Priority: ${a.priority || "N/A"}`,
      })),
    ];

    rawActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const recentActivities = rawActivities.slice(0, 6);

    const alertsColl = db.collection("announcements");
    const alerts = await alertsColl
      .find({ status: "published" })
      .sort({ priority: -1, createdAt: -1 })
      .limit(5)
      .project({ title: 1, description: 1, priority: 1, createdAt: 1, category: 1 })
      .toArray();

    const formattedAlerts = alerts.map((a) => ({
      id: a._id.toString(),
      title: a.title || "",
      description: a.description || "",
      priority: a.priority || "low",
      category: a.category || "general",
      timestamp: a.createdAt || new Date(),
    }));

    const [volunteerRegistrations, lostItemCategories, dailyActivityTrendsData, missingPersonReportsData, campOperationsStatus] = await Promise.all([
      getVolunteerAnalytics(db, start, range),
      getLostItemCategories(db, start),
      getDailyActivityTrends(db, start),
      getMissingPersonReports(db, start),
      getCampOperations(db),
    ]);

    return successResponse({
      stats,
      recentActivities,
      alerts: formattedAlerts,
      analytics: {
        volunteerRegistrations,
        lostItemCategories,
        dailyActivityTrends: dailyActivityTrendsData,
        missingPersonReports: missingPersonReportsData,
        campOperationsStatus,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
