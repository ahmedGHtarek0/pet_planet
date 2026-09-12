import multer from 'multer';
import path from 'path';

const storage = multer.memoryStorage();

const fileFilter = (req: any, file: any, cb: any) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
        ext === '.jpg' ||
        ext === '.jpeg' ||
        ext === '.png'
    ) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type!'), false);
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 1024 * 60 * 60
    }
});