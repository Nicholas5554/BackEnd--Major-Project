import multer from "multer";
import fs from "fs";
import { randomUUID } from "crypto";

const normalizeFileName = (fileName) => {
    return Buffer.from(fileName, 'latin1').toString('utf8');
};

const dest = multer.diskStorage({
    destination: (req, file, callback) => {
        const dir = `public/uploads/${req.user._id}`;
        fs.mkdirSync(dir, { recursive: true });
        callback(null, dir);
    },
    filename: (req, file, callback) => {
        const normalizedFilename = `${randomUUID()}-${normalizeFileName(file.originalname)}`;
        req.fileName = `http://localhost:8080/uploads/${req.user._id}/${normalizedFilename}`;
        callback(null, normalizedFilename);
    }
});

export const upload = multer({
    storage: dest,
    limits: { fileSize: 5000000 },
    fileFilter: (req, file, callback) => {
        const normalizedFilename = normalizeFileName(file.originalname);

        if (!normalizedFilename.match(/\.(pdf|docx|doc|png|jpg|jpeg)$/)) {
            return callback(
                new Error("Please upload a PDF, Word document or an image")
            );
        }
        callback(null, true);
    }
}).single('file');
