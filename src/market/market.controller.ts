import { Controller, Get } from '@nestjs/common';
import { MarketService } from './market.service';

@Controller('market')
export class MarketController {
  constructor(private readonly marketService: MarketService) {}

  // @Get('data')
  // async scanMarketData() {
  //   return await this.marketService.scanMarketData();
  // }
}
