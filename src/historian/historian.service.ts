import { Injectable, OnModuleInit } from '@nestjs/common';
import { RestClientV5, WebsocketClient } from 'bybit-api';
import BaseRestClient from 'bybit-api/lib/util/BaseRestClient';

@Injectable()
export class HistorianService implements OnModuleInit {
  onModuleInit() {
    console.log('Historian has been initialized!');
    this.scanHistoryData().then((r) => console.log('finished'));
  }

  async scanHistoryData() {
    const client = new RestClientV5({
      testnet: false,
    });

    client
      .getKline({
        category: 'spot',
        symbol: 'SOLUSDT',
        interval: '60',
        start: 1685570400000,
        // end: 1685570400000,1685630100000
      })
      .then((response) => {
        this.parseTimestamps(response.result.list);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async parseTimestamps(historyArray: any) {
    const timestamps = historyArray.map((i) => [new Date(Number(i[0])), i]);
    // timestamps.sort((a, b) => a.getTime() - b.getTime());
    console.log(timestamps);
    // console.log(
    //   `start date: ${timestamps[0]},
    //   end date: ${timestamps[timestamps.length - 1]}`,
    // );
  }
}
