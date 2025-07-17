import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Clean path configuration - no duplicate 'uploads' in path
const uploadConfig = {
  studentImages: {
    dir: path.join(__dirname, "../../uploads/student_images"),
    allowedTypes: ["image/jpeg", "image/png", "image/jpg"],
    maxSize: 2 * 1024 * 1024,
  },
  answerSheets: {
    dir: path.join(__dirname, "../../uploads/answer_sheets"),
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    maxSize: 5 * 1024 * 1024,
  },
  temp: {
    dir: path.join(__dirname, "../../uploads/temp"),
    allowedTypes: ["image/jpeg", "image/png", "image/jpg", "application/pdf"],
    maxSize: 5 * 1024 * 1024,
  },
};

// Create directories if they don't exist
Object.values(uploadConfig).forEach((config) => {
  if (!fs.existsSync(config.dir)) {
    fs.mkdirSync(config.dir, { recursive: true });
    console.log(`Created directory: ${config.dir}`);
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "image") {
      cb(null, uploadConfig.studentImages.dir);
    } else if (file.fieldname === "answerSheet") {
      cb(null, uploadConfig.temp.dir);
    } else {
      cb(new Error("Invalid upload field"));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
    cb(null, filename);
  },
});

const fileFilter = (req, file, cb) => {
  let allowedTypes;

  if (file.fieldname === "image") {
    allowedTypes = uploadConfig.studentImages.allowedTypes;
  } else if (file.fieldname === "answerSheet") {
    allowedTypes = uploadConfig.answerSheets.allowedTypes;
  } else {
    return cb(new Error("Invalid upload field"));
  }

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`)
    );
  }
};

const multerUpload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: uploadConfig.answerSheets.maxSize,
  },
});

export const studentImageUpload = multerUpload.single("image");
export const answerSheetFileUpload = multerUpload.single("answerSheet");

export default {
  studentImageUpload,
  answerSheetFileUpload,
};
