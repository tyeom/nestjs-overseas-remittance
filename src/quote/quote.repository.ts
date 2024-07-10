import { DataSource, Repository } from 'typeorm';
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { Quote } from './entities/quote.entity';

@Injectable()
export class QuoteRepository extends Repository<Quote> {
    constructor(private dataSource: DataSource)
    {
        super(Quote, dataSource.createEntityManager());
    }

    async createQuote(quoteEntity: Quote): Promise<void> {    
        try {
            await this.save(quoteEntity);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
