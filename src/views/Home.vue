<template>
  <ion-page>
    <ion-content class="ion-padding custom-bg page-content" fullscreen>
      <!-- Header with Logo and Profile -->
      <HeaderComponent :showEditProfile="false" />

      <div class="page-content">
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
              class="form-input custom-select"
            >
              <ion-select-option
                v-for="edc in edcOptions"
                :key="edc.value"
                :value="edc.value"
              >
                {{ edc.label }}
              </ion-select-option>
            </ion-select>

            <ion-button
              expand="block"
              class="validate-btn"
              @click="validateMeter"
            >
              Validate & Buy
            </ion-button>
          </ion-card-content>
        </ion-card>

        <!-- 🧃 Scrollable Card Carousel -->
        <div
          class="carousel-container"
          @scroll="handleScroll"
          ref="carouselRef"
        >
          <!-- Card 1: Loyalty Points (unchanged) -->
          <ion-card class="carousel-card">
            <ion-card-content class="points-card-content">
              <div class="points-label">Loyalty <br />Points</div>
              <div class="points-value">{{ loyaltypoints_sum }}</div>
              <ion-button
                shape="round"
                size="small"
                class="redeem-btn"
                @click="openRedeemModal"
              >
                REDEEM
              </ion-button>
            </ion-card-content>
          </ion-card>

          <!-- Dynamic Cards from API -->
          <ion-card
            class="carousel-card"
            v-for="card in scrollCards"
            :key="card.id"
          >
            <ion-card-content class="dynamic-card-content">
              <div
                class="card-bg"
                :style="{
                  backgroundImage: `url(${card.backgroundImage})`,
                  backgroundPosition: card.bgPos || '50% 45%',
                }"
              >
                <!-- Bottom-right CTA button (refer) -->
                <ion-button
                  v-if="card.ctaType === 'button'"
                  class="action-btn"
                  shape="round"
                  size="small"
                  :class="[
                    card.buttonColor === 'success'
                      ? 'success-btn'
                      : 'warning-btn',
                  ]"
                  @click="handleCardAction(card)"
                >
                  {{ card.ctaText }}
                </ion-button>

                <!-- Top-left pill label (cashback) -->
                <span v-else-if="card.ctaType === 'label'" class="pill-label">
                  {{ card.ctaText }}
                </span>
              </div>
            </ion-card-content>
          </ion-card>

          <ReferalModal
            v-model:isOpen="referralModalOpen"
            :referralLink="referralLink"
            :referral-code="referralCode"
            @update:isOpen="referralModalOpen = $event"
          />
          <RedeemModal
            v-model:isOpen="redeemModalOpen"
            :loyaltyPoints="loyaltypoints_sum"
            @update:isOpen="redeemModalOpen = $event"
          />
        </div>

        <!-- Pagination Dots -->
        <div class="dots">
          <span
            v-for="(_, index) in totalCards"
            :key="index"
            :class="{ active: index === currentIndex }"
          ></span>
        </div>

        <!-- 📰 Offers Section -->
        <div class="offers-section">
          <h2>Photo of the Day</h2>
          <img :src="firstRewardImage" class="offers-img" alt="Current Offer" />
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
          :breakpoints="[0, 0.95, 1]"
          :initial-breakpoint="0.95"
          class="fullscreen-modal"
        >
          <div class="modal-header">
            <h2>Buy Electricity</h2>
            <ion-button
              fill="clear"
              size="default"
              @click="closeModal"
              class="close-button"
              :disabled="isLoading || isProcessingPayment || isProcessingTx"
            >
              <ion-icon :icon="closeCircle" />
            </ion-button>
          </div>

          <ion-content class="modal-content">
            <!-- Loading State -->
            <!-- <div v-if="isLoading" class="loader-container">
            <img src="/assets/Loading animation blue.gif" alt="Loading..." />
          </div> -->
            <!-- Validation Loader -->
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
                <p class="centered-element">Validating meter...</p>
              </div>
            </div>

            <!-- Payment Processing State -->
            <!-- <div v-else-if="isProcessingPayment" class="loader-container">
            <img src="/assets/Loading animation blue.gif" alt="Processing Payment..." />
            <p class="centered-element">Processing your payment...</p>
          </div> -->
            <!-- Payment Processing Loader -->
            <div v-else-if="isProcessingPayment" class="loader-container">
              <!-- <div class="loader"></div> -->
              <div class="loader-bars">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
                <div class="bar4"></div>
                <div class="bar5"></div>
                <div class="bar6"></div>
              </div>
              <p class="centered-element">Processing your payment...</p>
            </div>

            <!-- Show error if timeout or failure -->
            <div v-else-if="txErrorMessage" class="error-message">
              <p>{{ txErrorMessage }}</p>
            </div>

            <div v-else-if="isProcessingTx" class="loader-container">
              <!-- <div class="loader"></div> -->
              <div class="loader-bars">
                <div class="bar1"></div>
                <div class="bar2"></div>
                <div class="bar3"></div>
                <div class="bar4"></div>
                <div class="bar5"></div>
                <div class="bar6"></div>
              </div>
              <p class="centered-element">Processing your transaction...</p>
            </div>

            <!-- Payment Success State -->
            <div
              v-else-if="paymentResult === 'success'"
              class="payment-result success"
            >
              <div class="result-header">
                <h2 class="success-title">Transaction Successful!</h2>
              </div>
              <div class="token-details">
                <p><strong>Token:</strong> {{ purchaseToken }}</p>
                <p><strong>Amount:</strong> ₦{{ enteredAmount }}</p>
                <p>
                  <strong>Meter Number:</strong> {{ meterDetails.accountno }}
                </p>
                <p><strong>Transaction Ref:</strong> {{ paymentReference }}</p>
              </div>
              <ion-button
                expand="block"
                color="success"
                @click="closeModal"
                class="centered-button"
              >
                Done
              </ion-button>
            </div>

            <!-- Payment Failed State -->
            <div
              v-else-if="paymentResult === 'failed'"
              class="payment-result failed"
            >
              <div class="result-header">
                <h2 class="failed-title">Payment Failed</h2>
              </div>
              <p class="centered-element">{{ paymentErrorMessage }}</p>
              <ion-button
                expand="block"
                color="danger"
                @click="resetPayment"
                class="centered-button"
              >
                Try Again
              </ion-button>
            </div>

            <!-- Validated Details State (your existing content) -->
            <div v-else class="validated-details">
              <h5 class="validated-title">Validated</h5>
              <p>
                <strong class="subheading">Meter Customer Name</strong> <br />
                {{ meterDetails.responsename }}
              </p>
              <p>
                <strong>Meter Number:</strong> <br />
                {{ meterDetails.accountno }}
              </p>
              <p>
                <strong>Address:</strong> <br />
                {{ meterDetails.responseaddr }}
              </p>
              <br />
              <p class="centered-element">{{ email }}</p>
              <br />
              <p class="centered-element">Minimum Amount: ₦{{ min_amount }}</p>

              <ion-input
                v-model="enteredAmount"
                placeholder="Enter Amount"
                type="number"
                class="centered-input"
              ></ion-input>

              <p class="centered-element">
                <em>₦100 - convenience fee will be added to total.</em>
              </p>

              <ion-button
                expand="block"
                color="primary"
                @click="processPayment"
                class="centered-button"
                :disabled="
                  !enteredAmount || enteredAmount < meterDetails.minimum_amount
                "
              >
                <span v-if="!isProcessingPayment">Continue to Payment</span>
                <span v-else>Processing...</span>
              </ion-button>
            </div>
          </ion-content>
        </ion-modal>
      </div>
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
  IonIcon,
  toastController,
  IonPopover,
  IonList,
  IonLabel,
} from "@ionic/vue";

