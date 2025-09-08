<template>
  <ion-page>
    <ion-content class="ion-padding custom-bg" fullscreen>
      <ion-toolbar color="#4b1248"></ion-toolbar>

      <!-- 🟪 First Card: Toggle + Inputs -->
      <ion-card class="first-card">
        <ion-card-content class="first-card-content">
          <div class="toggle-container">
            <span :class="{ activeToggle: !isPrepaid }">Postpaid</span>
            <ion-toggle v-model="isPrepaid" class="custom-toggle" />
            <span :class="{ activeToggle: isPrepaid }">Prepaid</span>
          </div>

          <ion-input
            v-model="meterNo"
            label="Meter No."
            label-placement="floating"
            placeholder="Enter Meter Number"
            fill="outline"
            class="form-input"
          ></ion-input>

          <ion-select
            v-model="selectedEdc"
            interface="popover"
            placeholder="Select EDC"
            class="form-input"
          >
            <ion-select-option value="abujaedc">Abuja</ion-select-option>
            <ion-select-option value="ikejaedc">Lagos-Ikeja</ion-select-option>
            <ion-select-option value="ekoedc">Lagos-Eko</ion-select-option>
            <ion-select-option value="enuguedc">Enugu</ion-select-option>
            <ion-select-option value="ibadanedc">Ibadan</ion-select-option>
            <ion-select-option value="phedc">Port Harcourt</ion-select-option>
          </ion-select>

          <ion-button expand="block" class="validate-btn" @click="validateMeter">
            Validate & Buy
          </ion-button>
        </ion-card-content>
      </ion-card>

      <!-- 🧃 Scrollable Card Carousel -->
      <div class="carousel-container" @scroll="handleScroll" ref="carouselRef">
        <!-- Card 1: Loyalty Points -->
        <ion-card class="carousel-card">
          <ion-card-content class="points-card-content">
            <div class="points-label">Loyalty <br>Points</div>
            <div class="points-value">{{ loyaltypoints_sum }}</div>
            <ion-button shape="round" size="small" class="redeem-btn">
              REDEEM
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- Cards 2–4 -->
        <ion-card class="carousel-card" v-for="(card, index) in scrollCards" :key="index">
          <ion-card-content class="card-content">
            {{ card }}
          </ion-card-content>
        </ion-card>
      </div>

      <!-- Pagination Dots -->
      <div class="dots">
        <span
          v-for="(_, index) in [0, ...scrollCards.map((_, i) => i + 1)]"
          :key="index"
          :class="{ active: index === currentIndex }"
        ></span>
      </div>

      <!-- 📰 Offers Section -->
      <div class="offers-section">
        <h2>Offers</h2>
        <img src="/assets/offers-banner.png" class="offers-img" alt="Offers Banner" />
      </div>

      <!-- 💬 Modal -->
      <!-- <ion-modal
      :is-open="isModalOpen"
      @didDismiss="isModalOpen = false"
      :presenting-element="presentingEl"
      showBackdrop
      swipeToClose
      class="fullscreen-modal"
      > -->

      <ion-modal
        :is-open="isModalOpen"
        :presenting-element="presentingEl"
        :backdrop-dismiss="false"
        class="fullscreen-modal"
      >


        <div class="modal-header">
          <h2>Quick Buy</h2>
          <ion-button fill="clear" size="small" @click="isModalOpen = false">
            <ion-icon :icon="closeCircle" />
          </ion-button>
        </div>

        <ion-content class="modal-content">
          <div v-if="isLoading" class="loader-container">
            <img src="/assets/Loading animation blue.gif" alt="Loading..." />
          </div>
          <div v-else class="validated-details">
            <h2 class="validated-title">Validated</h2>
            <p><strong class="subheading">Meter Customer Name</strong> <br> {{ meterDetails.responsename }}</p>
            <p><strong>Meter Number:</strong> <br> {{ meterDetails.accountno }}</p>
            <p><strong>Address:</strong> <br> {{ meterDetails.responseaddr }}</p>
            <br>
            <p class="centered-element">{{ email }}</p>
            <br>
            <p class="centered-element">Minimum Amount: ₦{{ (meterDetails.minimum_amount).toFixed(2) }}</p>

            <!-- New: Amount Input Field -->
              <ion-input
                v-model="enteredAmount"
                label=" Enter Amount"
                label-placement="floating"
                placeholder="e.g. 5000"
                type="number"
                class="centered-input"
              ></ion-input>

              <p class="centered-element"><em>₦100 - convenience fee will be added to total.</em></p>

              <ion-button 
                expand="block" 
                color="primary" 
                @click="processPayment" 
                class="centered-button"
                :disabled="!enteredAmount || enteredAmount < meterDetails.minimum_amount"
              >
                <span v-if="!isProcessingPayment">Continue to Payment</span>
                <span v-else>Processing...</span>
              </ion-button>
          </div>

        </ion-content>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup>
