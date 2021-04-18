import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { IStockService } from '../../primary-ports/stock.service.interface';
import { StockModel } from '../../models/stock.model';
import { Stock } from '../../infrastructure/stock';
import { Repository } from 'typeorm';

@Injectable()
export class StockService implements IStockService {
  allStocks: StockModel[] = [];

  constructor(
    @InjectRepository(Stock)
    private stockRepository: Repository<Stock>,
  ) {}

  async delete(id: string): Promise<void> {
    await this.stockRepository.delete({ id: id });
    this.allStocks = this.allStocks.filter((s) => s.id !== id);
  }

  async getStocks(): Promise<StockModel[]> {
    const stocks = await this.stockRepository.find();
    const stockEntities: Stock[] = JSON.parse(JSON.stringify(stocks));
    return stockEntities;
  }

  async getStock(id: string): Promise<StockModel> {
    const stockDb = await this.stockRepository.findOne({ id: id });
    const stockModel: StockModel = {
      id: stockDb.id,
      currentValue: stockDb.currentValue,
      initValue: stockDb.initValue,
      description: stockDb.description,
      stockName: stockDb.stockName,
    };
    return stockModel;
  }

  async newStock(id: string, stockModel: StockModel): Promise<StockModel> {
    const stockDb = await this.stockRepository.findOne({
      stockName: stockModel.stockName,
    });
    if (!stockDb) {
      let stock = this.stockRepository.create();
      stock.id = id;
      stock.stockName = stockModel.stockName;
      stock.initValue = stockModel.initValue;
      stock.currentValue = stockModel.currentValue;
      stock.description = stockModel.description;
      stock = await this.stockRepository.save(stock);
      return {
        id: '' + stockDb.id,
        stockName: stockDb.stockName,
        initValue: stockDb.initValue,
        currentValue: stockDb.currentValue,
        description: stockDb.description,
      };
    }
    if (stockDb.id === id) {
      return {
        id: stockDb.id,
        stockName: stockDb.stockName,
        initValue: stockDb.initValue,
        currentValue: stockDb.currentValue,
        description: stockDb.description,
      };
    } else {
      throw new Error('Stock Already existo');
    }
  }

  async updateStocks(id: string): Promise<Stock> {
    return Promise.resolve(undefined);
  }
}