import {
  closeCircle,
  personCircle,
  personOutline,
  logOutOutline,
} from "ionicons/icons";
import axios from "axios";
import { useElectricityStore } from "@/stores/electricityStore";
const electricityStore = useElectricityStore();

import { ref, onMounted, computed } from "vue";

import HeaderComponent from "../components/HeaderComponent.vue";
import RedeemModal from "@/components/RedeemModal.vue";
const presentingEl = ref();
const email = localStorage.getItem("email") || "";
const userId = localStorage.getItem("userId") || "";
const loyaltypoints_sum = ref(0);
const redeemModalOpen = ref(false);
const openRedeemModal = () => {
  redeemModalOpen.value = true;
};

const min_amount = ref(0);

const isPrepaid = ref(true);
const meterNo = ref("");
const selectedEdc = ref("");
const enteredAmount = ref("");

const isModalOpen = ref(false);
const isLoading = ref(false);
const meterDetails = ref({});
const amount = ref("");

// Add these after line 44 (after const amount = ref('');)
const isProcessingPayment = ref(false);
const isProcessingTx = ref(false);
const processingTimeout = ref(null);
const txErrorMessage = ref("");

const paymentResult = ref(null); // 'success', 'failed', or null
const paymentReference = ref("");
const purchaseToken = ref("");
const paymentErrorMessage = ref("");
const currentTxId = ref("");

// Configuration - Replace with your actual Flutterwave keys

const USEPROD_PAYSTACK = false; // Set to true for production

const currentIndex = ref(0);
const carouselRef = ref(null);
const firstRewardImage = ref("https://picsum.photos/400/200?random=42");
import ReferalModal from "@/components/ReferalModal.vue";
import referFriendImage from "@/assets/refer-a-friend-01.jpeg";
import cashBackImage from "@/assets/cash-back-01.jpeg";
import { useUserStore } from "@/stores/user";
const userStore = useUserStore();
// Add after existing variables
const scrollCards = ref([]);
const defaultScrollCards = [
  {
    id: 1,
    type: "refer",
    ctaType: "button",
    ctaText: "Refer & Earn",
    buttonColor: "success",
    action: "refer",
    weblink: "https://example.com/refer-friend",
    backgroundImage: referFriendImage,
    bgPos: "50% 42%", // show more of the image; tweak per image
  },
  {
    id: 2,
    type: "cashback",
    ctaType: "label",
    ctaText: "Cashback on all purchases",
    backgroundImage: cashBackImage,
    bgPos: "50% 50%",
  },
];

