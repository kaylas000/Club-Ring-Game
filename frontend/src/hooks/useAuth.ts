import { useEffect, useState } from 'react';
import { useGameStore } from '@store/gameStore';
import { authAPI } from '@services/api';
import { telegramService, TelegramUser } from '@services/telegram';

export const useAuth = () => {
  const { setPlayer, setError } = useGameStore();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    authenticate();
  }, []);

  const authenticate = async () => {
    try {
      // Initialize Telegram
      const isTelegramAvailable = telegramService.init();
      if (!isTelegramAvailable) {
        console.warn('Telegram WebApp not available - using demo mode');
        setIsLoading(false);
        return;
      }

      // Get user info
      const telegramUser = telegramService.getUser();
      if (!telegramUser) {
        console.warn('No Telegram user found');
        setIsLoading(false);
        return;
      }

      setUser(telegramUser);

      // Authenticate with backend
      const initData = telegramService.getInitData();
      if (!initData) {
        console.warn('No initData available');
        setIsLoading(false);
        return;
      }

      const response = await authAPI.telegramAuth(initData);
      const { token, player } = response.data;

      // Save token
      localStorage.setItem('authToken', token);

      // Set player in store
      setPlayer(player);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      console.error('Auth error:', message);
      setError(message);
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    isLoading,
    user,
    authenticate,
    logout,
  };
};
