import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { PrismaService } from './prisma/prisma.service';
import * as bodyParser from 'body-parser';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    const config = new DocumentBuilder()
        .setTitle('HostelGH API')
        .setDescription('Full-featured Hostel Booking Platform API')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);


    // Paystack webhook needs raw body for signature verification:
    app.use(
        bodyParser.json({
            verify: (req: any, _res, buf) => {
                req.rawBody = buf;
            },
        }),
    );

    app.use(helmet());

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    app.useGlobalFilters(new HttpExceptionFilter());

    const prisma = app.get(PrismaService);
    await prisma.enableShutdownHooks(app);

    app.enableCors({ origin: true, credentials: true });

    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
