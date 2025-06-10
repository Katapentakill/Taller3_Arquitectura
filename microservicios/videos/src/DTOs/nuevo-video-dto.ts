import { MinLength } from 'class-validator';
export class NuevoVideoDto {
    @MinLength(3)
    title?: string;

    @MinLength(5)
    description?: string;

    @MinLength(5)
    genre?: string;
}
