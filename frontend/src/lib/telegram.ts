type BackButtonApi = {
  show: () => void;
  hide: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

type MainButtonApi = {
  text: string;
  show: () => void;
  hide: () => void;
  enable: () => void;
  disable: () => void;
  onClick: (callback: () => void) => void;
  offClick: (callback: () => void) => void;
};

type TelegramWebApp = {
  ready: () => void;
  close: () => void;
  expand: () => void;
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  setBottomBarColor?: (color: string) => void;
  onEvent?: (event: string, callback: () => void) => void;
  offEvent?: (event: string, callback: () => void) => void;
  BackButton?: BackButtonApi;
  backButton?: BackButtonApi;
  MainButton: MainButtonApi;
  HapticFeedback?: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  themeParams: Record<string, string | undefined>;
  colorScheme: 'light' | 'dark';
  platform: string;
  version: string;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
  };
};

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp;
    };
  }
}

export const tg = window.Telegram?.WebApp;

const getBackButton = () => tg?.BackButton || tg?.backButton;

export const initTelegram = () => {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      tg.setHeaderColor?.('#ffffff');
      tg.setBackgroundColor?.('#f5f5f1');
      tg.setBottomBarColor?.('#ffffff');
    } catch {
      // Telegram WebApp methods are optional across clients; the app still works without them.
    }
    return tg;
  }
  return null;
};

export const hapticImpact = (style: 'light' | 'medium' | 'heavy' = 'light') => {
  try {
    tg?.HapticFeedback?.impactOccurred(style);
  } catch {
    // Haptics are best-effort only.
  }
};

export const hapticNotification = (type: 'error' | 'success' | 'warning' = 'success') => {
  try {
    tg?.HapticFeedback?.notificationOccurred(type);
  } catch {
    // Haptics are best-effort only.
  }
};

export const hapticSelection = () => {
  try {
    tg?.HapticFeedback?.selectionChanged();
  } catch {
    // Haptics are best-effort only.
  }
};

export const setBackButton = (callback: () => void) => {
  const backButton = getBackButton();
  if (backButton) {
    try {
      backButton.show();
      backButton.onClick(callback);
    } catch {
      // Back button is optional outside Telegram.
    }
  }
};

export const hideBackButton = () => {
  try {
    getBackButton()?.hide();
  } catch {
    // Back button is optional outside Telegram.
  }
};

export const closeApp = () => {
  try {
    tg?.close();
  } catch {
    // No-op in browser fallback.
  }
};

export const getTelegramUser = () => tg?.initDataUnsafe?.user;
