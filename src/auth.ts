import { Request as ExpressRequest, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
// import 'dotenv/config';
interface RequestWithUser extends ExpressRequest {
  user?: JwtPayload;
}

const authMiddleware = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Response | void => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Authentication token missing or invalid' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: 'Authentication token missing or invalid' });
  }
};

export default authMiddleware;
