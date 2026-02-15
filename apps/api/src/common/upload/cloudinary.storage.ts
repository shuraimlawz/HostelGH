import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../../config/cloudinary.config';

// Storage configuration for hostel images
export const CloudinaryHostelStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'hostelgh/hostels',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, height: 1000, crop: 'limit' }],
    }),
});

// Storage configuration for room images
export const CloudinaryRoomStorage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
        folder: 'hostelgh/rooms',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1600, height: 1000, crop: 'limit' }],
    }),
});
