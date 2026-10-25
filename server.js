const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// CAPTURE DIRECTORY
// ==========================================

const captureDir = path.join(__dirname, "captured");

if (!fs.existsSync(captureDir)) {
    fs.mkdirSync(captureDir, { recursive: true });
}

// ==========================================
// IMAGE STORAGE
// ==========================================

const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, captureDir);
    },

    filename: (req, file, cb) => {
        const filename =
            Date.now() +
            "-" +
            Math.floor(Math.random() * 100000) +
            ".jpg";

        cb(null, filename);
    }
});

const uploadImage = multer({
    storage: imageStorage,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

// ==========================================
// VIDEO STORAGE
// ==========================================

const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, captureDir);
    },

    filename: (req, file, cb) => {
        // Always save browser-recorded video as WEBM
        const filename =
            Date.now() +
            "-" +
            Math.floor(Math.random() * 100000) +
            ".webm";

        cb(null, filename);
    }
});

const uploadVideo = multer({
    storage: videoStorage,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

// ==========================================
// SERVE PUBLIC FOLDER
// ==========================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

// ==========================================
// SERVE CAPTURED FILES
// ==========================================

app.use(
    "/captured",
    express.static(captureDir)
);

// ==========================================
// IMAGE UPLOAD
// ==========================================

app.post(
    "/upload",
    uploadImage.single("photo"),
    (req, res) => {

        if (!req.file) {
            console.log("IMAGE UPLOAD FAILED");

            return res.status(400).json({
                success: false,
                message: "No image received"
            });
        }

        console.log("");
        console.log("==============================");
        console.log("IMAGE SAVED:", req.file.filename);
        console.log("IMAGE TYPE:", req.file.mimetype);
        console.log("IMAGE SIZE:", req.file.size, "bytes");
        console.log("==============================");

        res.json({
            success: true,
            filename: req.file.filename
        });
    }
);

// ==========================================
// VIDEO UPLOAD
// ==========================================

app.post(
    "/upload-video",
    uploadVideo.single("video"),
    (req, res) => {

        if (!req.file) {
            console.log("VIDEO UPLOAD FAILED");

            return res.status(400).json({
                success: false,
                message: "No video received"
            });
        }

        console.log("");
        console.log("==============================");
        console.log("VIDEO SAVED:", req.file.filename);
        console.log("VIDEO MIME:", req.file.mimetype);
        console.log("VIDEO SIZE:", req.file.size, "bytes");
        console.log("==============================");

        res.json({
            success: true,
            filename: req.file.filename,
            size: req.file.size,
            type: req.file.mimetype
        });
    }
);

// ==========================================
// GET IMAGES
// ==========================================

app.get(
    "/images",
    (req, res) => {

        fs.readdir(
            captureDir,
            (err, files) => {

                if (err) {
                    return res
                        .status(500)
                        .json([]);
                }

                const images = files.filter(
                    file =>
                        /\.(jpg|jpeg|png)$/i.test(file)
                );

                res.json(images);
            }
        );
    }
);

// ==========================================
// GET VIDEOS
// ==========================================

app.get(
    "/videos",
    (req, res) => {

        fs.readdir(
            captureDir,
            (err, files) => {

                if (err) {
                    return res
                        .status(500)
                        .json([]);
                }

                const videos = files.filter(
                    file =>
                        /\.(webm|mp4|ogg)$/i.test(file)
                );

                res.json(videos);
            }
        );
    }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "     QR CAMERA DEMO SERVER"
        );

        console.log(
            "================================"
        );

        console.log(
            "Server running at:"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log("");

        console.log(
            "Captured files:"
        );

        console.log(
            captureDir
        );

        console.log("");

        console.log(
            "================================"
        );

        console.log("");
    }
);