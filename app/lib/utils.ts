import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const formatSize = (bytes: number): string => {
    if (bytes === 0) {
        return '0 Bytes';
    }
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

export const generateUUID = (): string => {
    return crypto.randomUUID();
}

export const computeOverallScore = (feedback: any): number => {
    if (!feedback || typeof feedback !== 'object') {
        return 0;
    }
    
    const direct = Number(feedback.overallScore);
    
    if (!Number.isNaN(direct) && direct >= 0 && direct <= 100) {
        return direct;
    }

    const parts: number[] = [];
    const pushIfValid = (val: unknown) => {
        const num = Number(val);
        if (!Number.isNaN(num) && num >= 0 && num <= 100) {
            parts.push(num);
        }
    };

    pushIfValid(feedback.ATS?.score);
    pushIfValid(feedback.toneAndStyle?.score);
    pushIfValid(feedback.content?.score);
    pushIfValid(feedback.structure?.score);
    pushIfValid(feedback.skills?.score);

    if (parts.length === 0) {
        return 0;
    }
    
    const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
    return Math.round(avg);
}

