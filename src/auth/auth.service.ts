import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '../users/user.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async validateUser(userId: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({userId: userId});
    if(!user)
      return null;
      
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  public async login(loginUserDto: LoginUserDto): Promise<{accessToken: string}> {
    const { userId, password } = loginUserDto;
    const user = await this.validateUser(loginUserDto.userId, loginUserDto.password);
    
    if(user) {
      // 유저 토큰 생성 ( Secret + Payload )
      const payload = { id: user.id, userId: user.userId };
      const accessToken = await this.jwtService.sign(payload, { expiresIn: '30m' });
      
      return { accessToken };
    } else {
      throw new UnauthorizedException('login failed')
    }
  }
}
