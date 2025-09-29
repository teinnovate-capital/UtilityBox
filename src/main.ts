import { createApp } from 'vue'
import App from './App.vue';
import { App as CapacitorApp } from '@capacitor/app';
import router from './router';

import { IonicVue } from '@ionic/vue';

/* Core CSS required for Ionic components to work properly */
import '@ionic/vue/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/vue/css/normalize.css';
import '@ionic/vue/css/structure.css';
import '@ionic/vue/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/vue/css/padding.css';
import '@ionic/vue/css/float-elements.css';
import '@ionic/vue/css/text-alignment.css';
import '@ionic/vue/css/text-transformation.css';
import '@ionic/vue/css/flex-utils.css';
import '@ionic/vue/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
import '@ionic/vue/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

// Optional recommended Ionic styling
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

import './assets/my-loaders.css'
import { createPinia } from 'pinia'
CapacitorApp.addListener('appUrlOpen', (event) => {
  if (!event || !event.url) return;

  const url = new URL(event.url);
  if (url.protocol === 'quidlyapp:' && url.hostname === 'quidlypay') {
    console.log('[Deeplink received]', url.toString());

    // 👉 parse your query params (status, approved, tx_ref, etc.)
    const params = Object.fromEntries(url.searchParams.entries());

    // Now notify your widget (next step below)
    window.postMessage({ type: 'deeplink_complete', ...params }, '*');
  }
});


const app = createApp(App)
  .use(IonicVue)
  .use(router)
  .use(createPinia());

router.isReady().then(() => {
  app.mount('#app');
});
