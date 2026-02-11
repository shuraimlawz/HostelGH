import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration, { envSchema } from './common/config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { HostelsModule } from './modules/hostels/hostels.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { HealthModule } from './modules/health/health.module';
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerGuard } from "@nestjs/throttler";
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

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
        ThrottlerModule.forRoot([{
            ttl: 60000,
            limit: 100,
        }]),
    ],
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
export class AppModule { }
