import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto'
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { encrypt, decrypt } from '../helpers/aes.helpers';
import { UserRepository } from './user.repository';
import { CustomException } from '../commons/custom.exception';

@Injectable()
export class UsersService {
  constructor(
    private userRepository: UserRepository
  ){}

  public async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user:User = new User();
    user.userId = createUserDto.userId;
    user.password = await bcrypt.hash(createUserDto.password, 10);
    user.name = createUserDto.name;
    user.idType = createUserDto.idType;
    user.idValue = encrypt(createUserDto.idValue);

    const found:User = await this.userRepository.findOneBy({userId: createUserDto.userId});
    if(found)
      throw new CustomException(HttpStatus.BAD_REQUEST, '이미 등록된 이메일 입니다.');

    await this.userRepository.createUser(user);

    return user;
  }
}
