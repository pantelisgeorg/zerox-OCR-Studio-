import { ExcelSheetContent, Page } from "../types";
export declare const downloadFile: ({ filePath, tempDir, }: {
    filePath: string;
    tempDir: string;
}) => Promise<{
    extension: string;
    localPath: string;
}>;
export declare const checkIsCFBFile: (filePath: string) => Promise<boolean>;
export declare const checkIsPdfFile: (filePath: string) => Promise<boolean>;
export declare const convertHeicToJpeg: ({ localPath, tempDir, }: {
    localPath: string;
    tempDir: string;
}) => Promise<string>;
export declare const convertFileToPdf: ({ extension, localPath, tempDir, }: {
    extension: string;
    localPath: string;
    tempDir: string;
}) => Promise<string>;
export declare const convertPdfToImages: ({ imageDensity, imageFormat, imageHeight, pagesToConvertAsImages, pdfPath, tempDir, }: {
    imageDensity?: number;
    imageFormat?: "png" | "jpeg";
    imageHeight?: number;
    pagesToConvertAsImages: number | number[];
    pdfPath: string;
    tempDir: string;
}) => Promise<string[]>;
export declare const convertExcelToHtml: (filePath: string) => Promise<ExcelSheetContent[]>;
export declare const extractPagesFromStructuredDataFile: (filePath: string) => Promise<Page[]>;
export declare const getNumberOfPagesFromPdf: ({ pdfPath, }: {
    pdfPath: string;
}) => Promise<number>;
export declare const isExcelFile: (filePath: string) => boolean;
export declare const isStructuredDataFile: (filePath: string) => boolean;
