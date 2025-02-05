import { Injectable, OnModuleInit } from '@nestjs/common';
import { OHLCVKlineV5, RestClientV5, WebsocketClient } from 'bybit-api';
import { createObjectCsvWriter } from 'csv-writer';
import { KlineOutputDto } from './dto/kline.dto';

@Injectable()
export class HistorianService implements OnModuleInit {
  private klineOutputList: KlineOutputDto[];
  private startTimestamp: number;
  private scanning: boolean;

  constructor() {
    this.klineOutputList = [];
    this.startTimestamp = 1685570400000;
    this.scanning = true;
  }

  onModuleInit() {
    console.log('Historian has been initialized!');
    this.scanHistoryData().then();
  }

  async scanHistoryData() {
    const client = new RestClientV5({
      testnet: false,
    });

    let i = 0;

    while (this.scanning && i < 5) {
      const klineDamp = await client.getKline({
        category: 'spot',
        symbol: 'SOLUSDT',
        interval: '5',
        start: this.startTimestamp,
      });

      const timestamps: KlineOutputDto[] = await this.parseKlineData(
        klineDamp.result.list,
        i,
      );
      this.klineOutputList.push(...timestamps.reverse().slice(0, -1));
      if (i == 4) {
        this.klineOutputList.forEach((line) => {
          console.log(
            `starttime: ${this.startTimestamp}, time: ${JSON.stringify(line)}`,
          );
        });
      }

      i = i + 1;
    }
    // console.log(`klineOutputList: ${this.klineOutputList}`);
  }

  async parseKlineData(
    historyList: OHLCVKlineV5[],
    requestId: number,
  ): Promise<KlineOutputDto[]> {
    try {
      this.startTimestamp = Number(historyList[0][0]);
      const timestamps: KlineOutputDto[] = historyList.map((list) => {
        return {
          requestId: requestId,
          date: new Date(Number(list[0]))
            .toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              hour12: true,
            })
            .replace(/\//g, '-')
            .replace(',', ''),
          open: Number(list[1]),
          high: Number(list[2]),
          low: Number(list[3]),
          close: Number(list[4]),
          volume: Number(list[5]),
        };
      });
      return timestamps;
    } catch (err) {
      this.scanning = false;
      console.error(err);
    }
  }
}
