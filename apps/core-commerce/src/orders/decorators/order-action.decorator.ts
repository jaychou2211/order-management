import { SetMetadata } from '@nestjs/common';
import { OrderCommand } from '../service/command/order-command-list';
import { OrderQuery } from '../service/query/order-query-list';

export const CommandAction = (
  actionName: OrderCommand
) => SetMetadata('COMMAND', actionName);

export const QueryAction = (
  actionName: OrderQuery
) => SetMetadata('QUERY', actionName);