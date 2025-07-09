class RateLimiter {
  constructor() {
    this.rateLimitCache = new Map();
    this.cooldownPeriod = 15 * 60 * 1000; // 15 minutes
  }
  
  isRateLimited(method) {
    const now = Date.now();
    const lastRateLimit = this.rateLimitCache.get(method);
    
    if (lastRateLimit && (now - lastRateLimit) < this.cooldownPeriod) {
      return true;
    }
    return false;
  }
  
  markRateLimited(method) {
    this.rateLimitCache.set(method, Date.now());
    console.log(`Rate limit recorded for ${method}. Cooldown: ${this.cooldownPeriod / 60000} minutes`);
  }
}

module.exports = { RateLimiter }; 