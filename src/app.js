const express = require('express');
const path = require('path');
require('dotenv').config();

const dashboardController = require('./controllers/dashboardController');
const eventsController = require('./controllers/eventsController');
const usersController = require('./controllers/usersController');
const analyticsController = require('./controllers/analyticsController');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Dashboard
app.get('/', dashboardController.getDashboard);

// Events
app.get('/events', eventsController.getAllEvents);
app.get('/events/:id', eventsController.getEventById);
app.post('/events/create', eventsController.createEvent);
app.post('/events/:id/delete', eventsController.deleteEvent);
app.post('/events/:id/register', eventsController.registerUser);
app.post('/events/:id/cancel', eventsController.cancelRegistration);

// Users
app.get('/users', usersController.getAllUsers);
app.get('/users/:id', usersController.getUserById);

// Analytics
app.get('/analytics', analyticsController.getAnalytics);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
