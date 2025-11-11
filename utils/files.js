import multer from 'multer'
import fs from 'fs'
import path from 'path'
import {v4 as uuidv4} from 'uuid';
export const uploader = (folderName) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const folderPath = path.join('uploads', folderName);
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        cb(null, folderPath);
      },
      filename: function (req, file, cb) {
        const uniqueFilename = uuidv4() + path.extname(file.originalname);
        cb(null, uniqueFilename);
      },
    }),
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
  });
};