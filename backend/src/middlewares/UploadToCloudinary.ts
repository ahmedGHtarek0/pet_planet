import cloudinary from '../index'

export const uploadToCloudinary = (
    buffer: Buffer
): Promise<any> => {

    return new Promise((resolve, reject) => {

        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'pet_planet'
            },
            (error, result) => {

                if (error) {
                    reject(error)
                } else {
                    resolve(result)
                }
            }
        )

        stream.end(buffer)
    })
}