const referralModalOpen = ref(false);
const referralLink = ref("");
const referralCode = computed(() => userStore.detailsSec);

// Add after existing methods
const loadScrollCards = async () => {
  try {
    // TODO: Replace with actual API call
    // const response = await axios.post('your-scroll-cards-api-endpoint', { userId });
    // scrollCards.value = response.data;

    // Simulate API delay and use default data for now
    await new Promise((resolve) => setTimeout(resolve, 500));
    scrollCards.value = defaultScrollCards;

    console.log("Scroll cards loaded:", scrollCards.value);
  } catch (error) {
    console.error("Error loading scroll cards, using defaults:", error);
    scrollCards.value = defaultScrollCards;
  }
};

const handleCardAction = (card) => {
  console.log("Card action clicked:", card);

  if (card.action === "refer" && card.weblink) {
    // Instead of opening a new tab, show modal
    const url = new URL(card.weblink);
    url.searchParams.set("userid", userId);
    url.searchParams.set("email", email);

    referralLink.value = `https://www.utilitybox.ng/r/${referralCode.value}`;
    referralModalOpen.value = true;
  } else if (card.action === "claim") {
    // Handle other actions
    presentToast("Feature coming soon!", "primary");
  } else if (card.weblink) {
    // Generic weblink handler
    const url = new URL(card.weblink);
    url.searchParams.set("userid", userId);
    window.open(url.toString(), "_blank");
  }
};

// Add computed property for total cards count
const totalCards = computed(() => {
  return 1 + scrollCards.value.length; // 1 for loyalty points + dynamic cards
});

// Remove the old hardcoded scrollCards array
// const scrollCards = ['Card 2', 'Card 3', 'Card 4'];

const presentToast = async (message, color = "danger") => {
  const toast = await toastController.create({
    message,
    duration: 2500,
    color,
    position: "top",
  });
  return toast.present();
};

const presentValidationFailToast = async (message) => {
  const toast = await toastController.create({
    message,
    duration: 3000, // auto dismiss after 3s
    color: "danger",
    position: "top",
  });
  return toast.present();
};

const safeParse = (v) => {
  if (!v) return null;
  if (typeof v === "object") return v;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

// Pull human-readable error from the EDC payload (handles double-encoded JSON)
const extractEdcError = (jsonresponse) => {
  const outer = safeParse(jsonresponse);
  if (!outer) return null;

  // Common nesting patterns
  let content = outer.content || outer.data || outer.result || outer;

  // Sometimes "content" is itself a JSON string
  const inner = safeParse(content);
  if (inner) content = inner;

  const msg =
    (content && (content.error || content.message)) ||
    outer.error ||
    outer.message;
  return typeof msg === "string" ? msg : null;
};

const handleScroll = () => {
  if (!carouselRef.value) return;
  const scrollLeft = carouselRef.value.scrollLeft;
  const cardWidth = carouselRef.value.clientWidth;
  currentIndex.value = Math.round(scrollLeft / cardWidth);
};

const getloyaltypoints = async () => {
  const data = {
    userid: userId,
  };

  try {
    const res = await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserLoyaltyPointsSum",
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log("getloyaltypoints :", res.data);

    if (Array.isArray(res.data)) {
      loyaltypoints_sum.value = res.data[0];
      console.log("✅ Loaded transactions:", res.data);
    } else {
      console.error("❌ Unexpected response format:", res.data);
    }
  } catch (err) {
    console.error("❌ Failed to fetch transactions:", err);
  } finally {
    isLoading.value = false;
  }
};

const edcOptions = ref([
  { value: "abujaedc", label: "Abuja" },
  { value: "ikejaedc", label: "Lagos-Ikeja" },
  { value: "ekoedc", label: "Lagos-Eko" },
  { value: "enuguedc", label: "Enugu" },
  { value: "ibadanedc", label: "Ibadan" },
  { value: "phedc", label: "Port Harcourt" },
]);

const loadEdcOptions = async () => {
  try {
    // TODO: Replace with actual API call
    // const response = await axios.get('your-edc-api-endpoint');
    // edcOptions.value = response.data;

    console.log("EDC options loaded:", edcOptions.value);
  } catch (error) {
    console.error("Error loading EDC options:", error);
  }
};

onMounted(() => {
  presentingEl.value = document.querySelector("ion-page");

  // call loyalty point details
  getloyaltypoints();
  // loadEdcOptions(); // Uncomment when you want to load from API
  loadScrollCards();
});

// const validateMeter = async () => {
//   if (!meterNo.value || !selectedEdc.value) {
//     alert('Please enter meter number and select EDC');
//     return;
//   }

//   isModalOpen.value = true;
//   isLoading.value = true;

//   const data = {
//     accountno: meterNo.value,
//     email: email || 'support@utilitybox.ng',
//     pid: selectedEdc.value,
//     pre_post: isPrepaid.value ? 'prepaid' : 'postpaid',
//     processedby: "quidlymobie",
//     terminal: "quidlymobile",
//     userid: userId,
//     origuserid: "quickbuy"
//   };

//   //processedby: "quidlymobile", // web
//   //  terminal: "quidlymobile" // web

//   console.log("Validate Data:", data)

//   try {
//     const response = await axios.post(
//       'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxValidate',
//       data,
//       {
//         headers: { 'Content-Type': 'application/json' },
//       }
//     );

//     console.log('✅ Validation response:', response.data);

//     if (response.data && response.data.responsename && (response.data.status == 1)) {
//       meterDetails.value = response.data;
//       min_amount.value = response.data.minimum_amount.toFixed(2);
//       localStorage.setItem('PKEY', response.data.pubkey);
//       localStorage.setItem('PKEY_TEST', response.data.pubkey_test);
//       localStorage.setItem('PPID', response.data.ppid);
//       localStorage.setItem('TXID', response.data.txid);
//     } else {
//       alert('Validation failed: ' + (response.data?.details || 'Unknown error'));
//     }
//   } catch (error) {
//     console.error('Validation error:', error);
//     alert('An error occurred during validation.');
//   } finally {
//     isLoading.value = false;
//   }
// };

const validateMeter = async () => {
  if (!meterNo.value || !selectedEdc.value) {
    await presentValidationFailToast(
      "Please enter meter number and select EDC"
    );
    return;
  }

  // ✅ Open modal first and show your CSS loader inside it
  isModalOpen.value = true;
  isLoading.value = true;

  const data = {
    accountno: meterNo.value,
    email: email || "support@utilitybox.ng",
    pid: selectedEdc.value,
    pre_post: isPrepaid.value ? "prepaid" : "postpaid",
    processedby: "quidlymobile",
    terminal: "quidlymobile",
    userid: userId,
    origuserid: "quickbuy",
  };

  try {
    const res = await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxValidate",
      data,
      { headers: { "Content-Type": "application/json" } }
    );

    const d = res.data;
    console.log("✅ Validation response:", d);

    // ⚠️ Don’t trust status alone (can be 1 on failures in some backends)
    const valid = !!(d && d.responsename && d.accountno);

    if (valid) {
      meterDetails.value = d;
      min_amount.value = Number(d.minimum_amount || 0).toFixed(2);
      localStorage.setItem("PKEY", d.pubkey);
      localStorage.setItem("PKEY_TEST", d.pubkey_test);
      localStorage.setItem("PPID", d.ppid);
      localStorage.setItem("TXID", d.txid);
      // keep modal open and show details (loader will stop in finally)
    } else {
      const edcMsg =
        extractEdcError(d && d.jsonresponse) ||
        d?.message ||
        "Validation failed";
      isModalOpen.value = false; // close on failure
      await presentValidationFailToast(edcMsg); // show real upstream msg
    }
  } catch (err) {
    console.error("Validation error:", err);
    const d = err && err.response && err.response.data;
    const edcMsg =
      extractEdcError(d && d.jsonresponse) ||
      (d && d.message) ||
      err.message ||
      "An error occurred during validation.";
    isModalOpen.value = false;
    await presentValidationFailToast(edcMsg);
  } finally {
    isLoading.value = false; // stop the modal loader either way
  }
};

