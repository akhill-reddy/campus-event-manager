const { ObjectId } = require("mongodb");
const connectDB = require("../db");

exports.getAllEvents = async (req, res) => {
  try {
    const db = await connectDB();
    const { category, search, timeFilter, tag } = req.query;

    let query = {};
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (search) query.title = { $regex: search, $options: "i" };

    const now = new Date();
    if (timeFilter === "upcoming") query.startDate = { $gte: now };
    if (timeFilter === "past") query.startDate = { $lt: now };

    const events = await db.collection("events").find(query).sort({ startDate: 1 }).toArray();
    const categories = await db.collection("events").distinct("category");

    res.render("pages/events", { 
      events, 
      categories, 
      selectedCategory: category || "", 
      search: search || "",
      timeFilter: timeFilter || "",
      selectedTag: tag || ""
    });
  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).send("Server Error Loading Events");
  }
};

exports.getEventById = async (req, res) => {
  try {
    const db = await connectDB();
    const event = await db.collection("events").findOne({ _id: new ObjectId(req.params.id) });
    if (!event) return res.status(404).send("Event Not Found");

    const users = await db.collection("users").find().sort({ firstName: 1 }).toArray();
    const confirmedRegs = (event.registrations || []).filter(r => r.status === "confirmed");
    const occupancy = Math.round((confirmedRegs.length / event.capacity) * 100);

    // Populate participant user details
    const regUserIds = (event.registrations || []).map(r => r.userId);
    const participants = await db.collection("users").find({ _id: { $in: regUserIds } }).toArray();

    const participantMap = {};
    participants.forEach(u => { participantMap[u._id.toString()] = u; });

    res.render("pages/eventDetails", { event, users, occupancy, confirmedCount: confirmedRegs.length, participantMap });
  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).send("Server Error");
  }
};

exports.registerUser = async (req, res) => {
  try {
    const db = await connectDB();
    const { userId } = req.body;
    const eventId = req.params.id;

    const event = await db.collection("events").findOne({ _id: new ObjectId(eventId) });
    const confirmedCount = (event.registrations || []).filter(r => r.status === "confirmed").length;

    if (confirmedCount >= event.capacity) {
      return res.status(400).send("Event is full!");
    }

    const userObjId = new ObjectId(userId);
    const exists = (event.registrations || []).some(r => r.userId.toString() === userId && r.status === "confirmed");

    if (exists) {
      return res.status(400).send("User is already registered!");
    }

    await db.collection("events").updateOne(
      { _id: new ObjectId(eventId) },
      { $push: { registrations: { userId: userObjId, registeredAt: new Date(), status: "confirmed" } } }
    );

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error("Error registering user:", err);
    res.status(500).send("Error Registering User");
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const db = await connectDB();
    const { userId } = req.body;
    const eventId = req.params.id;

    await db.collection("events").updateOne(
      { _id: new ObjectId(eventId) },
      { $pull: { registrations: { userId: new ObjectId(userId) } } }
    );

    res.redirect(`/events/${eventId}`);
  } catch (err) {
    console.error("Error cancelling registration:", err);
    res.status(500).send("Error Cancelling Registration");
  }
};

exports.createEvent = async (req, res) => {
  try {
    const db = await connectDB();
    const { title, description, category, tags, startDate, endDate, capacity, building, room, campus } = req.body;

    const newEvent = {
      title,
      description,
      category,
      tags: tags ? tags.split(",").map(t => t.trim()) : [],
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      capacity: parseInt(capacity, 10),
      location: { building, room, campus },
      organizerId: new ObjectId(),
      registrations: [],
      createdAt: new Date()
    };

    await db.collection("events").insertOne(newEvent);
    res.redirect("/events");
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).send("Error Creating Event");
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    const db = await connectDB();
    await db.collection("events").deleteOne({ _id: new ObjectId(req.params.id) });
    res.redirect("/events");
  } catch (err) {
    console.error("Error deleting event:", err);
    res.status(500).send("Error Deleting Event");
  }
};
