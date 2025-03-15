export interface CoinDetails {
  id: string;
  symbol: string;
  name: string;
  categories: string[];
  links: { homepage: string[] };
  image: { small: string };
  genesis_date: string;
  market_data: { current_price: { eur: number } };
}
