import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { Coin } from './models/coin.model';
import { CoinDetails } from './models/coin-details.model';
import {
  distinctUntilChanged,
  map,
  Observable,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs';
import { CoingeckoService } from './coingecko.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [MatTableModule, MatButtonModule, HttpClientModule, CommonModule],
  providers: [CoingeckoService],
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['symbol', 'name', 'details'];
  dataSource$!: Observable<MatTableDataSource<Coin>>;
  coinSelected$ = new Subject<string>();
  selectedCoin$!: Observable<CoinDetails>;

  constructor(private coinService: CoingeckoService) {}

  ngOnInit(): void {
    this.dataSource$ = this.coinService
      .getCoins()
      .pipe(
        map(
          (coins: Coin[]) => new MatTableDataSource<Coin>(coins.slice(0, 100))
        )
      );

    this.selectedCoin$ = this.coinSelected$.pipe(
      throttleTime(300),
      distinctUntilChanged(),
      switchMap((coinId) => {
        return this.coinService.getDetails(coinId);
      })
    );
  }

  getDetails(coinId: string): void {
    this.coinSelected$.next(coinId);
  }
}
