<template>
  <!-- Header with Logo and Profile -->
  <div class="header-bar">
    <div class="logo-container">
      <img src="/src/assets/utilityboxlogo.png" alt="UtilityBox Logo" class="header-logo" />
    </div>
    <ion-button fill="clear" class="profile-button" @click="openProfilePopover" id="profile-trigger">
      <ion-icon :icon="personCircle" slot="icon-only" />
    </ion-button>
  </div>

  <!-- Profile Popover -->
  <ion-popover :is-open="isProfilePopoverOpen" trigger="profile-trigger" @didDismiss="isProfilePopoverOpen = false">
    <ion-content>
      <ion-list>
        <ion-item button @click="editProfile" v-if="showEditProfile">
          <ion-icon :icon="personOutline" slot="start" />
          <ion-label>Edit Profile</ion-label>
        </ion-item>
        <ion-item button @click="logout">
          <ion-icon :icon="logOutOutline" slot="start" />
          <ion-label>Logout</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
  </ion-popover>

</template>

<script setup>
import {
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  IonContent
} from '@ionic/vue';

import { personCircle, personOutline, logOutOutline } from 'ionicons/icons';
import { ref } from 'vue';

// Props
const props = defineProps({
  showEditProfile: {
    type: Boolean,
    default: true
  }
});

// Reactive variables
const isProfilePopoverOpen = ref(false);

// Profile methods
const openProfilePopover = () => {
  isProfilePopoverOpen.value = true;
};

const editProfile = () => {
  isProfilePopoverOpen.value = false;
  console.log('Edit profile clicked');
};

const logout = () => {
  isProfilePopoverOpen.value = false;
  localStorage.removeItem('userId');
  localStorage.removeItem('email');
  localStorage.removeItem('PKEY');
  localStorage.removeItem('PKEY_TEST');
  localStorage.removeItem('PPID');
  localStorage.removeItem('TXID');
  window.location.href = '/login';
};
</script>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: transparent;
}

.header-logo {
  height: 60px;
  width: auto;
}

.profile-button {
  --color: white;
  --background: rgba(255, 255, 255, 0.2);
  --border-radius: 50%;
  width: 44px;
  height: 44px;
}

.profile-button ion-icon {
  font-size: 28px;
}

ion-popover ion-item {
  --detail-icon-opacity: 0;
}

/* Add to existing styles */
ion-popover {
  --width: 200px;
  --min-height: auto;
}

ion-popover::part(arrow) {
  display: block;
}

ion-popover::part(content) {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}
</style>