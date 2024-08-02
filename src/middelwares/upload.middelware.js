import multer from 'multer';
import { v4 as uuid4 } from 'uuid';
import { AppError } from '../utilies/error.js';

const getUploadMiddleware = (folderName) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, `uploads/${folderName}`);
        },
        filename: function (req, file, cb) {
            cb(null, uuid4() + file.originalname);
        },
    });

    const fileFilter = (req, file, cb) => {
        if (file.mimetype.startsWith('application/pdf') || file.mimetype.startsWith('image')) {
            cb(null, true);
        } else {
            cb(new AppError('Invalid file type. Only PDFs and images are allowed.', 403), false);
        }
    };

    const upload = multer({ storage, fileFilter });
    return upload;
};

export const uploadSingle = (fieldName, folderName) => {
    const upload = getUploadMiddleware(folderName);
    return upload.single(fieldName);
};

export default getUploadMiddleware;
