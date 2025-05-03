import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsString({ message: 'Text must be a string' })
  @MinLength(3, {
    message: 'Text must be at least 3 characters long',
  })
  @MaxLength(200, {
    message: 'Text must be at most 200 characters long',
  })
  text: string;
}
