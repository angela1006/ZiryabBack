import multer from 'multer';
import { Request } from 'express';
import {
    isJustificationMime,
    isTaskAttachmentMime,
    JUSTIFICATION_FORMATS_MESSAGE,
    TASK_ATTACHMENT_FORMATS_MESSAGE,
} from '../utils/upload-mime.js';

const memoryStorage = multer.memoryStorage();

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (isJustificationMime(file.mimetype, file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error(JUSTIFICATION_FORMATS_MESSAGE));
    }
};

export const uploadJustification = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5 MB
    },
    fileFilter
});

const taskFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (isTaskAttachmentMime(file.mimetype, file.originalname)) {
        cb(null, true);
    } else {
        cb(new Error(TASK_ATTACHMENT_FORMATS_MESSAGE));
    }
};

export const uploadTaskAttachment = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
    fileFilter: taskFileFilter
});

export const uploadSubmission = multer({
    storage: memoryStorage,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50 MB
    },
    fileFilter: taskFileFilter
});
