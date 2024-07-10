import { Body, Controller, Post, Res, Req, HttpStatus, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from '../auth/dto/login-user.dto'
import { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { CustomException } from '../commons/custom.exception';

@Controller('user')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService) {}


  @Post('/signup')
  async signUp(@Res() res, @Body() createUserDto: CreateUserDto) {
    const user:User = await this.usersService.createUser(createUserDto);
    if(user) {
      const result = {  resultCode: 200, resultMsg: 'OK' };
      res.status(HttpStatus.OK).json(result);
    }
    else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, '내부 오류');
    }
  }

  @Post('/login')
  async login(@Res() res, @Body() loginUserDto: LoginUserDto) {
    const accessToken = await this.authService.login(loginUserDto);
    if(accessToken) {
      const result = {  resultCode: 200, resultMsg: 'OK', token: accessToken.accessToken };
      res.status(HttpStatus.OK).json(result);
    }
    else {
      throw new CustomException(HttpStatus.INTERNAL_SERVER_ERROR, '내부 오류');
    }
  }
}
