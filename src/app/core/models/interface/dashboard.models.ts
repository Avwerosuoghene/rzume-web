
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

export interface EmptyStateConfig {
  title: string;
  message: string;
  icon: string;
  showAction?: boolean;
  actionText?: string;
}

export interface SideBarElement {
  name: string;
  icon: string;
  route: string;
}



