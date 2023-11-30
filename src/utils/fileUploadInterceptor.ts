import { ConflictException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

export const fileUploadInterceptor = FileInterceptor('file', {
  // Тут описан рабочий вариант загрузки статики в папку, решил попробовать новое и использовать CDN
  // Не указано сколько файлов должно загружаться, по этому оставил вариатнт с 1 файлом (ресширитть до множества не является проблемой)

  // storage: diskStorage({
  //   destination: './src/uploadedFiles',
  //   filename: (req, file, callback) => {
  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //     const fileExtension = extname(file.originalname).toLowerCase();
  //     const newFileName = file.fieldname + '-' + uniqueSuffix + fileExtension;
  //     callback(null, newFileName);
  //   },
  // }),
  fileFilter: (req, file, callback) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new ConflictException(
          'Invalid file format. Please load only this format file: (png | jpg | webp | jpeg)',
        ),
        false,
      );
    }
  },
});
