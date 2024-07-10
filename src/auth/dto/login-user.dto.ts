import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginUserDto {
  @IsEmail()
  @IsNotEmpty()
  userId: string
    
  @IsNotEmpty()
  password: string
}