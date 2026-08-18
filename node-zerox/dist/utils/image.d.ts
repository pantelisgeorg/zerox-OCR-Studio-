import Tesseract from "tesseract.js";
interface CleanupImageProps {
    correctOrientation: boolean;
    imageBuffer: Buffer;
    scheduler: Tesseract.Scheduler | null;
    trimEdges: boolean;
}
export declare const encodeImageToBase64: (imageBuffer: Buffer) => string;
export declare const cleanupImage: ({ correctOrientation, imageBuffer, scheduler, trimEdges, }: CleanupImageProps) => Promise<Buffer[]>;
/**
 * Compress an image to a maximum size
 * @param image - The image to compress as a buffer
 * @param maxSize - The maximum size in MB
 * @returns The compressed image as a buffer
 */
export declare const compressImage: (image: Buffer, maxSize: number) => Promise<Buffer>;
export declare const splitTallImage: (imageBuffer: Buffer) => Promise<Buffer[]>;
export {};
