import { Module } from '@nestjs/common';
import { HistorianService } from './historian.service';
import { HistorianController } from './historian.controller';

@Module({
  providers: [HistorianService],
  controllers: [HistorianController]
})
export class HistorianModule {}
