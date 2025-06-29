import Note from '../models/Note.js';

export default async function noteOwner(req, res, next) {
  try {
    //  Look up the note by the ID in the URL
    const note = await Note.findById(req.params.id);

    // If the note doesn’t exist, return 404
    if (!note) return res.status(404).json({ error: 'Note not found' });

    //  Check ownership
    if (note.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not your note' });
    }

    // Attach the note to req for downstream handlers
    req.note = note;
    next();
  } catch (err) {
    next(err); // Let your global error handler deal with it
  }
}
