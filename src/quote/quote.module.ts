import { Module } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quote } from './entities/quote.entity';
import { QuoteRepository } from './quote.repository';
import { ReceptionRepository } from './reception.repository';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    AuthModule,
    HttpModule,
    TypeOrmModule.forFeature([Quote])
  ],
  controllers: [QuoteController],
  providers: [QuoteService, QuoteRepository, ReceptionRepository],
  exports: [QuoteService],
})
export class QuoteModule {}
