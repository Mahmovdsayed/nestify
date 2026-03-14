import { v2 as cloudinary } from "cloudinary";
import { fileToBuffer } from "../middlewares/multer";
import { configureCloudinary } from "@/Integrations/cloudinary";

// Helper to upload image to Cloudinary
const uploadImageToCloudinary = async (
  image: File,
  folderName: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  },
): Promise<{ imageUrl: string; publicId: string }> => {
  configureCloudinary();
  return new Promise(async (resolve, reject) => {
    const buffer = await fileToBuffer(image);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `nestify/${folderName}`,
        width: options?.width || 500,
        height: options?.height || 500,
        crop: options?.crop || "fill",
        quality: options?.quality || "auto:good",
        format: "webp",
      },
      (error, result) => {
        if (error || !result) {
          return reject(
            new Error(`Cloudinary upload failed: ${error?.message}`),
          );
        }

        resolve({
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      },
    );

    stream.end(buffer);
  });
};

// Helper to update image in Cloudinary
const updateImageInCloudinary = async (
  image: File,
  folderName: string,
  publicId?: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
  },
): Promise<{ imageUrl: string; publicId: string }> => {
  configureCloudinary();
  try {
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err: any) {
        throw new Error(`Failed to delete old image: ${err.message}`);
      }
    }

    return new Promise(async (resolve, reject) => {
      const buffer = await fileToBuffer(image);

      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `nestify/${folderName}`,
          width: options?.width || 500,
          height: options?.height || 500,
          crop: options?.crop || "fill",
          quality: options?.quality || "auto:good",
          format: "webp",
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new Error(`Cloudinary update failed: ${error?.message}`),
            );
          }

          resolve({
            imageUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      stream.end(buffer);
    });
  } catch (error: any) {
    throw new Error(`updateImageInCloudinary failed: ${error.message}`);
  }
};

// Helper to delete Image from Cloudinary
const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  configureCloudinary();
  await cloudinary.uploader.destroy(publicId);
};

export {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
  updateImageInCloudinary,
};
