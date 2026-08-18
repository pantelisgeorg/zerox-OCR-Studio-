import * as Tesseract from "tesseract.js";
export declare const getTesseractScheduler: () => Promise<Tesseract.Scheduler>;
export declare const addWorkersToTesseractScheduler: ({ numWorkers, scheduler, }: {
    numWorkers: number;
    scheduler: Tesseract.Scheduler;
}) => Promise<boolean>;
export declare const terminateScheduler: (scheduler: Tesseract.Scheduler) => Promise<any>;
export declare const prepareWorkersForImageProcessing: ({ numImages, maxTesseractWorkers, scheduler, }: {
    numImages: number;
    maxTesseractWorkers: number;
    scheduler: Tesseract.Scheduler | null;
}) => Promise<void>;
