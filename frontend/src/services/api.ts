// Centralized HTTP client for FloraQuest REST API
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  private getToken(): string | null {
    try {
      return localStorage.getItem('flora_token');
    } catch {
      return null;
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // sends HTTP-only cookie
      });

      const data: ApiResponse<T> = await response.json().catch(() => ({
        success: response.ok,
        data: undefined,
        error: {
          code: `HTTP_${response.status}`,
          message: response.statusText || 'Network response error',
        },
      }));

      if (!response.ok && data.success !== false) {
        data.success = false;
        if (!data.error) {
          data.error = {
            code: `HTTP_${response.status}`,
            message: `Request failed with status ${response.status}`,
          };
        }
      }

      return data;
    } catch (err: any) {
      console.warn(`[ApiClient] Request to ${url} failed:`, err.message);
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to reach the server. Operating in offline/local cache mode.',
        },
      };
    }
  }

  // Health
  async getHealth() {
    return this.request<{ status: string; database: string }>('/health');
  }

  // Auth
  async register(body: { email: string; username: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async login(body: { identifier: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  // Plants
  async getPlants() {
    return this.request<{ plants: any[] }>('/plants');
  }

  async createPlant(plant: any) {
    return this.request<{ plant: any; user: any; levelUp: boolean }>('/plants', {
      method: 'POST',
      body: JSON.stringify(plant),
    });
  }

  async deletePlant(id: string) {
    return this.request(`/plants/${id}`, { method: 'DELETE' });
  }

  async logPlantCare(plantId: string, type: string, notes?: string) {
    return this.request<{ careLog: any; user: any; levelUp: boolean }>(`/plants/${plantId}/care`, {
      method: 'POST',
      body: JSON.stringify({ type, notes }),
    });
  }

  async addGrowthPhoto(plantId: string, photoUrl: string, stageLabel?: string, notes?: string) {
    return this.request<{ growthEntry: any; user: any; levelUp: boolean }>(`/plants/${plantId}/growth`, {
      method: 'POST',
      body: JSON.stringify({ photoUrl, stageLabel, notes }),
    });
  }

  // Discoveries & AI Service
  async identifyPlant(imageBase64: string, topK: number = 5, notes?: string) {
    return this.request<{
      aiResult: any;
      discovery: any;
      user: any;
      levelUp: boolean;
    }>('/discoveries/identify', {
      method: 'POST',
      body: JSON.stringify({ imageBase64, topK, notes }),
    });
  }

  async getDiscoveries() {
    return this.request<{ discoveries: any[] }>('/discoveries');
  }

  async saveDiscovery(discovery: any) {
    return this.request<{ discovery: any; user: any; levelUp: boolean }>('/discoveries', {
      method: 'POST',
      body: JSON.stringify(discovery),
    });
  }

  // Quests & Mindfulness
  async getQuests() {
    return this.request<{ quests: any[] }>('/quests');
  }

  async claimQuest(questId: string) {
    return this.request<{ questId: string; coinsAwarded: number; xpAwarded: number; user: any; levelUp: boolean }>(
      `/quests/${questId}/claim`,
      { method: 'POST' }
    );
  }

  async createObservation(observation: any) {
    return this.request<{ observation: any; user: any; levelUp: boolean }>('/observations', {
      method: 'POST',
      body: JSON.stringify(observation),
    });
  }

  // Shop
  async getShopCatalog() {
    return this.request<{ catalog: any[]; userBalance: any }>('/shop/items');
  }

  async buyShopItem(itemId: string) {
    return this.request<{ item: any; inventory: any; user: any }>('/shop/buy', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  }

  // Garden
  async getGardenLayout() {
    return this.request<{ layout: any[] }>('/garden/layout');
  }

  async placeGardenItem(itemId: string, gridX: number, gridY: number, rotation: number = 0) {
    return this.request<{ item: any }>('/garden/place', {
      method: 'POST',
      body: JSON.stringify({ itemId, gridX, gridY, rotation }),
    });
  }

  async moveGardenItem(instanceId: string, gridX: number, gridY: number) {
    return this.request(`/garden/items/${instanceId}`, {
      method: 'PUT',
      body: JSON.stringify({ gridX, gridY }),
    });
  }

  async rotateGardenItem(instanceId: string) {
    return this.request(`/garden/items/${instanceId}/rotate`, {
      method: 'PATCH',
    });
  }

  async removeGardenItem(instanceId: string) {
    return this.request(`/garden/items/${instanceId}`, {
      method: 'DELETE',
    });
  }

  // Profile & Data Management
  async getProfile() {
    return this.request<{ profile: any; stats: any; transactions: any[]; achievements: any[] }>('/data/profile');
  }

  async exportData() {
    return this.request('/data/export');
  }

  async importData(data: any) {
    return this.request('/data/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
