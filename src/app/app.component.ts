import { Component, model, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { HttpClientModule } from '@angular/common/http';
import { Coin } from './models/coin.model';
import { CoinDetails } from './models/coin-details.model';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
  throttleTime,
} from 'rxjs';
import { CoingeckoService } from './coingecko.service';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    MatTableModule,
    MatButtonModule,
    HttpClientModule,
    CommonModule,
    MatPaginatorModule,
    MatSort,
    MatSortModule,
  ],
  providers: [CoingeckoService],
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  displayedColumns: string[] = ['symbol', 'name', 'details'];
  dataSource$!: Observable<MatTableDataSource<Coin>>;
  coinSelected$ = new Subject<string>();
  selectedCoin = model<CoinDetails>();
  isLoadingDetails = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  private filterSubject = new BehaviorSubject<string>('');

  constructor(private coinService: CoingeckoService) {}

  ngOnInit(): void {
    const coins$ = this.coinService
      .getCoins()
      .pipe(map((coins: Coin[]) => coins.slice(0, 100)));

    this.dataSource$ = combineLatest([coins$, this.filterSubject]).pipe(
      map(([coins, filter]) => {
        const filteredCoins = coins.filter(
          (coin) =>
            coin.name.toLowerCase().includes(filter) ||
            coin.symbol.toLowerCase().includes(filter)
        );
        const dataSource = new MatTableDataSource<Coin>(filteredCoins);
        return dataSource;
      }),
      tap((dataSource) => {
        setTimeout(() => {
          dataSource.paginator = this.paginator;
          dataSource.sort = this.sort;
        });
      })
    );

    this.coinSelected$
      .pipe(
        filter(Boolean),
        throttleTime(300),
        distinctUntilChanged(),
        switchMap((coinId) => this.coinService.getDetails(coinId))
      )
      .subscribe((coin) => {
        this.isLoadingDetails = false;
        this.selectedCoin.set(coin);
      });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();
    this.filterSubject.next(filterValue);
  }

  getDetails(coinId: string): void {
    this.isLoadingDetails = true;
    this.selectedCoin.set(undefined);
    this.coinSelected$.next(coinId);
  }
}
