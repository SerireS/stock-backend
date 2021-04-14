import { StockModel } from '../models/stock.model';

export interface StockDto {
  stocks: StockModel[];
  stock: StockModel;
}
