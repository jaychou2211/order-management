import { Body, Controller, Get, Param, Post, Put, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { OrderCommandService } from './service/command/order-command.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from './guards/auth.guard';
import { CommandGuard } from './guards/command.guard';
import { CommandAction, QueryAction } from './decorators/order-action.decorator';
import { OrderQueryService } from './service/query/order-query.service';
import { QueryGuard } from './guards/query.guard';
import { OrderCommand } from './service/command/order-command-list';
import { OrderQuery } from './service/query/order-query-list';
import { OrderInterceptor } from './interceptors/order.interceptor';
import { EventPattern, Payload } from '@nestjs/microservices';
import { CreateShipmentDtoList } from './dto/check-order.dto';

@Controller('orders')
@UseInterceptors(OrderInterceptor)
export class OrdersController {
  constructor(
    private readonly orderCommandService: OrderCommandService,
    private readonly orderQueryService: OrderQueryService
  ) { }

  @Get()
  @UseGuards(AuthGuard)
  healthCheck() {
    return 'ok~~';
  }

  @Get(':id')
  @QueryAction(OrderQuery.GET_ORDER)
  @UseGuards(AuthGuard, QueryGuard)
  getOrder(@Param('id') id: string) {
    return this.orderQueryService.getOrder(id);
  }

  @Get(':id/history')
  @QueryAction(OrderQuery.GET_ORDERS_HISTORY)
  @UseGuards(AuthGuard, QueryGuard)
  getOrdersHistory(@Param('id') id: string) {
    return this.orderQueryService.getOrdersHistory(id);
  }

  @Post()
  @CommandAction(OrderCommand.CREATE)
  @UseGuards(AuthGuard, CommandGuard)
  createOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.orderCommandService.create({
      ...createOrderDto,
      shipments: [],
      createdAt: new Date()
    });
  }

  @EventPattern('order.create')
  @CommandAction(OrderCommand.CREATE)
  @UseGuards(AuthGuard, CommandGuard)
  createOrderWithEvent(@Payload() data: CreateOrderDto) {
    return this.orderCommandService.create(({
      ...data,
      shipments: [],
      createdAt: new Date()
    }));
  }

  @Put(':id/check')
  @CommandAction(OrderCommand.CHECK)
  @UseGuards(AuthGuard, CommandGuard)
  checkOrder(
    @Param('id') id: string,
    @Body() CreateShipmentDtoList: CreateShipmentDtoList
  ) {
    return this.orderCommandService.check(id, CreateShipmentDtoList.shipmentDtoList);
  }

  @Put(':id/shipments/:shipmentId/ship')
  @CommandAction(OrderCommand.SHIP)
  @UseGuards(AuthGuard, CommandGuard)
  shipOrder(@Param('id') id: string, @Param('shipmentId') shipmentId: string) {
    return this.orderCommandService.ship(id, shipmentId);
  }

  @Put(':id/shipments/:shipmentId/deliver')
  @CommandAction(OrderCommand.DELIVER)
  @UseGuards(AuthGuard, CommandGuard)
  deliverOrder(@Param('id') id: string, @Param('shipmentId') shipmentId: string) {
    return this.orderCommandService.deliver(id, shipmentId);
  }

  @Put(':id/complete')
  @CommandAction(OrderCommand.COMPLETE)
  @UseGuards(AuthGuard, CommandGuard)
  completeOrder(@Param('id') id: string) {
    return this.orderCommandService.complete(id);
  }

  @Put(':id/cancel')
  @CommandAction(OrderCommand.CANCEL)
  @UseGuards(AuthGuard, CommandGuard)
  cancelOrder(@Param('id') id: string) {
    return this.orderCommandService.cancel(id);
  }

  @Put(':id/shipments/:shipmentId/pay')
  @CommandAction(OrderCommand.PAY)
  @UseGuards(AuthGuard, CommandGuard)
  payOrder(@Param('id') id: string, @Param('shipmentId') shipmentId: string) {
    // to-do 需要一點事前的加工
    // 假設繳費成功
    return this.orderCommandService.pay(id, shipmentId, true);
  }

}
