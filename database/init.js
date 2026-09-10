const connectDB = require('../src/db');

async function initDB() {
  try {
    const db = await connectDB();

    // Create mandatory indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('events').createIndex({ startDate: 1 });
    await db.collection('events').createIndex({ category: 1 });

    console.log("Indexes created successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error initializing DB:", err);
    process.exit(1);
  }
}

initDB();