const generateTxId = () => {
  return "TX_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
};

// 🔥 ADD THIS DEBUG FUNCTION TO YOUR IONIC COMPONENT
const debugQuidlyInputs = () => {
  console.log("🔍 Debugging Quidly inputs in Ionic...");

  // Wait a bit more for Vue to render
  setTimeout(() => {
    const inputs = document.querySelectorAll("#quidly-pay-modal input");
    console.log(`Found ${inputs.length} Quidly inputs`);

    if (inputs.length === 0) {
      console.log("❌ No Quidly inputs found! Trying again...");
      setTimeout(debugQuidlyInputs, 2000);
      return;
    }

    inputs.forEach((input, index) => {
      console.log(`\n📝 Quidly Input ${index}:`, input);
      console.log("Placeholder:", input.placeholder);
      console.log("Type:", input.type);

      // Check computed styles
      const styles = window.getComputedStyle(input);
      console.log("🎨 Critical styles:", {
        pointerEvents: styles.pointerEvents,
        touchAction: styles.touchAction,
        userSelect: styles.userSelect,
        webkitUserSelect: styles.webkitUserSelect,
        webkitTouchCallout: styles.webkitTouchCallout,
        zIndex: styles.zIndex,
        position: styles.position,
        display: styles.display,
        visibility: styles.visibility,
        opacity: styles.opacity,
        background: styles.backgroundColor,
        border: styles.border,
        transform: styles.transform,
      });

      // Check element properties
      console.log("📋 Element properties:", {
        disabled: input.disabled,
        readOnly: input.readOnly,
        tabIndex: input.tabIndex,
        offsetParent: input.offsetParent,
        clientHeight: input.clientHeight,
        clientWidth: input.clientWidth,
      });

      // Test focus
      try {
        const originalActiveElement = document.activeElement;
        input.focus();
        const focusSuccessful = document.activeElement === input;
        console.log(
          `🎯 Focus test for input ${index}:`,
          focusSuccessful ? "✅ SUCCESS" : "❌ FAILED"
        );

        if (!focusSuccessful) {
          console.log("Active element is:", document.activeElement);
        }
      } catch (e) {
        console.log(`❌ Focus error for input ${index}:`, e);
      }

      // Test click detection
      input.addEventListener(
        "click",
        (e) => {
          console.log(`🖱️ Input ${index} clicked!`, e);
          console.log("Event target:", e.target);
          console.log("Current target:", e.currentTarget);
        },
        { once: true }
      );

      input.addEventListener(
        "touchstart",
        (e) => {
          console.log(`👆 Input ${index} touched!`, e);
        },
        { once: true }
      );

      input.addEventListener(
        "focus",
        (e) => {
          console.log(`🎯 Input ${index} focused!`, e);
        },
        { once: true }
      );

      input.addEventListener("input", (e) => {
        console.log(`⌨️ Input ${index} value changed:`, e.target.value);
      });
    });

    // Check for Ionic interference
    console.log("\n🅰️ Checking Ionic interference...");

    // Check ion-content
    const ionContent = document.querySelector("ion-content");
    if (ionContent) {
      const ionStyles = window.getComputedStyle(ionContent);
      console.log("ion-content styles:", {
        pointerEvents: ionStyles.pointerEvents,
        touchAction: ionStyles.touchAction,
        zIndex: ionStyles.zIndex,
        overflow: ionStyles.overflow,
      });
    }

    // Check ion-page
    const ionPage = document.querySelector("ion-page");
    if (ionPage) {
      const pageStyles = window.getComputedStyle(ionPage);
      console.log("ion-page styles:", {
        pointerEvents: pageStyles.pointerEvents,
        touchAction: pageStyles.touchAction,
        zIndex: pageStyles.zIndex,
      });
    }

    // Check for overlaying elements
    const modal = document.getElementById("quidly-pay-modal");
    if (modal) {
      const modalStyles = window.getComputedStyle(modal);
      console.log("🏠 Quidly modal styles:", {
        pointerEvents: modalStyles.pointerEvents,
        touchAction: modalStyles.touchAction,
        zIndex: modalStyles.zIndex,
        position: modalStyles.position,
        transform: modalStyles.transform,
      });
    }
  }, 500);
};

