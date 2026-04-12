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
import { DisputesModule } from "./modules/disputes/disputes.module";
import { HealthModule } from "./modules/health/health.module";
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { PayoutsModule } from "./modules/payouts/payouts.module";
import { UploadModule } from "./modules/upload/upload.module";
import { AdminModule } from "./modules/admin/admin.module";
import { PaymentMethodsModule } from "./modules/payment-methods/payment-methods.module";
import { WalletsModule } from "./modules/wallets/wallets.module";
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
    DisputesModule,
    HealthModule,
    NotificationsModule,
    PayoutsModule,
    UploadModule,
    AdminModule,
    PaymentMethodsModule,
    WalletsModule,
    RedisModule,
    SubscriptionsModule,
    EmailModule,
    ReviewsModule,
    ChatModule,
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
