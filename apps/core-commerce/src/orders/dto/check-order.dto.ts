import { v4 as uuidv4 } from 'uuid';
import { Transform, Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { PaymentStatus, ShipmentStatus } from '../domain/shipment';

export class CreateShipmentDto {
  @Transform(({ value }) => value || uuidv4())
  id: string;

  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @IsArray()
  @ArrayNotEmpty({ message: 'Shipment must contain at least one order item.' })
  @IsUUID('4', { each: true })
  orderItemIdList: string[];
}

export class CreateShipmentDtoList {
  @IsArray()
  @ArrayNotEmpty({ message: 'An order must have at least one shipment' })
  @ValidateNested({ each: true })
  @Type(() => CreateShipmentDto)
  shipmentDtoList: CreateShipmentDto[];
}
