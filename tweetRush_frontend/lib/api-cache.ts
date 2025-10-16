/**
 * API Cache and Rate Limiting Service
 *
 * Implements caching and rate limiting for blockchain API calls
 * to prevent hitting Hiro API rate limits
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresAt: number;
}

interface RequestQueue {
    promise: Promise<any>;
    timestamp: number;
}

class ApiCacheService {
    private cache: Map<string, CacheEntry<any>> = new Map();
    private requestQueue: Map<string, RequestQueue> = new Map();
    private requestTimestamps: number[] = [];

    // Configuration
    private readonly CACHE_TTL = 10000; // 10 seconds default cache
    private readonly MAX_REQUESTS_PER_MINUTE = 50; // Conservative limit
    private readonly MIN_REQUEST_INTERVAL = 1200; // 1.2 seconds between requests (50/min)
    private lastRequestTime = 0;

    /**
     * Get cached data or execute function if cache miss
     */
    async getCached<T>(
        key: string,
        fetchFn: () => Promise<T>,
        ttl: number = this.CACHE_TTL
    ): Promise<T> {
        // Check if we have a valid cached entry
        const cached = this.cache.get(key);
        if (cached && Date.now() < cached.expiresAt) {
            console.log(`[Cache HIT] ${key}`);
            return cached.data as T;
        }

        // Check if there's already a pending request for this key (deduplication)
        const pending = this.requestQueue.get(key);
        if (pending) {
            console.log(`[Request DEDUPE] ${key}`);
            return pending.promise as Promise<T>;
        }

        // Wait for rate limit if needed
        await this.waitForRateLimit();

        // Execute the fetch function
        console.log(`[Cache MISS] Fetching: ${key}`);
        const promise = fetchFn();

        // Store in request queue for deduplication
        this.requestQueue.set(key, {
            promise,
            timestamp: Date.now(),
        });

        try {
            const data = await promise;

            // Store in cache
            this.cache.set(key, {
                data,
                timestamp: Date.now(),
                expiresAt: Date.now() + ttl,
            });

            return data;
        } catch (error) {
            // If rate limited, extend cache if available
            if (this.isRateLimitError(error)) {
                console.warn(`[Rate Limit] Extending cache for ${key}`);
                const staleCache = this.cache.get(key);
                if (staleCache) {
                    // Return stale data rather than failing
                    return staleCache.data as T;
                }
            }
            throw error;
        } finally {
            // Remove from request queue
            this.requestQueue.delete(key);
        }
    }

    /**
     * Wait if we're approaching rate limits
     */
    private async waitForRateLimit(): Promise<void> {
        const now = Date.now();

        // Clean old timestamps (older than 1 minute)
        this.requestTimestamps = this.requestTimestamps.filter(
            (timestamp) => now - timestamp < 60000
        );

        // Check if we're at the limit
        if (this.requestTimestamps.length >= this.MAX_REQUESTS_PER_MINUTE) {
            const oldestTimestamp = this.requestTimestamps[0];
            const waitTime = 60000 - (now - oldestTimestamp);
            if (waitTime > 0) {
                console.warn(
                    `[Rate Limit] Waiting ${waitTime}ms to avoid limit`
                );
                await new Promise((resolve) => setTimeout(resolve, waitTime));
            }
        }

        // Ensure minimum interval between requests
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const waitTime = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            console.log(`[Throttle] Waiting ${waitTime}ms between requests`);
            await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        // Record this request
        this.lastRequestTime = Date.now();
        this.requestTimestamps.push(this.lastRequestTime);
    }

    /**
     * Check if error is a rate limit error
     */
    private isRateLimitError(error: any): boolean {
        const errorMsg = error?.message || error?.toString() || "";
        return (
            errorMsg.includes("rate limit") ||
            errorMsg.includes("429") ||
            errorMsg.includes("Too Many Requests")
        );
    }

    /**
     * Invalidate cache for a specific key
     */
    invalidate(key: string): void {
        this.cache.delete(key);
        console.log(`[Cache] Invalidated: ${key}`);
    }

    /**
     * Invalidate cache by pattern
     */
    invalidatePattern(pattern: string): void {
        const keys = Array.from(this.cache.keys());
        keys.forEach((key) => {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                console.log(`[Cache] Invalidated (pattern): ${key}`);
            }
        });
    }

    /**
     * Clear all cache
     */
    clearAll(): void {
        this.cache.clear();
        this.requestQueue.clear();
        this.requestTimestamps = [];
        console.log("[Cache] Cleared all cache");
    }

    /**
     * Get cache stats
     */
    getStats() {
        return {
            cacheSize: this.cache.size,
            pendingRequests: this.requestQueue.size,
            requestsInLastMinute: this.requestTimestamps.length,
            maxRequestsPerMinute: this.MAX_REQUESTS_PER_MINUTE,
        };
    }

    /**
     * Set custom cache TTL for specific operation
     */
    getCacheTTL(operation: string): number {
        // Different TTLs for different operations
        const ttlMap: Record<string, number> = {
            "has-active-game": 5000, // 5 seconds - frequently changes
            "get-active-game": 5000, // 5 seconds
            "get-player-stats": 30000, // 30 seconds - changes less often
            "get-bounty": 15000, // 15 seconds
            "get-total-words": 300000, // 5 minutes - rarely changes
            "get-user": 60000, // 1 minute - rarely changes
        };

        return ttlMap[operation] || this.CACHE_TTL;
    }
}

// Export singleton instance
export const apiCache = new ApiCacheService();
