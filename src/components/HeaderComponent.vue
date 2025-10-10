<template>
  <div class="header-bar">
    <div class="logo-container">
      <img
        src="/src/assets/utilityboxlogo.png"
        alt="UtilityBox Logo"
        class="header-logo"
      />
    </div>

    <!-- profile icon manually triggers popover -->
    <ion-button fill="clear" class="profile-button" @click="presentPopover($event)">
      <ion-icon :icon="personCircle" slot="icon-only" />
    </ion-button>

    <!-- programmatic popover (hidden until opened) -->
    <ion-popover
      ref="popoverRef"
      :is-open="isPopoverOpen"
      :event="popoverEvent"
      @didDismiss="isPopoverOpen = false"
    >
      <ion-content>
        <ion-list>
          <ion-item v-if="showEditProfile" button @click="editProfile">
            <ion-icon :icon="personOutline" slot="start" />
            <ion-label>Edit Profile</ion-label>
          </ion-item>
          <ion-item button @click="handleLogout">
            <ion-icon :icon="logOutOutline" slot="start" />
            <ion-label>Logout</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-popover>
  </div>
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
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';

// Props
const props = defineProps({
  showEditProfile: {
    type: Boolean,
    default: true
  }
});

// router + store
const router = useRouter();
const userStore = useUserStore();

// state
const isPopoverOpen = ref(false);
const popoverRef = ref(null);
const popoverEvent = ref(null);

// open popover programmatically
const presentPopover = (event) => {
  popoverEvent.value = event;
  isPopoverOpen.value = true;
};

// dismiss popover manually if needed
const dismissPopover = async () => {
  if (popoverRef.value) {
    await popoverRef.value.$el.dismiss();
  }
  isPopoverOpen.value = false;
};

const editProfile = async () => {
  await dismissPopover();
  router.push('/profile/edit');
};

const handleLogout = async () => {
  await dismissPopover();

  userStore.clearUser();
  localStorage.clear();
  ['PKEY', 'PKEY_TEST', 'PPID', 'TXID'].forEach((k) => localStorage.removeItem(k));

  setTimeout(() => router.push('/login'), 150);
};
</script>

<style scoped>
.header-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 2000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #752978;
  color: white;
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

ion-popover {
  --width: 200px;
  --min-height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

ion-popover::part(content) {
  animation: fadeSlideDown 0.25s ease both;
}

@keyframes fadeSlideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
