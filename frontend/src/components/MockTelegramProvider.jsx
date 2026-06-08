/**
 * MockTelegramProvider
 *
 * Telegram SDK бросает ошибки если запустить вне Telegram.
 * Этот компонент подделывает window.Telegram.WebApp для локальной разработки.
 * В продакшене (внутри Telegram) он ничего не делает.
 */
import { useEffect } from 'react'

const isTelegram = () =>
  typeof window !== 'undefined' &&
  window.Telegram?.WebApp?.initData !== undefined &&
  window.Telegram.WebApp.initData !== ''

export function MockTelegramProvider({ children }) {
  useEffect(() => {
    if (isTelegram()) return // уже в Telegram, моки не нужны

    // Мок для локальной разработки
    if (!window.Telegram) {
      window.Telegram = {
        WebApp: {
          initData: 'mock',
          initDataUnsafe: {
            user: {
              id: 123456789,
              first_name: 'Dev',
              username: 'developer',
              language_code: 'ru',
            },
            auth_date: Math.floor(Date.now() / 1000),
            hash: 'mockhash',
          },
          version: '7.0',
          platform: 'web',
          colorScheme: 'light',
          themeParams: {
            bg_color: '#ffffff',
            text_color: '#000000',
            hint_color: '#999999',
            link_color: '#2481cc',
            button_color: '#2481cc',
            button_text_color: '#ffffff',
            secondary_bg_color: '#f1f1f1',
          },
          isExpanded: true,
          viewportHeight: window.innerHeight,
          viewportStableHeight: window.innerHeight,
          MainButton: {
            text: '',
            color: '#2481cc',
            textColor: '#ffffff',
            isVisible: false,
            isActive: true,
            isProgressVisible: false,
            setText: (t) => { window.Telegram.WebApp.MainButton.text = t },
            onClick: (fn) => { window.Telegram.WebApp.MainButton._cb = fn },
            offClick: () => { window.Telegram.WebApp.MainButton._cb = null },
            show: () => { window.Telegram.WebApp.MainButton.isVisible = true },
            hide: () => { window.Telegram.WebApp.MainButton.isVisible = false },
            enable: () => {},
            disable: () => {},
            showProgress: () => {},
            hideProgress: () => {},
          },
          BackButton: {
            isVisible: false,
            onClick: (fn) => { window.Telegram.WebApp.BackButton._cb = fn },
            offClick: () => { window.Telegram.WebApp.BackButton._cb = null },
            show: () => { window.Telegram.WebApp.BackButton.isVisible = true },
            hide: () => { window.Telegram.WebApp.BackButton.isVisible = false },
          },
          HapticFeedback: {
            impactOccurred: () => {},
            notificationOccurred: () => {},
            selectionChanged: () => {},
          },
          ready: () => {},
          expand: () => {},
          close: () => {},
          showAlert: (msg) => alert(msg),
          showConfirm: (msg, cb) => cb(confirm(msg)),
          showPopup: ({ message }) => alert(message),
          openLink: (url) => window.open(url, '_blank'),
          openTelegramLink: (url) => window.open(url, '_blank'),
          setHeaderColor: () => {},
          setBackgroundColor: () => {},
          enableClosingConfirmation: () => {},
          disableClosingConfirmation: () => {},
          onEvent: () => {},
          offEvent: () => {},
          sendData: () => {},
          isVersionAtLeast: () => true,
        },
      }
      console.info('[SynthMarket] Mock Telegram.WebApp активен')
    }
  }, [])

  return children
}
