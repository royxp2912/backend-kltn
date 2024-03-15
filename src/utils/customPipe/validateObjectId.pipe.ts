import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidateObjectIdPipe implements PipeTransform<string> {
    async transform(value: string, { metatype }: ArgumentMetadata) {
        if (!Types.ObjectId.isValid(value)) {
            throw new BadRequestException('Invalid ObjectId');
        }
        return value;
    }
}