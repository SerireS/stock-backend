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

  @SubscribeMessage('welcomeStock')
  async handleWelcomeStockEvent(
    @ConnectedSocket() socket: Socket,
  ): Promise<void> {
    const stockClients = await this.stockService.getStocks();

    socket.emit('stocks', stockClients);
  }
}
