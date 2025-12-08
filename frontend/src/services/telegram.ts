export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date: number;
    hash: string;
  };
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  expand: () => void;
  ready: () => void;
  close: () => void;
}

class TelegramService {
  private webApp: any = null;

  init(): boolean {
    if (typeof window === 'undefined') return false;

    this.webApp = (window as any).Telegram?.WebApp;
    if (!this.webApp) {
      console.warn('Telegram WebApp not available');
      return false;
    }

    this.webApp.ready();
    this.webApp.expand();
    
    console.log('✅ Telegram WebApp initialized');
    return true;
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }

  getUser(): TelegramUser | undefined {
    return this.webApp?.initDataUnsafe?.user;
  }

  getColorScheme(): 'light' | 'dark' {
    return this.webApp?.colorScheme || 'light';
  }

  isExpanded(): boolean {
    return this.webApp?.isExpanded || false;
  }

  expand(): void {
    this.webApp?.expand();
  }

  close(): void {
    this.webApp?.close();
  }

  showMainButton(text: string, onClick: () => void): void {
    if (!this.webApp?.MainButton) return;
    this.webApp.MainButton.text = text;
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(onClick);
  }

  hideMainButton(): void {
    this.webApp?.MainButton?.hide();
  }

  showBackButton(onClick: () => void): void {
    if (!this.webApp?.BackButton) return;
    this.webApp.BackButton.show();
    this.webApp.BackButton.onClick(onClick);
  }

  hideBackButton(): void {
    this.webApp?.BackButton?.hide();
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    this.webApp?.HapticFeedback?.impactOccurred(type);
  }

  notificationFeedback(type: 'success' | 'error' | 'warning' = 'success'): void {
    this.webApp?.HapticFeedback?.notificationOccurred(type);
  }
}

export const telegramService = new TelegramService();
