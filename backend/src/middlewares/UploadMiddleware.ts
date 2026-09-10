import multer from 'multer'

const storage = multer.memoryStorage()

const upload = multer({
    storage,

    limits: {
        files: 3,
        fileSize: 5 * 1024 * 1024 // 5 MB per image
    },

    fileFilter: (req, file, cb) => {

        if (
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png' ||
            file.mimetype === 'image/webp'
        ) {
            cb(null, true)
        } else {
            cb(new Error('Only JPEG, PNG and WEBP images are allowed'))
        }
    }
})

export const uploadImages = upload.array('images', 3)