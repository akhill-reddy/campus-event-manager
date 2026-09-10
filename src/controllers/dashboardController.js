const connectDB = require("../db");

exports.getDashboard = async (req, res) => {
  try {
    const db = await connectDB();
    const now = new Date();

    const totalUsers = await db.collection("users").countDocuments();
    const totalEvents = await db.collection("events").countDocuments();
    const upcomingEventsCount = await db.collection("events").countDocuments({ startDate: { $gte: now } });

    const regAggregation = await db.collection("events").aggregate([
      { $project: { regCount: { $size: "$registrations" } } },
      { $group: { _id: null, total: { $sum: "$regCount" } } }
    ]).toArray();
    const totalRegistrations = regAggregation[0] ? regAggregation[0].total : 0;

    const nextEvents = await db.collection("events")
      .find({ startDate: { $gte: now } })
      .sort({ startDate: 1 })
      .limit(5)
      .toArray();

    const popularAggregation = await db.collection("events").aggregate([
      {
        $project: {
          title: 1, category: 1, capacity: 1,
          confirmedCount: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $eq: ["$$reg.status", "confirmed"] }
              }
            }
          }
        }
      },
      { $sort: { confirmedCount: -1 } },
      { $limit: 1 }
    ]).toArray();
    const popularEvent = popularAggregation[0] || null;

    res.render("pages/dashboard", {
      stats: { totalUsers, totalEvents, upcomingEventsCount, totalRegistrations },
      nextEvents,
      popularEvent
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.status(500).send("Server Error Loading Dashboard");
  }
};
