// Simple API cache to prevent duplicate requests
class ApiCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private pendingRequests = new Map<string, Promise<any>>();
  private readonly CACHE_DURATION = 30000; // 30 seconds

  async get<T>(key: string, fetcher: () => Promise<T>, retries = 2): Promise<T> {
    // Check if we have a valid cached result
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Check if there's already a pending request for this key
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)!;
    }

    // Create a new request with retry logic
    const request = this.fetchWithRetry(fetcher, retries).then(data => {
      // Cache the result
      this.cache.set(key, { data, timestamp: Date.now() });
      // Remove from pending requests
      this.pendingRequests.delete(key);
      return data;
    }).catch(error => {
      // Remove from pending requests on error
      this.pendingRequests.delete(key);
      throw error;
    });

    // Store the pending request
    this.pendingRequests.set(key, request);
    return request;
  }

  private async fetchWithRetry<T>(fetcher: () => Promise<T>, retries: number): Promise<T> {
    try {
      return await fetcher();
    } catch (error) {
      if (retries > 0) {
        // Wait 1 second before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.fetchWithRetry(fetcher, retries - 1);
      }
      throw error;
    }
  }

  clear() {
    this.cache.clear();
    this.pendingRequests.clear();
  }

  // Clear cache for a specific key
  clearKey(key: string) {
    this.cache.delete(key);
    this.pendingRequests.delete(key);
  }
}

export const apiCache = new ApiCache();
