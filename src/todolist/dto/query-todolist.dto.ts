import { IsOptional, IsString, IsBooleanString, IsIn, IsDateString } from 'class-validator';

export class QueryTodoListDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() assignee?: string;
  @IsOptional() @IsBooleanString() status?: string;
  @IsOptional() @IsDateString() date?: string;
  @IsOptional() @IsDateString() datecomplete?: string;

  @IsOptional() @IsIn(['name', 'description', 'status', 'date', 'datecomplete', 'assignee'])
  sortBy?: string;

  @IsOptional() @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @IsOptional() @IsIn(['th', 'en'])
  language?: string;

  @IsOptional() limit?: number;
  @IsOptional() offset?: number;
}
