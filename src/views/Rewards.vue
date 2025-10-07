<template>
  <ion-page>
    <ion-content class="ion-padding custom-bg" fullscreen>
      <!-- Header with Logo and Profile -->
      <HeaderComponent />
      <div class="page-content">
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

      <!-- Rewards List -->
      <div v-else class="rewards-container">
        <!-- Static Cashback Card -->
        <div class="reward-card">
          <div class="reward-image-container">
            <img src="/src/assets/cash-back-02.jpeg" alt="Cash Back" class="reward-image" />
            <div class="reward-badge free-badge">CASH BACK</div>
          </div>
          <div class="reward-content">
            <h3 class="reward-title">Cash Back on All Purchases</h3>
            <p class="reward-status">Always available</p>
          </div>
          <div class="reward-decoration">
            <div class="star-decoration">✨⭐💎✨⭐💎</div>
          </div>
        </div>

        <!-- Dynamic Rewards from API -->
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

            <ion-button
              v-if="reward.callToActionLink"
              class="claim-button"
              @click="openRewardLink(reward)"
            >
              {{ reward.buttonText || 'Reveal offer' }}
            </ion-button>
          </div>

          <div class="reward-decoration">
            <div class="star-decoration">✨⭐💎✨⭐💎</div>
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
  toastController
} from '@ionic/vue';
import { ref, onMounted } from 'vue';
import HeaderComponent from '../components/HeaderComponent.vue';

const userId = localStorage.getItem('userId') || '';
const email = localStorage.getItem('email') || '';

const isLoading = ref(false);
const rewards = ref([]);

const loadRewards = async () => {
  isLoading.value = true;
  try {
    const response = await fetch(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/RewardsLists',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userid: userId, email })
      }
    );
    const result = await response.json();
    console.log('Rewards API response:', result);

    if (Array.isArray(result) && result.length > 0) {
      rewards.value = result.map((r, idx) => ({
        id: r.id || idx,
        image: r.image || '/src/assets/placeholder.png',
        caption: r.caption || 'Reward',
        claimDate: r.claimDate || '',
        status: r.status || 'Available',
        badge: r.badge || 'OFFER',
        badgeClass: r.badgeClass || 'offer-badge',
        callToActionLink: r.callToActionLink || null,
        buttonText: r.buttonText || 'Reveal offer'
      }));
    } else {
      rewards.value = [];
    }
  } catch (error) {
    console.error('Error loading rewards:', error);
    rewards.value = [];
    // const toast = await toastController.create({
    //   message: 'Failed to load rewards',
    //   duration: 2000,
    //   color: 'danger'
    // });
    // await toast.present();
  } finally {
    isLoading.value = false;
  }
};

const openRewardLink = (reward) => {
  if (reward.callToActionLink) {
    const url = new URL(reward.callToActionLink);
    url.searchParams.set('userid', userId);
    url.searchParams.set('email', email);
    window.open(url.toString(), '_blank');
  }
};

onMounted(() => {
  loadRewards();
});
</script>


<style scoped>
.page-content {
  padding-top: 90px;
}
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