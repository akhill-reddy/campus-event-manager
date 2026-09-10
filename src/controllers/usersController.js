const { ObjectId } = require("mongodb");
const connectDB = require("../db");

exports.getAllUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const { search, role, department } = req.query;

    let match = {};
    if (role) match.role = role;
    if (department) match.department = department;
    if (search) {
      match.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const users = await db.collection("users").aggregate([
      { $match: match },
      {
        $lookup: {
          from: "events",
          localField: "_id",
          foreignField: "registrations.userId",
          as: "userEvents"
        }
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          email: 1,
          role: 1,
          department: 1,
          interests: 1,
          regCount: { $size: "$userEvents" }
        }
      },
      { $sort: { firstName: 1 } }
    ]).toArray();

    const roles = await db.collection("users").distinct("role");
    const departments = await db.collection("users").distinct("department");

    res.render("pages/users", { users, roles, departments, search: search || "", selectedRole: role || "", selectedDept: department || "" });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).send("Server Error Loading Users");
  }
};

exports.getUserById = async (req, res) => {
  try {
    const db = await connectDB();
    const userId = new ObjectId(req.params.id);

    const user = await db.collection("users").findOne({ _id: userId });
    if (!user) return res.status(404).send("User Not Found");

    const events = await db.collection("events").find({ "registrations.userId": userId }).toArray();
    
    const now = new Date();
    let upcomingCount = 0;
    let pastCount = 0;

    events.forEach(e => {
      if (new Date(e.startDate) >= now) upcomingCount++;
      else pastCount++;
    });

    res.render("pages/userDetail", { user, events, upcomingCount, pastCount });
  } catch (err) {
    console.error("Error fetching user detail:", err);
    res.status(500).send("Server Error");
  }
};
