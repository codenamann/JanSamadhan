// Custom logging middleware

/**
 * Custom request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const requestLogger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const ip = req.ip || req.connection.remoteAddress;

  // Log request details
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

  // Log request body for POST/PUT requests (excluding sensitive data)
  if ((method === 'POST' || method === 'PUT') && req.body) {
    const sanitizedBody = { ...req.body };
    // Remove any sensitive fields if they exist
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    console.log(`[${timestamp}] Request Body:`, sanitizedBody);
  }

  // Track response time
  const startTime = Date.now();
  
  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    console.log(`[${timestamp}] Response: ${res.statusCode} - ${responseTime}ms`);
    originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Error logging middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export const errorLogger = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  
  console.error(`[${timestamp}] ERROR: ${method} ${url}`);
  console.error(`[${timestamp}] Error Message: ${err.message}`);
  console.error(`[${timestamp}] Stack Trace: ${err.stack}`);
  
  next(err);
};