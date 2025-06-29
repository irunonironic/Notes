import jwt from 'jsonwebtoken';
function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Invalid or missing token' });
        }


        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        req.user = { id: decoded.id };
        return next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
}
export default authMiddleware;