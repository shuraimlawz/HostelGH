import {
    ArgumentMetadata,
    Injectable,
    PipeTransform,
    ValidationPipe,
} from "@nestjs/common";
import { ZodValidationPipe } from "nestjs-zod";

@Injectable()
export class HybridValidationPipe implements PipeTransform {
    private readonly zodPipe = new ZodValidationPipe();
    private readonly classPipe = new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    });

    async transform(value: any, metadata: ArgumentMetadata) {
        // nestjs-zod DTOs have a static isZodDto property
        const isZod = (metadata.metatype as any)?.isZodDto;

        if (isZod) {
            return this.zodPipe.transform(value, metadata);
        }

        return this.classPipe.transform(value, metadata);
    }
}