// 🔥 ADD THIS QUICK TEST FUNCTION TOO
const testQuidlyInputDirectly = () => {
  console.log("\n🚀 Testing Quidly input directly...");

  const input = document.querySelector(
    '#quidly-pay-modal input[placeholder*="Card"]'
  );
  if (input) {
    console.log("Found card input:", input);

    // Force style override test
    input.style.pointerEvents = "auto";
    input.style.touchAction = "manipulation";
    input.style.zIndex = "999999";
    input.style.position = "relative";
    input.style.background = "yellow"; // Visual indicator
    input.style.border = "2px solid red";

    console.log("Applied test styles - input should be yellow with red border");

    // Try to type
    input.focus();
    input.value = "TEST123";
    console.log("Set test value:", input.value);

    // Trigger input event
    input.dispatchEvent(new Event("input", { bubbles: true }));
  } else {
    console.log("❌ Card input not found");
  }
};

const logPayment = async (dataDb) => {
  try {
    console.log("📤 logPayment sending:", dataDb);

    const response = await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxPayment",
      dataDb,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ logPayment response:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ logPayment error:", error);
    completePayment(error);
    throw error;
  }
};

// Simplified processPayment function for Ionic - now as simple as Flutterwave!
const processPayment = async () => {
  const PKEY_TEST = localStorage.getItem("PKEY_TEST") || "";
  const PKEY = localStorage.getItem("PKEY") || "";
  const PPID = localStorage.getItem("PPID") || "flutter";
  const TXID = localStorage.getItem("TXID");

  if (
    !enteredAmount.value ||
    enteredAmount.value < meterDetails.value.minimum_amount
  ) {
    alert("Please enter a valid amount");
    return;
  }

  // Generate transaction ID
  currentTxId.value = localStorage.getItem("TXID"); //generateTxId();
  isProcessingPayment.value = true;

  const amountInKobo = parseFloat(enteredAmount.value) * 100;
  const convenienceFee = 100 * 100; // ₦100 in kobo
  const totalAmount = amountInKobo + convenienceFee;

  // Build dataDb (like in your Knockout)
  const dataDb = {
    txid: TXID,
    userid: userId,
    origuserid: "quickbuy", //userId,
    email: email,
    pid: selectedEdc.value,
    ppid: PPID, // default, may be replaced by backend
    ptype: "electricity",
    amount: parseFloat(enteredAmount.value) * 100, // in kobo
    accountno: meterNo.value,
    pre_post: isPrepaid.value ? "prepaid" : "postpaid",
    paymentfee: 100 * 100, // ₦100 in kobo
    commissionfee: 0,
    processingfee: 0,
    productCode: meterDetails.value.productCode || "",
    pin: meterDetails.value.pin || null,
  };

  try {
    const txResponse = await logPayment(dataDb);

    if (
      txResponse === "no_existing_transaction" ||
      txResponse === "edc_service_not_available"
    ) {
      alert("⚠ Transaction could not be started: " + txResponse);
      return;
    }

    if (PPID === "flutter") {
      const publicKey = USEPROD_PAYSTACK ? PKEY : PKEY_TEST;

      FlutterwaveCheckout({
        public_key: publicKey,
        tx_ref: currentTxId.value,
        amount: totalAmount / 100,
        currency: "NGN",
        customer: { email: email },
        customizations: {
          title: "TCL-UtilityBox",
          description: "Payment for Electricity",
        },
        onclose: () => {
          isProcessingPayment.value = false;
        },
        callback: (response) => {
          handlePaymentCallback(response);
        },
      });
    } else if (PPID === "quidly") {
      window.embedQuidlyPay.initialize({
        key: PKEY_TEST,
        email,
        amount: totalAmount,
        currency_code: "NGN",
        onload: () => console.log("loaded"),
        onclose: () => {
          isProcessingPayment.value = false;
        },
        callback: (res) => handleQuidlyPaymentCallback(res),
      });
    } else {
      throw new Error(`Unsupported payment processor: ${PPID}`);
    }
  } catch (error) {
    console.error("Payment initialization error:", error);
    isProcessingPayment.value = false;
    paymentResult.value = "failed";
    paymentErrorMessage.value =
      error.message || "Error initializing payment gateway";
    completePayment(error);
  }
};

