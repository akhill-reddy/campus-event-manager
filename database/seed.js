const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const dbName = process.env.DB_NAME || 'campus_events';

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);

    await db.collection('users').deleteMany({});
    await db.collection('events').deleteMany({});

    const depts = ['Computer Science', 'Data Engineering', 'Cybersecurity', 'Cloud Computing'];
    const roles = ['Student', 'Professor', 'Researcher'];
    const users = [];

    for (let i = 1; i <= 15; i++) {
      users.push({
        _id: new ObjectId(),
        firstName: `User${i}`,
        lastName: `Student${i}`,
        email: `user${i}@university.edu`,
        department: depts[i % depts.length],
        role: roles[i % roles.length],
        interests: ['AI', 'NoSQL', 'Cloud', 'DevOps'].slice(0, (i % 3) + 1),
        createdAt: new Date()
      });
    }

    const insertedUsers = await db.collection('users').insertMany(users);
    const userIds = Object.values(insertedUsers.insertedIds);

    const categories = ['Workshop', 'Talk', 'Meetup', 'Hackathon', 'Activity'];
    const tagsList = ['Python', 'MongoDB', 'AI', 'Cloud', 'Networking', 'DevOps', 'Java', 'Security'];
    const events = [];

    for (let i = 1; i <= 18; i++) {
      const eventRegistrations = [];
      const regCount = (i % 4) * 3;

      for (let r = 0; r < regCount && r < userIds.length; r++) {
        eventRegistrations.push({
          userId: userIds[r],
          registeredAt: new Date(2026, 8, 3, 10, 0),
          status: 'confirmed'
        });
      }

      const dayOffset = i % 2 === 0 ? i : -i;
      const startDate = new Date(2026, 8, 10 + dayOffset);
      const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);

      events.push({
        title: `Campus Event ${i}`,
        description: `Detailed description for campus event ${i}.`,
        category: categories[i % categories.length],
        tags: [tagsList[i % tagsList.length], tagsList[(i + 1) % tagsList.length]],
        startDate: startDate,
        endDate: endDate,
        capacity: 10 + i * 2,
        location: {
          building: `Building ${String.fromCharCode(65 + (i % 3))}`,
          room: `Room ${100 + i}`,
          campus: 'Paris'
        },
        organizerId: userIds[i % userIds.length],
        registrations: eventRegistrations,
        createdAt: new Date()
      });
    }

    await db.collection('events').insertMany(events);
    console.log('Database seeded successfully.');
  } catch (err) {
    console.error('Seed Error:', err);
  } finally {
    await client.close();
  }
}

seed();