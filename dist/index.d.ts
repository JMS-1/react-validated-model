import { ValidationError, ValidationSchema } from 'fastest-validator';
export interface IModelControl {
    findErrors(prop?: string): ValidationError[];
    isDirty(): boolean;
    reset(): void;
}
export declare function useModel<T extends object>(original: T, schema?: ValidationSchema): [T, IModelControl];
