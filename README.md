# Notes2do

A simple, elegant note-taking app with user authentication that automatically extracts and aggregates to-do items from your notes.

## Features

- User authentication (registration and login)
- Create, edit, and delete notes with ease
- Automatic to-do extraction from notes
- Real-time to-do list aggregation
- Mark to-dos as complete directly from the to-do list
- Secure server-side storage with SQLite database
- JWT-based authentication
- Clean, modern UI with responsive design

## Setup and Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - The `.env` file is already created with default values
   - For production, change `JWT_SECRET` to a secure random string

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Access the app:**
   - Open your browser and go to `http://localhost:3000`

### Development Mode

For development with auto-restart on file changes:
```bash
npm run dev
```

## How to Use

1. **Register an account:**
   - Open the app in your browser
   - Click "Register" and create your account

2. **Login:**
   - Enter your username and password
   - You'll be automatically logged in after registration

3. **Create notes:**
   - Use the input fields in the left panel to create notes
   - Watch as to-dos are automatically extracted to the right panel

4. **Manage your notes:**
   - Edit notes inline
   - Delete notes you no longer need
   - Check off to-dos directly from the to-do list

## To-Do Detection

The app automatically detects to-do items using these patterns:

### Markdown Checkboxes
```
- [ ] Incomplete task
- [x] Completed task
```

### TODO Keywords
```
TODO: Buy groceries
TO DO: Call mom
```

### Bullet Points
```
- Pick up dry cleaning
- Schedule dentist appointment
```

## Example Note

```
Project Planning

TODO: Review design mockups
- [ ] Create database schema
- [ ] Set up development environment
- [x] Install dependencies

Meeting Notes:
- Follow up with team lead
- Update project timeline
```

This note will generate 6 to-do items in your aggregated list!

## Technical Details

### Backend
- Node.js with Express.js
- SQLite database for data persistence
- JWT-based authentication
- bcrypt for password hashing
- RESTful API design

### Frontend
- Vanilla JavaScript (ES6+)
- HTML5 and CSS3
- Responsive design
- Fetch API for HTTP requests

### Security
- Passwords hashed with bcrypt
- JWT tokens for session management
- Protected API endpoints
- CORS enabled

### Database Schema
- **Users table**: id, username, email, password, created_at
- **Notes table**: id, user_id, title, content, created_at, updated_at
