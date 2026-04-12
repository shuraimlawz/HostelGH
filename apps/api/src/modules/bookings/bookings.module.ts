import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [NotificationsModule, ConfigModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
