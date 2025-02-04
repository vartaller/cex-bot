import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MarketModule } from './market/market.module';
import { HistorianModule } from './historian/historian.module';

@Module({
  imports: [MarketModule, HistorianModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