import {
  IonPage,
  IonContent,
  IonToolbar,
  IonToggle,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonCard,
  IonCardContent,
  IonModal,
  IonIcon
} from '@ionic/vue';

import { closeCircle} from 'ionicons/icons';
import { ref } from 'vue';
import axios from 'axios';

import { onMounted } from 'vue';
const presentingEl = ref();
const email = localStorage.getItem('email') || '';
const userId = localStorage.getItem('userId') || '';
const loyaltypoints_sum = ref(0)




const isPrepaid = ref(true);
const meterNo = ref('');
const selectedEdc = ref('');
const enteredAmount = ref('');

const isModalOpen = ref(false);
const isLoading = ref(false);
const meterDetails = ref({});
const amount = ref('');

const scrollCards = ['Card 2', 'Card 3', 'Card 4'];
const currentIndex = ref(0);
const carouselRef = ref(null);

const handleScroll = () => {
  if (!carouselRef.value) return;
  const scrollLeft = carouselRef.value.scrollLeft;
  const cardWidth = carouselRef.value.clientWidth;
  currentIndex.value = Math.round(scrollLeft / cardWidth);
};

const getloyaltypoints = async() => {

  const data = {
    userid: userId
  };

  
  try {
    const res = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserLoyaltyPointsSum',
      data,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    console.log('getloyaltypoints :', res.data )

    if (Array.isArray(res.data)) {
      loyaltypoints_sum.value = res.data[0];
      console.log("✅ Loaded transactions:", res.data);
    } else {
      console.error('❌ Unexpected response format:', res.data);
    }
  } catch (err) {
    console.error('❌ Failed to fetch transactions:', err);
  } finally {
    isLoading.value = false;
  }



}

onMounted(() => {
  presentingEl.value = document.querySelector('ion-page');

  // call loyalty point details
  getloyaltypoints();

});

