import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>("REDIS_HOST") || "localhost",
          port: config.get<number>("REDIS_PORT") || 6379,
        },
      }),
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
