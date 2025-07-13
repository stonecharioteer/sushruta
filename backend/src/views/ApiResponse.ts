export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ResponseFormatter {
  static success<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number,
    message?: string
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  static created<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Resource created successfully',
      timestamp: new Date().toISOString()
    };
  }

  static updated<T>(data: T, message?: string): ApiResponse<T> {
    return {
      success: true,
      data,
      message: message || 'Resource updated successfully',
      timestamp: new Date().toISOString()
    };
  }

  static deleted(message?: string): ApiResponse {
    return {
      success: true,
      message: message || 'Resource deleted successfully',
      timestamp: new Date().toISOString()
    };
  }
}