const handlePaymentCallback = async (response) => {
  console.log("Payment callback response:", response);
  isProcessingTx.value = true;
  txErrorMessage.value = "";
  // Start 2-minute timeout when processing starts
  if (processingTimeout.value) {
    clearTimeout(processingTimeout.value);
  }
  processingTimeout.value = setTimeout(() => {
    console.error("⏰ Transaction timed out after 2 minutes");
    isProcessingTx.value = false;
    // showCloseButton.value = true; // re-enable close
    // alert("Error during transaction processing. Please contact support.");
    txErrorMessage.value =
      "Error during transaction processing. Please contact support.";
  }, 120000); // 2 minutes

  let payRef = "";
  let status = 0;

  // Extract payment reference and status from response
  if (response.tx_ref) {
    payRef = response.tx_ref;
    if (response.status === "successful" || response.status === "success") {
      status = 1;
    }
  }

  paymentReference.value = payRef;

  if (status === 1) {
    // Process successful payment
    await processSuccessfulPayment(response);
  } else {
    // Handle failed payment
    paymentResult.value = "failed";
    paymentErrorMessage.value = "Payment was not successful";
    isProcessingPayment.value = false;
    isProcessingTx.value = false;

    if (processingTimeout.value) {
      clearTimeout(processingTimeout.value);
      processingTimeout.value = null;
    }
  }
};

const handleQuidlyPaymentCallback = async (response) => {
  console.log("Quidly Payment callback response:", response);

  // // ✅ CHECK FOR ERRORS FIRST - before setting any processing states
  // if (response && response.status === 'error') {
  //   console.log('Quidly payment initialization failed:', response.message);

  //   // Stop all processing states
  //   isProcessingPayment.value = false;
  //   isProcessingTx.value = false;

  //   // Show error result
  //   paymentResult.value = 'failed';
  //   paymentErrorMessage.value = response.message || 'Payment initialization failed';

  //   // Clear any timeouts
  //   if (processingTimeout.value) {
  //     clearTimeout(processingTimeout.value);
  //     processingTimeout.value = null;
  //   }

  //   return; // ✅ Exit early - don't continue processing
  // }

  let payRef = "";
  let status = 0;

  // Extract payment reference and status from Quidly response
  // Adjust these fields based on Quidly's actual response structure
  if (response && response.reference) {
    payRef = response.reference;
    if (
      response.status === "successful" ||
      response.status === "success" ||
      response.status == "1" ||
      response.status === 1
    ) {
      status = 1;
    }
  } else if (response && response.status) {
    payRef = response.data.quidly_ref;
    if (
      response.status === "successful" ||
      response.status === "success" ||
      response.status == "1" ||
      response.status === 1
    ) {
      status = 1;
    }
  }

  paymentReference.value = payRef || currentTxId.value;

  // Reopen your modal to show the result
  isModalOpen.value = true;

  if (status === 1) {
    isProcessingTx.value = true;
    // Process successful payment
    await processSuccessfulPayment(response);
  } else {
    // Handle failed payment
    paymentResult.value = "failed";
    paymentErrorMessage.value =
      response.message || "Payment was not successful";
    isProcessingPayment.value = false;
    isProcessingTx.value = false;
  }
};

const validateToken3 = async (dataDb) => {
  try {
    console.log("🔍 validateToken3 data:", dataDb);

    const res = await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxVerifyPayment",
      dataDb,
      { headers: { "Content-Type": "application/json" } }
    );

    console.log("✅ validateToken3 response:", res.data);
    if (res.data.txid !== "" && res.data.verifystatus == 1) {
      await processTx(res.data);
    } else {
      paymentErrorMessage.value =
        "Transaction Failed after Payment - Please contact support@utilitybox.ng";
      //completePayment(paymentErrorMessage.value);
    }
  } catch (err) {
    console.error("❌ validateToken3 error:", err);
    completePayment(err);
  }
};

