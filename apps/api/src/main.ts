import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
// Build trigger: Production Auth Fix - March 10
import { PrismaService } from "./prisma/prisma.service";
import * as bodyParser from "body-parser";
import { ValidationPipe, Logger } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { HybridValidationPipe } from "./common/pipes/validation.pipe";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle("HostelGH API")
    .setDescription("Full-featured Hostel Booking Platform API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  // Paystack webhook needs raw body for signature verification:
  app.use(
    bodyParser.json({
      verify: (req: any, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false, // Disable CSP if it interferes with Swagger (local dev)
    }),
  );

  app.use(cookieParser());

  app.useGlobalPipes(new HybridValidationPipe());

  app.useGlobalFilters(new HttpExceptionFilter());

  const prisma = app.get(PrismaService);
  await prisma.enableShutdownHooks();

  const appUrl = process.env.APP_URL || "https://hostelgh.onrender.com";
  const frontendUrl = process.env.FRONTEND_URL || "https://hostelgh.vercel.app";

  const allowedOrigins = [
    appUrl,
    frontendUrl,
    "https://hostelgh.onrender.com",
    "https://hostelgh.vercel.app",
    "https://hostelgh-api.onrender.com",
    "http://localhost:3000"
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log during development to debug CORS issues
        logger.warn(`Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Application is running on: ${appUrl}`);

  // Self-healing Admin Account Creation (Directly on Startup)
  try {
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const adminPass = process.env.ADMIN_PASSWORD || "Password123!";
    const UserRole = { ADMIN: "ADMIN" }; // Local shim for simplicity if needed, but we have prisma
    
    const user = await prisma.user.findUnique({ where: { email: adminEmail } });
    const bcrypt = require("bcryptjs");
    const passwordHash = await bcrypt.hash(adminPass, 12);

    if (!user) {
      logger.log(`[Self-Healing] Creating admin user: ${adminEmail}`);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          role: "ADMIN" as any,
          firstName: "Site",
          lastName: "Admin",
          emailVerified: true,
          isActive: true,
          isOnboarded: true,
        },
      });
    } else if (user.role !== "ADMIN" || user.email === "admin@example.com") {
      // Always ensure the default admin account has the correct role and latest password
      logger.log(`[Self-Healing] Updating admin account: ${adminEmail}`);
      await prisma.user.update({
        where: { email: adminEmail },
        data: { 
          role: "ADMIN" as any,
          passwordHash,
          isActive: true,
          emailVerified: true 
        },
      });
    }
  } catch (err) {
    logger.error("[Self-Healing] Failed to ensure admin user", err);
  }
}
bootstrap();
