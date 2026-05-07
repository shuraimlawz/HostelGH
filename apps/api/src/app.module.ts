import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import configuration, { envSchema } from "./common/config/configuration";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { HostelsModule } from "./modules/hostels/hostels.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { BookingsModule } from "./modules/bookings/bookings.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { AdminModule } from "./modules/admin/admin.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { UploadModule } from "./modules/upload/upload.module";
import { RedisModule } from "./modules/redis/redis.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ScheduleModule } from "@nestjs/schedule";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";

import { EmailModule } from "./modules/email/email.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";

import { ChatModule } from "./modules/chat/chat.module";
import { NewsletterModule } from "./modules/newsletter/newsletter.module";
import { FavoritesModule } from "./modules/favorites/favorites.module";
import { SearchModule } from "./modules/search/search.module";
import { BullModule } from "@nestjs/bullmq";
import { DiscoveryModule } from "./modules/discovery/discovery.module";
import { AIModule } from "./modules/ai/ai.module";
import { AppController } from "./app.controller";


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envSchema,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    HostelsModule,
    RoomsModule,
    BookingsModule,
    PaymentsModule,
    HealthModule,
    NotificationsModule,
    UploadModule,
    AdminModule,
    RedisModule,
    SubscriptionsModule,
    EmailModule,
    ReviewsModule,
    ChatModule,
    NewsletterModule,
    FavoritesModule,
    SearchModule,
    DiscoveryModule,
    AIModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>("REDIS_URL");
        const redisHost = config.get<string>("REDIS_HOST");
        const isDev = process.env.NODE_ENV !== 'production';

        // If a full REDIS_URL is provided (Standard for Render/Heroku/Upstash)
        if (redisUrl) {
          const Redis = require('ioredis');
          return {
            connection: new Redis(redisUrl, {
              maxRetriesPerRequest: null,
            }),
          };
        }

        // Fallback to host/port
        return {
          connection: {
            host: redisHost || (isDev ? "localhost" : "127.0.0.1"),
            port: config.get<number>("REDIS_PORT") || 6379,
            maxRetriesPerRequest: isDev ? 20 : 1,
          } as any,
        };
      },
    }),
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes("*");
  }
}