const processTx = async (dataDb) => {
  try {
    console.log("🔍 processTx data:", dataDb);

    const res = await axios.post(
      "https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/TxTransact",
      dataDb,
      { headers: { "Content-Type": "application/json" }, timeout: 45000 }
    );

    console.log("✅ processTx response:", res.data);
    completePayment(res.data);
  } catch (err) {
    console.error("❌ processTx error:", err);
    if (err.code === "ECONNABORTED") {
      completePayment("timeout");
    } else {
      completePayment(err.response?.data || err);
    }
  }
};

const completePayment = (dt) => {
  console.log("🎯 Completing payment:", dt);

  isProcessingPayment.value = false;
  isProcessingTx.value = false;

  const edt = new Date().toLocaleString();

  if (dt.verifystatus === 1) {
    if (dt.status_disco === 1) {
      // Success with token
      purchaseToken.value = dt.token;
      paymentResult.value = "success";
      paymentReference.value = dt.paymentref || currentTxId.value;

      // ✅ Save transaction to Pinia store
      electricityStore.handleSuccessfulElectricityPurchase({
        userId: userId || null,
        meterNumber: meterNo.value,
        amount: parseFloat(enteredAmount.value),
        token: dt.token,
        provider: selectedEdc.value,
        date: edt,
      });

      console.log("💾 Transaction stored in Pinia + localStorage");
    } else if (dt.status_disco === 2) {
      paymentResult.value = "failed";
      paymentErrorMessage.value = "Transaction Failed at EDC; Contact Support";
    } else {
      paymentResult.value = "failed";
      paymentErrorMessage.value = "System Error after Payment; Contact Support";
    }
  } else {
    // Flutter verify failed
    paymentResult.value = "failed";

    if (dt === "timeout") {
      paymentErrorMessage.value =
        "Transaction Timeout - Please check email for token or contact support@utilitybox.ng";
    } else {
      paymentErrorMessage.value =
        "Transaction Token Delayed - Please contact support@utilitybox.ng";
    }
  }
};

const processSuccessfulPayment = async (response) => {
  const dataDb = {
    txid: currentTxId.value,
    origuserid: "quickbuy", //userId ||
    userid: userId,
    email: email,
    pid: selectedEdc.value,
    ppid: localStorage.getItem("PPID") || "flutter",
    ptype: "electricity",
    amount: parseFloat(enteredAmount.value) * 100,
    accountno: meterNo.value,
    pre_post: isPrepaid.value ? "prepaid" : "postpaid",
    paymentfee: 100 * 100,
    commissionfee: 0,
    processingfee: 0,
    productCode: meterDetails.value?.productcode || "",
    pin: "", // if applicable
    paymentref: paymentReference.value,
    status: 1,
  };

  console.log("🚀 Starting validateToken3 with:", dataDb);

  await validateToken3(dataDb);
};

// const processSuccessfulPayment = async (response) => {
//   const paymentData = {
//     txid: currentTxId.value,
//     userid: userId,
//     email: email,
//     pid: selectedEdc.value,
//     ppid: PPID, //'flutter',
//     ptype: 'electricity',
//     amount: parseFloat(enteredAmount.value) * 100, // Amount in kobo
//     accountno: meterNo.value,
//     pre_post: isPrepaid.value ? 'prepaid' : 'postpaid',
//     paymentfee: 100 * 100, // ₦100 convenience fee in kobo
//     paymentref: paymentReference.value,
//     status: 1
//   };

//   try {
//     // Call your token validation/purchase API - UPDATE THIS URL
//     const tokenResponse = await axios.post(
//       'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/YourTokenPurchaseEndpoint',
//       paymentData,
//       { headers: { 'Content-Type': 'application/json' } }
//     );

//     console.log('Token purchase response:', tokenResponse.data);

//     if (tokenResponse.data.success) {
//       purchaseToken.value = tokenResponse.data.token || 'Token will be sent via SMS';
//       paymentResult.value = 'success';
//     } else {
//       paymentResult.value = 'failed';
//       paymentErrorMessage.value = tokenResponse.data.message || 'Failed to generate token';
//     }
//   } catch (error) {
//     console.error('Token purchase error:', error);
//     paymentResult.value = 'failed';
//     paymentErrorMessage.value = 'Error processing token purchase';
//   } finally {
//     isProcessingPayment.value = false;
//   }
// };

const resetPayment = () => {
  paymentResult.value = null;
  paymentReference.value = "";
  purchaseToken.value = "";
  paymentErrorMessage.value = "";
  isProcessingPayment.value = false;

  txErrorMessage.value = "";
};

const closeModal = () => {
  isModalOpen.value = false;
  // Reset all states
  resetPayment();
  isLoading.value = false;
  meterDetails.value = {};
  enteredAmount.value = "";
};
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
  --background: orange;
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
  --background: orange;
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
  justify-content: space-between; /* This distributes space between h2 and button */
  align-items: center;
  margin-bottom: 16px;
  padding: 10px 20px; /* Add horizontal padding */
  border-bottom: 1px solid #ccc;
  width: 100%;
}

.modal-header h2 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: #333;
  flex: 1; /* Takes up available space */
  text-align: center; /* Centers the text */
}

