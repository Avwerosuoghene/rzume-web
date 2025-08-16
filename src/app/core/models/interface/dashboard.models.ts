
export interface StatHighlight {
  description: string;
  value: number;
}

export interface ColumnDefinition {
  header: string;
  field: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface JobApplication {
  company: string;
  job_role: string;
  cv: string;
  status: string;
  date: string;
  selected?: boolean; 
}
