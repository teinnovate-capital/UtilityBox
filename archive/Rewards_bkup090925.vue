<template>
  <ion-page>
    <ion-content class="ion-padding custom-bg" fullscreen>
      <!-- Header with Logo and Profile -->
      <HeaderComponent />

      <!-- Page Title -->
      <div class="page-title">
        <h1>All offers</h1>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loader-container">
        <div class="loader-bars">
          <div class="bar1"></div>
          <div class="bar2"></div>
          <div class="bar3"></div>
          <div class="bar4"></div>
          <div class="bar5"></div>
          <div class="bar6"></div>
        </div>
        <p>Loading rewards...</p>
      </div>

      <div v-if="isLoading" class="loader-overlay">
        <div class="loader-container">
          <div class="loader-bars">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
            <div class="bar4"></div>
            <div class="bar5"></div>
            <div class="bar6"></div>
          </div>
          <p class="centered-element">Loading rewards...</p>
        </div>
      </div>

      <!-- Rewards List -->
      <div v-else class="rewards-container">
        <div v-for="reward in rewards" :key="reward.id" class="reward-card">
          <div class="reward-image-container">
            <img :src="reward.image" :alt="reward.caption" class="reward-image" />
            <div class="reward-badge" :class="reward.badgeClass">
              {{ reward.badge }}
            </div>
          </div>
          
          <div class="reward-content">
            <div class="reward-meta">
              <span class="claim-date">Claim by {{ reward.claimDate }}</span>
            </div>
            <h3 class="reward-title">{{ reward.caption }}</h3>
            <p class="reward-status" :class="{ 'all-gone': reward.status === 'All gone' }">
              {{ reward.status }}
            </p>
            
            <!-- Action Button (only show if callToActionLink exists) -->
            <ion-button 
              v-if="reward.callToActionLink" 
              class="claim-button" 
              @click="openRewardLink(reward)"
            >
              {{ reward.buttonText || 'Reveal offer' }}
            </ion-button>
          </div>

          <!-- Decorative Elements -->
          <div class="reward-decoration">
            <div class="star-decoration">
              ✨⭐💎✨⭐💎
            </div>
          </div>
        </div>
      </div>

    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonPopover,
  IonList,
  IonItem,
  IonLabel,
  toastController
} from '@ionic/vue';

import { personCircle, personOutline, logOutOutline } from 'ionicons/icons';
import { ref, onMounted } from 'vue';
import HeaderComponent from '../components/HeaderComponent.vue';

// Get user data from localStorage
const userId = localStorage.getItem('userId') || '';
const email = localStorage.getItem('email') || '';

// Reactive variables
const isLoading = ref(false);
const isProfilePopoverOpen = ref(false);
const rewards = ref([]);

// Sample data for testing (will be replaced with API call)
const sampleRewards = [
  {
    id: 1,
    image: 'https://picsum.photos/400/200?random=42',
    caption: 'One free Iced Coffee - subject to availability',
    claimDate: '21/09/2025, 23:59',
    status: 'Available',
    badge: 'FREE',
    badgeClass: 'free-badge',
    callToActionLink: 'https://example.com/greggs-offer',
    buttonText: 'Reveal offer'
  },
  {
    id: 2,
    image: 'https://picsum.photos/400/200?random=123',
    caption: '2 for 1 on annual tickets at Twycross Zoo - subject to availability',
    claimDate: '31/10/2025, 23:59',
    status: 'All gone',
    badge: '2 for 1',
    badgeClass: 'offer-badge',
    callToActionLink: null, // No link means no button will show
    buttonText: 'Claim offer'
  }
];

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

// Rewards methods
const loadRewards = async () => {
  isLoading.value = true;
  
  try {
    // TODO: Replace this with actual API call
    // const response = await axios.post('your-api-endpoint', { userId });
    // rewards.value = response.data;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    rewards.value = sampleRewards;
    
  } catch (error) {
    console.error('Error loading rewards:', error);
    const toast = await toastController.create({
      message: 'Failed to load rewards',
      duration: 2000,
      color: 'danger'
    });
    await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const openRewardLink = (reward) => {
  if (reward.callToActionLink) {
    // Add userId as a query parameter to the URL
    const url = new URL(reward.callToActionLink);
    url.searchParams.set('userid', userId);
    url.searchParams.set('email', email);
    
    // Open in new window/tab
    window.open(url.toString(), '_blank');
  }
};

// Lifecycle
onMounted(() => {
  loadRewards();
});
</script>

<style scoped>
.custom-bg {
  --background: linear-gradient(180deg, #7b2c7e 0%, #5a1a5d 100%);
  background-color: #4b1248;
  color: white;
}

/* Header styles (same as Home.vue) */
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: transparent;
}

.header-logo {
  height: 40px;
  width: auto;
  background: white;
  padding: 8px 12px;
  border-radius: 8px;
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

/* Page title */
.page-title {
  padding: 10px 20px 20px 20px;
}

.page-title h1 {
  color: white;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.loader-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.loader-container p {
  margin-top: 16px;
  color: #666;
}

/* Rewards container */
.rewards-container {
  padding: 0 20px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Reward card */
.reward-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.reward-image-container {
  position: relative;
  height: 120px;
  overflow: hidden;
}

.reward-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.reward-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.free-badge {
  background: #00d4aa;
  color: white;
}

.offer-badge {
  background: #007bff;
  color: white;
}

.reward-content {
  padding: 12px 16px;
}

.reward-meta {
  margin-bottom: 8px;
}

.claim-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.reward-title {
  color: white;
  font-size: 14px; /* Reduced from 16px */
  font-weight: 500;
  margin: 6px 0 8px 0; /* Reduced margins */
  line-height: 1.3; /* Tighter line height */
}

.reward-status {
  font-size: 13px; /* Reduced from 14px */
  margin-bottom: 12px; /* Reduced from 16px */
  color: rgba(255, 255, 255, 0.8);
}

.reward-status.all-gone {
  color: #ff6b6b;
  font-weight: 500;
}

.claim-button {
  --background: #6c5ce7;
  --color: white;
  --border-radius: 20px; /* Slightly smaller radius */
  --padding-top: 8px; /* Reduced from 12px */
  --padding-bottom: 8px;
  --padding-start: 20px; /* Reduced from 24px */
  --padding-end: 20px;
  font-weight: 600;
  font-size: 13px; /* Reduced from 14px */
  margin: 0;
}

.claim-button:hover {
  --background: #5a4fcf;
}

/* Decorative elements */
.reward-decoration {
  position: absolute;
  bottom: 16px;
  right: 16px;
  pointer-events: none;
}

.star-decoration {
  font-size: 16px;
  opacity: 0.6;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.3));
}
</style>