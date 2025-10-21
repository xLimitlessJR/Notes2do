require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const db = require('./database');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

// Helper function to promisify database queries
const dbRun = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
};

const dbGet = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const dbAll = (query, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

// ==================== AUTH ROUTES ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // Check if user already exists
        const existingUser = await dbGet(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const result = await dbRun(
            'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
            [username, email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { id: result.lastID, username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: result.lastID, username, email }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = await dbGet('SELECT * FROM users WHERE username = ?', [username]);

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Verify token (check if user is logged in)
app.get('/api/auth/verify', authenticateToken, async (req, res) => {
    try {
        const user = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [req.user.id]);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== NOTES ROUTES ====================

// Get all notes for authenticated user
app.get('/api/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await dbAll(
            'SELECT * FROM notes WHERE user_id = ? ORDER BY created_at DESC',
            [req.user.id]
        );
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// Create new note
app.post('/api/notes', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title && !content) {
            return res.status(400).json({ error: 'Title or content is required' });
        }

        const result = await dbRun(
            'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
            [req.user.id, title || 'Untitled Note', content || '']
        );

        const note = await dbGet('SELECT * FROM notes WHERE id = ?', [result.lastID]);
        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// Update note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content } = req.body;
        const noteId = req.params.id;

        // Verify note belongs to user
        const note = await dbGet(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [noteId, req.user.id]
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await dbRun(
            'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [title || note.title, content !== undefined ? content : note.content, noteId]
        );

        const updatedNote = await dbGet('SELECT * FROM notes WHERE id = ?', [noteId]);
        res.json(updatedNote);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// Delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    try {
        const noteId = req.params.id;

        // Verify note belongs to user
        const note = await dbGet(
            'SELECT * FROM notes WHERE id = ? AND user_id = ?',
            [noteId, req.user.id]
        );

        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }

        await dbRun('DELETE FROM notes WHERE id = ?', [noteId]);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
