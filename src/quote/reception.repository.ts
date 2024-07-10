import { DataSource, Repository } from 'typeorm';
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Reception } from './entities/reception.entity';

@Injectable()
export class ReceptionRepository extends Repository<Reception> {
    constructor(private dataSource: DataSource)
    {
        super(Reception, dataSource.createEntityManager());
    }

    async createReception(receptionEntity: Reception): Promise<void> {    
        try {
            await this.save(receptionEntity);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
