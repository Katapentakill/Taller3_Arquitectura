import { IsNotEmpty, MinLength } from 'class-validator';
export class CreateVideoDto {
    @IsNotEmpty()
    @MinLength(3)
    title: string;

    @IsNotEmpty()
    @MinLength(5)
    description: string;

    @IsNotEmpty()
    @MinLength(5)
    genre: string;
}