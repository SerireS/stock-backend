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
      this.server.emit('stock', stockClient);
      this.server.emit('stocks', stockClients);
    } catch (e) {
      stock._error(e.message);
    }
  }
}
