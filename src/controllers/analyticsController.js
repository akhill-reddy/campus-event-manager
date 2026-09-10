const connectDB = require("../db");

exports.getAnalytics = async (req, res) => {
  try {
    const db = await connectDB();

    // Analysis A: Registrations by Category
    const categoryStats = await db.collection("events").aggregate([
      {
        $project: {
          category: 1,
          confirmedRegs: {
            $filter: {
              input: "$registrations",
              as: "reg",
              cond: { $eq: ["$$reg.status", "confirmed"] }
            }
          }
        }
      },
      {
        $group: {
          _id: "$category",
          eventCount: { $sum: 1 },
          totalRegs: { $sum: { $size: "$confirmedRegs" } }
        }
      },
      { $sort: { totalRegs: -1 } }
    ]).toArray();

    // Analysis B: Top 5 Most Popular Events
    const topEvents = await db.collection("events").aggregate([
      {
        $project: {
          title: 1,
          category: 1,
          capacity: 1,
          regCount: { $size: "$registrations" },
          occupancy: {
            $multiply: [
              { $divide: [{ $size: "$registrations" }, "$capacity"] },
              100
            ]
          }
        }
      },
      { $sort: { regCount: -1 } },
      { $limit: 5 }
    ]).toArray();

    // Analysis C: Users with No Registration
    const unregisteredUsers = await db.collection("users").aggregate([
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "registrations.userId",
          as: "events"
        }
      },
      { $match: { events: { $size: 0 } } },
      { $project: { firstName: 1, lastName: 1, email: 1, role: 1 } }
    ]).toArray();

    // Analysis D: Events Above Average Occupancy
    const eventsAboveAvg = await db.collection("events").aggregate([
      {
        $project: {
          title: 1,
          occupancy: {
            $multiply: [
              { $divide: [{ $size: "$registrations" }, "$capacity"] },
              100
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgOccupancy: { $avg: "$occupancy" },
          events: { $push: "$$ROOT" }
        }
      },
      { $unwind: "$events" },
      {
        $project: {
          title: "$events.title",
          occupancy: "$events.occupancy",
          avgOccupancy: 1,
          isAbove: { $gt: ["$events.occupancy", "$avgOccupancy"] }
        }
      },
      { $match: { isAbove: true } }
    ]).toArray();

    // Analysis E: Most Used Tags
    const tagStats = await db.collection("events").aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    // Analysis F: Events by Month
    const monthlyStats = await db.collection("events").aggregate([
      {
        $group: {
          _id: { $month: "$startDate" },
          totalEvents: { $sum: 1 },
          totalRegs: { $sum: { $size: "$registrations" } }
        }
      },
      { $sort: { "_id": 1 } }
    ]).toArray();

    res.render("pages/analytics", { categoryStats, topEvents, unregisteredUsers, eventsAboveAvg, tagStats, monthlyStats });
  } catch (err) {
    console.error("Error loading analytics:", err);
    res.status(500).send("Server Error Loading Analytics");
  }
};
