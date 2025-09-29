<template>
  <ion-modal id="redeem-modal" :is-open="isOpen" @didDismiss="close">
    <div class="wrapper">
      <!-- Close button -->
      <ion-icon :icon="closeOutline" class="close-icon" @click="close" />
      
      <!-- Modal Header -->
      <div class="modal-header">
        <h2>Redeem Points</h2>
      </div>
      
      <!-- Modal Content -->
      <div class="modal-content">
        <div class="points-display">
          <p class="current-points">Current Points: <span class="points-value">{{ loyaltyPoints }}</span></p>
        </div>
        
        <!-- Validation Message -->
        <div v-if="loyaltyPoints < 50000" class="validation-message error">
          <ion-icon :icon="warningOutline" class="warning-icon" />
          <p>Points need to be >= 50,000 to get ₦500 Electricity</p>
        </div>
        
        <!-- Redemption Options (shown when points are sufficient) -->
        <div v-else class="redemption-options">
          <div class="redemption-card">
            <div class="reward-info">
              <h3>₦500 Electricity Credit</h3>
              <p class="points-required">50,000 Points Required</p>
            </div>
            <ion-button 
              expand="block" 
              color="success" 
              class="redeem-button"
              @click="handleRedeem"
              :disabled="isRedeeming"
            >
              <span v-if="!isRedeeming">Redeem Now</span>
              <span v-else>Processing...</span>
            </ion-button>
          </div>
        </div>
      </div>
    </div>
  </ion-modal>
</template>

<script setup>
import { 
  IonModal, 
  IonIcon, 
  IonButton,
  toastController 
} from "@ionic/vue";
import { closeOutline, warningOutline } from "ionicons/icons";
import { ref } from "vue";

const props = defineProps({
  isOpen: Boolean,
  loyaltyPoints: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(["update:isOpen"]);

const isRedeeming = ref(false);

function close() {
  emit("update:isOpen", false);
}

async function handleRedeem() {
  if (props.loyaltyPoints < 50000) {
    await presentToast("Insufficient points for redemption", "danger");
    return;
  }

  isRedeeming.value = true;
  
  try {
    // TODO: Implement your redemption API call here
    // const response = await redeemPoints(50000, 'electricity', 500);
    
    // Simulate API call for now
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await presentToast("Redemption successful! ₦500 electricity credit will be processed.", "success");
    close();
  } catch (error) {
    console.error("Redemption error:", error);
    await presentToast("Redemption failed. Please try again.", "danger");
  } finally {
    isRedeeming.value = false;
  }
}

const presentToast = async (message, color = "primary") => {
  const toast = await toastController.create({
    message,
    duration: 3000,
    color,
    position: "top",
  });
  return toast.present();
};
</script>

<style scoped>
/* Modal dialog styles */
ion-modal#redeem-modal {
  --width: 90%;
  --min-width: 300px;
  --max-width: 450px;
  --height: fit-content;
  --border-radius: 16px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

ion-modal#redeem-modal .wrapper {
  position: relative;
  padding: 0;
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.close-icon {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 24px;
  color: #666;
  cursor: pointer;
  z-index: 10;
  padding: 4px;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-icon:hover {
  background-color: #f0f0f0;
}

.modal-header {
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #eee;
  background: white;
}

.modal-header h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}

.modal-content {
  padding: 24px 20px;
}

.points-display {
  text-align: center;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
}

.current-points {
  font-size: 18px;
  margin: 0;
  color: #333;
}

.points-value {
  font-weight: 700;
  color: #5100ff;
  font-size: 24px;
}

.validation-message {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.validation-message.error {
  background-color: #fff5f5;
  border: 1px solid #fed7d7;
  color: #c53030;
}

.warning-icon {
  font-size: 20px;
  margin-right: 12px;
  flex-shrink: 0;
}

.validation-message p {
  margin: 0;
  font-weight: 500;
}

.redemption-options {
  margin-top: 20px;
}

.redemption-card {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  border: 2px solid #e2e8f0;
  transition: border-color 0.2s;
}

.redemption-card:hover {
  border-color: #5100ff;
}

.reward-info {
  text-align: center;
  margin-bottom: 16px;
}

.reward-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.points-required {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.redeem-button {
  --border-radius: 12px;
  --padding-top: 12px;
  --padding-bottom: 12px;
  font-weight: 600;
  margin-top: 16px;
}

.redeem-button:disabled {
  opacity: 0.6;
}
</style>