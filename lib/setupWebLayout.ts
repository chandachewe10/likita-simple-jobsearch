import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Ensures html/body/#root fill the viewport so navigators use full height on web. */
export function useWebLayout() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const id = 'likita-web-root-styles';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      html, body, #root {
        height: 100%;
        width: 100%;
        max-width: 100%;
        margin: 0;
        padding: 0;
      }
      #root {
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
      #root > * {
        width: 100%;
        max-width: 100%;
      }
      input, textarea {
        font-size: 17px !important;
      }
    `;
    document.head.appendChild(style);
  }, []);
}
