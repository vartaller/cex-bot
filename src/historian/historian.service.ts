import { Injectable, OnModuleInit } from '@nestjs/common';
import { OHLCVKlineV5, RestClientV5, WebsocketClient } from 'bybit-api';
import { format } from '@fast-csv/format';
import { KlineOutputDto } from './dto/kline.dto';
import * as fs from 'node:fs';

@Injectable()
export class HistorianService implements OnModuleInit {
  // private klineOutputList: KlineOutputDto[];
  private startTimestamp: number;
  private scanning: boolean;

  constructor() {
    // this.klineOutputList = [];
    this.startTimestamp = 1685570400000;
    this.scanning = true;
  }

  onModuleInit() {
    console.log('Historian has been initialized!');
    this.scanHistoryData().then();
  }

  async scanHistoryData() {
    const filePath = 'output.csv';
    const writeStream = fs.createWriteStream(filePath, { flags: 'a' });
    const csvStream = format({ headers: true });
    csvStream.pipe(writeStream);

    const client = new RestClientV5({
      testnet: false,
    });

    let i = 0;

    while (this.scanning) {
      const klineDamp = await client.getKline({
        category: 'spot',
        symbol: 'SOLUSDT',
        interval: '5',
        start: this.startTimestamp,
      });

      const timestamps: KlineOutputDto[] = await this.parseKlineData(
        klineDamp.result.list,
      );

      timestamps.forEach((klineRow: KlineOutputDto) => {
        csvStream.write(klineRow);
      });

      if (i % 288 === 0) {
        console.log(
          `i: ${i}
        starttime: ${new Date(Number(this.startTimestamp))
          .toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          })
          .replace(/\//g, '-')
          .replace(',', '')}`,
        );
      }

      i = i + 1;
    }
    // console.log(`klineOutputList: ${this.klineOutputList}`);
  }

  async parseKlineData(historyList: OHLCVKlineV5[]): Promise<KlineOutputDto[]> {
    try {
      this.startTimestamp = Number(historyList[0][0]);
      const timestamps: KlineOutputDto[] = historyList.map((list) => {
        return {
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
      return timestamps.reverse().slice(0, -1);
    } catch (err) {
      this.scanning = false;
      console.error(err);
    }
  }
}
