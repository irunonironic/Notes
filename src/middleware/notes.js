import Note from '../models/Note.js';

// Middleware to validate note creation/update data
export function validateNoteData(req, res, next) {
    const { title, body } = req.body;
    
    if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Title is required' });
    }
    
    if (!body || !body.trim()) {
        return res.status(400).json({ error: 'Body is required' });
    }
    
    // Trim whitespace
    req.body.title = title.trim();
    req.body.body = body.trim();
    
    next();
}

// Middleware to validate note ID format
export function validateNoteId(req, res, next) {
    const { id } = req.params;
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ error: 'Invalid note ID format' });
    }
    
    next();
}

// Middleware to check if note exists and attach to request
export async function attachNote(req, res, next) {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ error: 'Note not found' });
        }
        
        req.note = note;
        next();
    } catch (error) {
        res.status(500).json({ error: 'Error fetching note' });
    }
}

// Middleware to verify note ownership
export function verifyNoteOwnership(req, res, next) {
    if (!req.note) {
        return res.status(500).json({ error: 'Note not attached to request' });
    }
    
    if (req.note.userId.toString() !== req.user.id) {
        return res.status(403).json({ error: 'Access denied. Not your note.' });
    }
    
    next();
}

// Middleware to set default query parameters for notes listing
export function setDefaultQuery(req, res, next) {
    // Set default pagination
    req.query.page = parseInt(req.query.page) || 1;
    req.query.limit = parseInt(req.query.limit) || 10;
    
    // Ensure reasonable limits
    if (req.query.limit > 100) req.query.limit = 100;
    if (req.query.page < 1) req.query.page = 1;
    
    next();
}

// Middleware to add search functionality
export function processSearchQuery(req, res, next) {
    const { search } = req.query;
    
    // Build search filter if search term provided
    if (search && search.trim()) {
        req.searchFilter = {
            $or: [
                { title: { $regex: search.trim(), $options: 'i' } },
                { body: { $regex: search.trim(), $options: 'i' } }
            ]
        };
    } else {
        req.searchFilter = {};
    }
    
    next();
}

// Middleware to sanitize note data (prevent XSS)
export function sanitizeNoteData(req, res, next) {
    if (req.body.title) {
        // Basic HTML tag removal (for production, use a proper sanitization library)
        req.body.title = req.body.title.replace(/<[^>]*>/g, '');
    }
    
    if (req.body.body) {
        // Basic HTML tag removal
        req.body.body = req.body.body.replace(/<[^>]*>/g, '');
    }
    
    next();
}

// Middleware to add response metadata
export function addResponseMetadata(req, res, next) {
    // Add timestamp to response
    res.locals.timestamp = new Date().toISOString();
    
    // Add user ID to response context
    res.locals.userId = req.user.id;
    
    next();
}

// Combined middleware for note operations
export const noteMiddleware = {
    validateData: validateNoteData,
    validateId: validateNoteId,
    attachNote: attachNote,
    verifyOwnership: verifyNoteOwnership,
    setDefaults: setDefaultQuery,
    processSearch: processSearchQuery,
    sanitize: sanitizeNoteData,
    addMetadata: addResponseMetadata
};