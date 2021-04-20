import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject } from '@nestjs/common';
import {
  IStockService,
  IStockServiceProvider,
} from '../primary-ports/stock.service.interface';
import { Socket } from 'socket.io';
import { StockModel } from '../models/stock.model';
import { StockDto } from '../dtos/stock.dto';
import { emit } from 'cluster';

@WebSocketGateway()
export class StockGateway {
  constructor(
    @Inject(IStockServiceProvider) private stockService: IStockService,
  ) {}
  @WebSocketServer() server;

  @SubscribeMessage('stock')
  async handleStockEvent(
    @MessageBody() stockModel: StockModel,
    @ConnectedSocket() stock: Socket,
  ): Promise<void> {
    try {
      const stockClient = await this.stockService.newStock(
        stock.id,
        stockModel,
      );
      const stockClients = await this.stockService.getStocks();
      const stockDto: StockDto = {
        stocks: stockClients,
        stock: stockClient,
      };
      stock.emit('stockDto', stockDto);
      this.server.emit('stocks', stockClients);
    } catch (e) {}
  }

  @SubscribeMessage('updateStock')
  async handleUpdateStockEvent(
    @MessageBody() stockModel: StockModel,
    @ConnectedSocket() stock: Socket,
  ): Promise<void> {
    try {
      const stockUpdate = await this.stockService.updateStocks(
        stockModel.id,
        stockModel,
      );
      const stocks = await this.stockService.getStocks();
      const stockDTO: StockDto = {
        stocks: stocks,
        stock: stockUpdate,
      };
      stock.emit('StockDTO', stockDTO);
      this.server.emit('stocks', stocks);
    } catch (e) {
      console.log('smth');
    }
  }

  @SubscribeMessage('welcomeStock')
  async handleWelcomeStockEvent(
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const stockClients = await this.stockService.getStocks();

    socket.emit('stocks', stockClients);
  }
}
