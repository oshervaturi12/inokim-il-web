const factory = require('./handlerFactory')
const Page = require('./../models/Page')
const multer = require('multer');

const { upload, uploadBase64ToS3 } = require('./../util/s3Upload'); 

exports.getAllPages = factory.getAll(Page)

exports.createPage = factory.createOne(Page)

exports.getPage = factory.getOne(Page)

exports.updatePage = factory.updateOne(Page)

exports.deletePage = factory.deleteOne(Page)



exports.uploadInquiryImages = (req, res, next) => {
    console.log("🔍 Incoming request headers:", req.headers);
    console.log("🔍 Incoming request body BEFORE multer:", req.body);



    // Upload up to 5 files with the field name 'contractorImages'
    upload.array('contractorImages', 5)(req, res, function (err) {
        console.log("📂 Request body AFTER multer:", req.body);
        console.log("📸 Uploaded files:", req.files);

        if (err instanceof multer.MulterError) {
            console.error("❌ Multer error:", err);
            return next(new AppError(err.message, 500));
        } else if (err) {
            console.error("❌ Other error:", err);
            return next(new AppError(err.message, 500));
        }

        // If no files were uploaded
        if (!req.files || req.files.length === 0) {
            console.warn("⚠️ No files uploaded!");
            delete req.body.contractorImages;
            delete req.body.problemImage;
            delete req.body.approvalImage;
        } 

        // Move to the next middleware
        next();
    });
};
