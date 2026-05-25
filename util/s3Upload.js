const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const { v4: uuidv4 } = require('uuid');
const mime = require('mime-types');
const sharp = require('sharp');


const s3 = new S3Client({
    credentials:{
        accessKeyId: process.env.ACCESSKEYID,
        secretAccessKey: process.env.SECRETACCESSKEY,
    },
    region: process.env.REGION
  })

  

  const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.BUCKET, 
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let extension = '';
        if (file.mimetype.startsWith('image/')) {
          extension = '.jpeg'; // You could also detect the actual extension
        } else if (file.mimetype.startsWith('video/')) {
          extension = '.mp4'; // Adjust based on your needs
        }
        cb(null, `contractorImages-${uniqueSuffix}${extension}`);
      },
      contentType: multerS3.AUTO_CONTENT_TYPE,
    }),
    fileFilter: (req, file, cb) => {
      // Allow only images or videos
      if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
        cb(null, true);
      } else {
        cb(new Error('Not an image or video! Please upload an image or video.'), false);
      }
    },
    limits: { fileSize: 60 * 1024 * 1024 } // Increase file size limit to 20MB
  });

  const uploadBase64ToS3 = async (base64Data, mimeType, originalFilename = "file") => {
    try {
      const buffer = Buffer.from(base64Data, 'base64');
  
      const extension = mime.extension(mimeType) || "bin";
      const uniqueFilename = `${uuidv4()}-${originalFilename.replace(/\s+/g, '_')}.${extension}`;
  
      const params = {
        Bucket: process.env.BUCKET,
        Key: `uploads/${uniqueFilename}`,
        Body: buffer,
        ContentType: mimeType
      };
  
      console.log("🔍 Uploading to S3 with params:", JSON.stringify(params, null, 2)); // Debug request
  
      await s3.send(new PutObjectCommand(params));
  
      console.log("✅ Upload successful:", `https://${process.env.BUCKET}.s3.amazonaws.com/uploads/${uniqueFilename}`);
      
      return `https://${process.env.BUCKET}.s3.amazonaws.com/uploads/${uniqueFilename}`;
    } catch (error) {
      console.error("❌ Error uploading to S3:", error);
      return null;
    }
  };
  
  
  


  module.exports = {upload, uploadBase64ToS3};