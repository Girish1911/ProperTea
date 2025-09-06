import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  // 1. Get the token from the request header
  const authHeader = req.header('Authorization');

  // 2. Check if the token exists
  if (!authHeader) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // 3. Check if the token is in the correct 'Bearer <token>' format
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Token is not in the correct format' });
    }
    
    const token = authHeader.split(' ')[1];

    // 4. Verify the token using your JWT_SECRET
    // This will work correctly now that your server.js loads the .env file first.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5. If the token is valid, attach the user's info to the request object
    req.user = decoded.user;
    
    // 6. Proceed to the next step (e.g., creating the property)
    next();

  } catch (err) {
    // This block runs if jwt.verify fails (e.g., invalid signature, expired token)
    res.status(401).json({ message: 'Token is not valid' });
  }
};

export default authMiddleware;