const validateMeter = async () => {
  if (!meterNo.value || !selectedEdc.value) {
    alert('Please enter meter number and select EDC');
    return;
  }

  isModalOpen.value = true;
  isLoading.value = true;

  const data = {
    accountno: meterNo.value,
    email,
    pid: selectedEdc.value,
    pre_post: isPrepaid.value ? 'prepaid' : 'postpaid',
    processedby: "web",
    terminal: "web"
  };

  console.log("Validate Data:", data)

  try {
    const response = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxValidate',
      data,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    console.log('✅ Validation response:', response.data);

    if (response.data && response.data.responsename && (response.data.status == 1)) {
      meterDetails.value = response.data;
    } else {
      alert('Validation failed: ' + (response.data?.details || 'Unknown error'));
    }
  } catch (error) {
    console.error('Validation error:', error);
    alert('An error occurred during validation.');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.custom-bg {
  --background: linear-gradient(180deg, #7b2c7e 0%, #5a1a5d 100%);
  background-color: #4b1248;
  color: white;
}

/* 🔄 FIRST CARD: Toggle + Inputs */
.first-card {
  background-color: #f6f6f6;
  border-radius: 16px;
  margin-bottom: 12px;
  color: #222;
}

.first-card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.toggle-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
}

.activeToggle {
  color: #000;
}

.form-input {
  --border-radius: 10px;
  --background: white;
  background-color: white;
}

.validate-btn {
  border-radius: 10px;
  font-weight: 600;
  --background: orange
}


/* 🔁 Carousel Cards */
.carousel-container {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  padding-top: 12px;
}

.carousel-card {
  min-width: 90%;
  flex-shrink: 0;
  scroll-snap-align: center;
  margin-right: 12px;
  border-radius: 16px;
  background-color: #f2f2f2;
  color: #333;
}

.points-card-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100px;
}

.points-label {
  font-size: 18px;
  font-weight: 500;
  margin-right: 20px;
}

.points-value {
  font-size: 32px;
  font-weight: 700;
  margin-right: 10px;
}

.redeem-btn {
  height: 36px;
  border-radius: 20px;
  font-size: 14px;
  padding: 0 16px;
  --background: orange
}

/* Pagination Dots */
.dots {
  display: flex;
  justify-content: center;
  margin: 10px 0 20px 0;
}

.dots span {
  height: 8px;
  width: 8px;
  background-color: #bbb;
  border-radius: 50%;
  margin: 0 4px;
  display: inline-block;
}

.dots span.active {
  background-color: white;
}

/* 📰 Offers */
.offers-section {
  padding-top: 10px;
}

.offers-section h2 {
  color: white;
  margin-bottom: 10px;
  font-size: 20px;
}

.offers-img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.custom-toggle {
  --track-background: var(--ion-color-medium);
  --track-background-checked: orange;
}

.custom-modal {
  --background: transparent;
  --height: auto;
  align-items: flex-end;
}

.fullscreen-modal {
  --height: 95%;
  --width: 100%;
  --background: #f6f6f6;
  align-items: bottom;
}

.modal-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px 20px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
  align-self: center;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.validated-details {
  flex-grow: 1;
  padding-left: 24px; /* 🔶 Your requested margin-left */
  padding-right: 8px;
}

.validated-details p {
  font-size: 15px;
  margin: 8px 0;
}

.validated-details strong{
  color: #ec405f;
}

.validated-details label{
  align-items: center;
  margin-left:24px;
  padding-left: 24px;
}

.validated-title {
  background-color: #ec407a;
  color: white;
  padding: 6px 12px;
  border-radius: 0px;
  display: inline-block;
  margin-bottom: 16px;
}

.loader-container {
  flex-grow: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* Title and key centered items */
.centered-element {
  text-align: center;
  width: 100%;
  margin: 8px 0;
}

.centered-input {
  display: block;
  margin: 12px auto;
  max-width: 300px;
  width: 90%;
  --background: #f7f7f7;
  background-color: white;
  --border-radius: 10px;
  text-align: center;
  font-size: 15px;

  /* 🔽 Add this to improve label alignment */
  --padding-start: 12px;
  --padding-end: 12px;
  --highlight-padding: 12px;
}


.centered-button {
  display: block;
  margin: 20px auto;
  max-width: 300px;
  width: 60%;

  /* Make the button fully rounded */
  --border-radius: 30px;

  /* Button color */
  --background: #5100ff; 
  --color: white;

  /* Drop shadow applied properly */
  --box-shadow: 0 4px 12px rgba(0, 60, 255, 0.4);

  /* Padding inside the button */
  --padding-top: 0.75rem;
  --padding-bottom: 0.75rem;

  /* Remove native background overrides */
  background: transparent;

  /* Smoother animation */
  transition: all 0.3s ease;
}

    
    
.note-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

.subheading{
  color: #ec407a;
}


</style>
