import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { BadRequestException } from '@nestjs/common';
import { CustomBadRequestException } from 'src/common/exceptions';

type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];
const maximumSize = 2097152;
// const maximumSize = 2097;

export const saveImageToStorage = {
  storage: diskStorage({
    destination: './public/assets',
    filename: (req, file, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: maximumSize },

  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      const error = new BadRequestException(
        new CustomBadRequestException(
          'Only png, jpeg, jpg formats are accepted',
        ),
      );
      cb(error, false);
    }

    cb(null, true);
  },
};
