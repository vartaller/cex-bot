import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebsocketClient } from 'bybit-api';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class MarketService implements OnModuleInit {
  onModuleInit() {
    console.log('MarketClient is sleeping...');
    // console.log('MarketClient has been initialized!');
    // this.scanMarketData().then((r) => console.log('finished'));
  }

  private ws: WebsocketClient;
  private readonly scanning: boolean;

  constructor() {
    this.ws = new WebsocketClient({
      market: 'v5',
    });
  }

  async scanMarketData() {
    await this.ws
      .subscribeV5('kline.5.SOLUSDT', 'spot')
      .then(() => console.log('subscribed'));

    this.ws.on('update', (data) => {
      // console.log(...data.data);
      data.data.forEach((item) => {
        const formatDate = (timestamp) => {
          return new Date(timestamp)
            .toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            .replace(/\//g, '-')
            .replace(',', '');
        };

        console.log({
          ...item,
          start: formatDate(item.start),
          end: formatDate(item.end),
          timestamp: formatDate(item.timestamp),
        });
      });
    });
  }
}
