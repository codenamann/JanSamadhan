// Rate limiting middleware for API protection

const requestCounts = new Map();
const REQUEST_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100; // Max requests per window

/**
 * Simple rate limiter middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const rateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  
  // Clean up old entries
  for (const [ip, data] of requestCounts.entries()) {
    if (currentTime - data.windowStart > REQUEST_WINDOW) {
      requestCounts.delete(ip);
    }
  }
  
  // Get or create client data
  let clientData = requestCounts.get(clientIP);
  
  if (!clientData) {
    // First request from this IP
    clientData = {
      count: 1,
      windowStart: currentTime
    };
    requestCounts.set(clientIP, clientData);
    return next();
  }
  
  // Check if we're still in the same window
  if (currentTime - clientData.windowStart > REQUEST_WINDOW) {
    // New window, reset count
    clientData.count = 1;
    clientData.windowStart = currentTime;
    return next();
  }
  
  // Increment request count
  clientData.count++;
  
  // Check if limit exceeded
  if (clientData.count > MAX_REQUESTS) {
    const timeUntilReset = REQUEST_WINDOW - (currentTime - clientData.windowStart);
    const retryAfter = Math.ceil(timeUntilReset / 1000);
    
    return res.status(429).json({
      success: false,
      error: 'Too many requests from this IP address',
      message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter: retryAfter
    });
  }
  
  // Add rate limit headers
  res.set({
    'X-RateLimit-Limit': MAX_REQUESTS,
    'X-RateLimit-Remaining': Math.max(0, MAX_REQUESTS - clientData.count),
    'X-RateLimit-Reset': Math.ceil((clientData.windowStart + REQUEST_WINDOW) / 1000)
  });
  
  next();
};

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimiter = (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  const currentTime = Date.now();
  const STRICT_WINDOW = 60 * 1000; // 1 minute
  const STRICT_MAX_REQUESTS = 5; // Max 5 requests per minute
  
  const key = `strict_${clientIP}`;
  let clientData = requestCounts.get(key);
  
  if (!clientData) {
    clientData = {
      count: 1,
      windowStart: currentTime
    };
    requestCounts.set(key, clientData);
    return next();
  }
  
  if (currentTime - clientData.windowStart > STRICT_WINDOW) {
    clientData.count = 1;
    clientData.windowStart = currentTime;
    return next();
  }
  
  clientData.count++;
  
  if (clientData.count > STRICT_MAX_REQUESTS) {
    const timeUntilReset = STRICT_WINDOW - (currentTime - clientData.windowStart);
    const retryAfter = Math.ceil(timeUntilReset / 1000);
    
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded for this endpoint',
      message: `Too many attempts. Try again in ${retryAfter} seconds.`,
      retryAfter: retryAfter
    });
  }
  
  res.set({
    'X-RateLimit-Limit': STRICT_MAX_REQUESTS,
    'X-RateLimit-Remaining': Math.max(0, STRICT_MAX_REQUESTS - clientData.count),
    'X-RateLimit-Reset': Math.ceil((clientData.windowStart + STRICT_WINDOW) / 1000)
  });
  
  next();
};