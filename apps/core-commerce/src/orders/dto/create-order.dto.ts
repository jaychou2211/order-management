import { v4 as uuidv4 } from 'uuid';
import { IsNumber, IsPositive, Min, IsString, ValidateNested, IsArray, IsEnum, IsDateString, IsObject, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { PaymentStatus, ShipmentStatus } from '../domain/shipment';
import { OrderStatus } from '../domain/order';

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

export class CreateShipmentDto {
  @Transform(({ value }) => value || uuidv4())
  id: string;

  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}

export class CreateOrderDto {
  @Transform(({ value }) => value || uuidv4())
  id: string;

  @IsString()
  customerId: string;

  @IsString()
  address: string;

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
  @Type(() => CreateShipmentDto)
  shipments: CreateShipmentDto[];
}
