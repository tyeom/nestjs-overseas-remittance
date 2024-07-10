import { IsEnum, IsEmail, IsNotEmpty, IsString  } from 'class-validator'
import { IdType } from '../enums/id-type-enum'

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  userId: string
    
  @IsNotEmpty()
  password: string

  @IsNotEmpty()
  name: string
  
  @IsEnum(IdType)
  @IsNotEmpty()
  idType: IdType

  @IsString()
  @IsNotEmpty()
  idValue: string
}