import axios from 'axios';
import type { ApiResponse } from '@/types';

class ApiServiceClass {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    // Setup axios interceptors
    axios.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      return config;
    });

    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized
          console.error('Unauthorized - redirecting to login');
        }
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string): void {
    this.token = token;
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.get<ApiResponse<T>>
        (`${this.baseUrl}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`GET ${endpoint} failed:`, error);
      throw error;
    }
  }

  async post<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await axios.post<ApiResponse<T>>
        (`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`POST ${endpoint} failed:`, error);
      throw error;
    }
  }

  async put<T = any>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    try {
      const response = await axios.put<ApiResponse<T>>
        (`${this.baseUrl}${endpoint}`, data);
      return response.data;
    } catch (error) {
      console.error(`PUT ${endpoint} failed:`, error);
      throw error;
    }
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await axios.delete<ApiResponse<T>>
        (`${this.baseUrl}${endpoint}`);
      return response.data;
    } catch (error) {
      console.error(`DELETE ${endpoint} failed:`, error);
      throw error;
    }
  }

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch (error) {
      return false;
    }
  }
}

export const ApiService = new ApiServiceClass();
