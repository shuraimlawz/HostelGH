import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Redis from "ioredis";

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;

  constructor(private configService: ConfigService) { }

  async onModuleInit() {
    const url = this.configService.get<string>("redis.url") || process.env.REDIS_URL;
    const host = this.configService.get<string>("redis.host") || process.env.REDIS_HOST;
    const port = this.configService.get<number>("redis.port") || parseInt(process.env.REDIS_PORT || "6379");

    const hasConfig = !!(url || (host && host !== "localhost"));

    if (!hasConfig) {
      console.log("[Redis] No configuration found, skipping initialization");
      return;
    }

    const options = {
      lazyConnect: true,
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => {
        if (times > 5) return null; // Stop after 5 attempts
        return Math.min(times * 100, 3000);
      },
    };

    if (url) {
      this.client = new Redis(url, options);
    } else {
      this.client = new Redis({
        host,
        port,
        ...options,
      });
    }

    this.client.on("error", (err) => {
      console.error("[Redis] Connection Error:", (err as any).message);
    });

    try {
      await this.client.connect();
      console.log("[Redis] Connected successfully");
    } catch (err) {
      console.error("[Redis] connection failed to start:", (err as any).message);
    }
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async setJson(key: string, value: any, ttlSeconds?: number): Promise<void> {
    await this.set(key, JSON.stringify(value), ttlSeconds);
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    return value ? JSON.parse(value) : null;
  }
}
