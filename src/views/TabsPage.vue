<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="usage" href="/tabs/usage">
          <ion-icon :icon="flash" />
          <ion-label>Usage</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="rewards" href="/tabs/rewards">
          <ion-icon :icon="gift" />
          <ion-label>Rewards</ion-label>
        </ion-tab-button>
        
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>


<!-- <template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">

        <ion-tab-button tab="home" @click="$router.push('/tabs/home')">
          <ion-icon :icon="home" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="usage" @click="$router.push('/tabs/usage')">
          <ion-icon :icon="flash" />
          <ion-label>Usage</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="rewards" @click="$router.push('/tabs/rewards')">
          <ion-icon :icon="gift" />
          <ion-label>Rewards</ion-label>
        </ion-tab-button>

      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template> -->



<script setup lang="ts">
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { home, flash, gift } from 'ionicons/icons';

</script>

<style scoped>
/* 🔧 Change tab bar background color */
ion-tab-bar {
  --background: #5a1a5d; /* Deep purple (or your brand color) */
  --color: #ccc;          /* Inactive icon color */
  --color-selected: orange; /* ✅ Active icon color */
  border-top: 1px solid #3a0036; /* optional: a soft top border */
}
</style>
