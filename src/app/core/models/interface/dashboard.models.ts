
export interface StatHighlight {
  description: string;
  value: number;
}

export interface ColumnDefinition {
  header: string;
  field: string;
  width?: string;
  sortable?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

