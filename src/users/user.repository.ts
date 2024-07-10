import { DataSource, Repository } from 'typeorm';
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { User } from './entities/user.entity';

@Injectable()
export class UserRepository extends Repository<User> {
    constructor(private dataSource: DataSource)
    {
        super(User, dataSource.createEntityManager());
    }

    async createUser(userEntity: User): Promise<void> {    
        try {
            await this.save(userEntity);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
