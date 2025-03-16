import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Coin } from './models/coin.model';
import { CoinDetails } from './models/coin-details.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CoingeckoService {
  readonly BASE_URL = 'https://api.coingecko.com/api/v3';
  constructor(private http: HttpClient) {}

  getCoins() {
    return this.http.get<Coin[]>(`${this.BASE_URL}/coins/list`);
  }

  getDetails(coinId: string): Observable<CoinDetails> {
    return this.http.get<CoinDetails>(`${this.BASE_URL}/coins/${coinId}`);
  }
}
