import express from 'express';
import Note from '../models/Note.js';
import authMiddleware from '../middleware/auth.js';
import { 
    validateNoteData, 
    validateNoteId, 
    attachNote, 
    verifyNoteOwnership,
    setDefaultQuery,
    processSearchQuery,
    sanitizeNoteData,
    addResponseMetadata
} from '../middleware/notes.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(addResponseMetadata);

// GET /notes - Get all notes for user (with search and pagination)
router.get('/', 
    setDefaultQuery, 
    processSearchQuery, 
    async (req, res) => {
        try {
            const { page, limit } = req.query;
            const skip = (page - 1) * limit;
            
            // Build query filter
            const filter = {
                userId: req.user.id,
                ...req.searchFilter
            };
            
            const notes = await Note.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 });
                
            const total = await Note.countDocuments(filter);
            
            res.json({
                notes,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                timestamp: res.locals.timestamp
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// POST /notes - Create a new note
router.post('/', 
    sanitizeNoteData,
    validateNoteData, 
    async (req, res) => {
        try {
            const { title, body } = req.body;
            const note = await Note.create({ 
                userId: req.user.id, 
                title, 
                body 
            });
            
            res.status(201).json({
                note,
                timestamp: res.locals.timestamp
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// GET /notes/:id - Get a specific note
router.get('/:id', 
    validateNoteId,
    attachNote,
    verifyNoteOwnership,
    (req, res) => {
        res.json({
            note: req.note,
            timestamp: res.locals.timestamp
        });
    }
);

// PUT /notes/:id - Update a note
router.put('/:id', 
    validateNoteId,
    sanitizeNoteData,
    validateNoteData,
    attachNote,
    verifyNoteOwnership,
    async (req, res) => {
        try {
            const { title, body } = req.body;
            
            req.note.title = title;
            req.note.body = body;
            await req.note.save();
            
            res.json({
                note: req.note,
                timestamp: res.locals.timestamp
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

// DELETE /notes/:id - Delete a note
router.delete('/:id', 
    validateNoteId,
    attachNote,
    verifyNoteOwnership,
    async (req, res) => {
        try {
            await req.note.deleteOne();
            res.json({ 
                message: 'Note deleted successfully',
                timestamp: res.locals.timestamp
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
);

export default router;
