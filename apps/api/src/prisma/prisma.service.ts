import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }

    // Prisma 5+ handles connection lifecycle well. 
    // We'll skip the manual 'beforeExit' hook to avoid type issues with newer Prisma versions.
    async enableShutdownHooks(app: any) {
        // No-op or alternative if needed for specific setups
    }
}