.close-button {
  --color: #dc3545 !important; /* Red color with !important */
  --color-hover: #c82333 !important; /* Darker red on hover */
  --ripple-color: #dc3545;
  min-width: 40px; /* Use min-width instead of width */
  min-height: 40px; /* Use min-height instead of height */
  --padding-start: 8px;
  --padding-end: 8px;
  flex-shrink: 0; /* Prevents button from shrinking */
}

.close-button ion-icon {
  font-size: 28px !important; /* Bigger icon with !important */
  color: #dc3545 !important; /* Ensure icon is red */
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

.validated-details strong {
  color: #ec405f;
}

.validated-details label {
  align-items: center;
  margin-left: 24px;
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

.subheading {
  color: #ec407a;
}

/* Payment Result Styles */
.payment-result {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.result-header {
  text-align: center;
  margin-bottom: 24px;
}

.success-title {
  color: #28a745;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.failed-title {
  color: #dc3545;
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.token-details {
  background-color: #e5e9ed; /* #f8f9fa;*/
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  width: 100%;
  max-width: 400px;
}

.token-details p {
  margin: 12px 0;
  font-size: 15px;
  color: #333;
}

.token-details strong {
  color: #495057;
  font-weight: 600;
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

/* Add these to your <style scoped> section or global CSS */

/* Quidly Widget Input Fixes */
#quidly-widget-container {
  /* Ensure the container allows touch events */
  touch-action: auto !important;
  pointer-events: auto !important;
  -webkit-overflow-scrolling: touch;
}

#quidly-widget-container input,
#quidly-widget-container textarea,
#quidly-widget-container select,
#quidly-widget-container button {
  /* Allow text selection and input */
  -webkit-user-select: text !important;
  user-select: text !important;
  touch-action: manipulation !important;
  pointer-events: auto !important;

  /* Remove iOS tap highlights that might interfere */
  -webkit-tap-highlight-color: transparent;

  /* Ensure proper focus behavior */
  outline: none;

  /* Prevent zoom on iOS */
  font-size: 16px;
}

#quidly-widget-container input:focus,
#quidly-widget-container textarea:focus,
#quidly-widget-container select:focus {
  /* Visual feedback for focused elements */
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25) !important;
}

/* Fix for any iframe that Quidly might use */
#quidly-widget-container iframe {
  pointer-events: auto !important;
  touch-action: auto !important;
}

/* Prevent Ionic from interfering */
ion-content.modal-content * {
  pointer-events: auto;
}

/* Override any global touch-action restrictions */
.quidly-payment-overlay {
  touch-action: auto !important;
  pointer-events: auto !important;
}

.quidly-payment-overlay * {
  touch-action: auto !important;
  pointer-events: auto !important;
}

/* Curved sheet-style modal */
.fullscreen-modal {
  --height: 95%;
  --width: 100%;
  --border-radius: 20px 20px 0 0; /* stronger curve */
  --box-shadow: 0 -6px 24px rgba(0, 0, 0, 0.15);
  --backdrop-opacity: 0.4;
}

/* Style the actual modal container (shadow part) */
.fullscreen-modal::part(content) {
  background: #ffffff;
  border-radius: 20px 20px 0 0; /* same as above */
  overflow: hidden; /* hides inner corners */
}

/* Ensure content matches modal */
.fullscreen-modal ion-content {
  --background: #ffffff;
}

/* Header polish so it feels attached to the sheet */
.modal-header {
  background: #ffffff; /* inherit the same surface color */
  position: sticky;
  top: 0;
  z-index: 1;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06); /* lighter divider */
}

/* Optional: keep the body readable and centered on wide screens */
.validated-details {
  max-width: 560px;
  margin: 0 auto;
  padding: 20px;
}

.error-message {
  text-align: center;
  color: red;
  margin-top: 20px;
  font-weight: bold;
}

.custom-select {
  --padding-start: 12px;
  --padding-end: 40px;
}

.custom-select::part(icon) {
  position: absolute;
  right: 12px;
  left: auto;
}

/* Add to your existing styles */

/* .card-text {
  flex-grow: 1;
} */

.dynamic-card-content {
  padding: 0;
  position: relative;
  height: 120px; /* slightly taller so less cropping */
  border-radius: 16px;
  overflow: hidden;
}

/* Full-bleed background image */
.card-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-repeat: no-repeat;
}

/* Button – no drop shadow/background “dropdown” */
.action-btn {
  position: absolute;
  right: 12px;
  bottom: 5px;
  height: 36px;
  --border-radius: 9999px;
  --box-shadow: none;
  box-shadow: none;
  filter: none;
  --background-activated: var(--background);
  --background-focused: var(--background);
}

.success-btn {
  --background: #28a745;
  --color: #fff;
}
.warning-btn {
  --background: #ff9f1a;
  --color: #fff;
}

/* Pill label for cash-back – always legible on any image */
.pill-label {
  position: absolute;
  /* left: 12px;
  top: 12px; */
  right: 12px;
  bottom: 5px;
  height: 36px;
  /* background: rgba(255,255,255,0.92); */
  background: #eb5757;
  color: #fff;
  padding: 10px 10px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2px;
}
.page-content {
  padding-top: 80px;
}
</style>
