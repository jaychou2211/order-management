import { v4 as uuidv4 } from 'uuid';
import { IsNumber, IsPositive, Min, IsString, IsEnum, IsDateString, IsObject, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { OrderChannel, OrderStatus } from '../domain/order';

export class CreateOrderItemDto {
  @Transform(({ value }) => value || uuidv4())
  id: string;

  @IsString()
  productId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsNumber()
  @IsPositive()
  totalPrice: number;
}

export class CreateOrderDto {
  @Transform(({ value }) => value || uuidv4())
  id: string;

  @IsString()
  customerId: string;

  @IsObject()
  address: object;

  @IsEnum(OrderChannel)
  channel: OrderChannel;

  @IsString()
  @IsOptional()
  channelOrderId: string;

  @IsDateString()
  createdAt: string;

  @IsEnum(OrderStatus)
  status: OrderStatus;

  @IsObject()
  paymentInfo: object;

  @IsString()
  paymentMethod: string;

  @IsString()
  note: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
