import { Injectable, NotFoundException } from "@nestjs/common";
import { v2 as cloudinary } from 'cloudinary';
import { extractPublicId } from 'cloudinary-build-url';

// ADD
import * as streamifier from 'streamifier';
import { CloudinaryResponse } from "./cloudinary-response";

@Injectable()
export class CloudinaryService {
    uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: 'kltn' },
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }

    async uploadMultipleFile(files: Express.Multer.File[]): Promise<string[]> {
        const uploadedResults = await Promise.all(files.map((file) => this.uploadFile(file)));
        const resut: string[] = uploadedResults.map(item => item.url);

        return resut;
    }

    destroy(publicId: string): Promise<CloudinaryResponse> {
        return new Promise<CloudinaryResponse>((resolve, reject) => {
            cloudinary.uploader.destroy(
                publicId,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
        });
    }

    async deleteImageOnCloud(url: string): Promise<void> {
        const publicId = extractPublicId(url);
        const result = await this.destroy(publicId);
        if (result.result !== 'ok') throw new NotFoundException("Delete Image Cloudinary Fail");
    }
}