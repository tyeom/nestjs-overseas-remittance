import { Injectable } from '@nestjs/common';

// the service instance is provided as a singleton on the application scope.
@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}
