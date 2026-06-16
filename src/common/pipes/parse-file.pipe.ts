import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { FILE_SIZE_LIMIT, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from '../constants';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  constructor(private readonly allowedTypes?: string[]) {}

  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (file.size > FILE_SIZE_LIMIT) {
      throw new BadRequestException('File exceeds maximum size');
    }

    const allowed = this.allowedTypes || [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

    if (!allowed.includes(file.mimetype)) {
      throw new BadRequestException(`File type ${file.mimetype} is not allowed`);
    }

    return file;
  }
}
