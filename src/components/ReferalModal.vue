<template>
  <ion-modal
    id="refer-modal"
    :is-open="isOpen"
    @didDismiss="close"
  >
    <div class="wrapper">
      <!-- Close button -->
      <ion-icon
        :icon="closeOutline"
        class="close-icon"
        @click="close"
      />

      <h2 class="text-lg font-semibold mb-4">Refer & Earn</h2>

      <p class="mb-2">Your referral code:</p>
      <ion-item lines="none" button="false" class="referral-box">
        <ion-label class="ion-text-wrap selectable">
          <strong>{{ referralCode }}</strong>
        </ion-label>
        <ion-icon
          :icon="copyOutline"
          slot="end"
          class="copy-icon"
          @click="copyToClipboard(referralCode)"
        />
      </ion-item>

      <p class="mb-2 mt-4">Your referral link:</p>
      <ion-item lines="none" button="false" class="referral-box">
        <ion-label class="ion-text-wrap selectable">
          <strong>{{ referralLink }}</strong>
        </ion-label>
        <ion-icon
          :icon="copyOutline"
          slot="end"
          class="copy-icon"
          @click="copyToClipboard(referralLink)"
        />
      </ion-item>
    </div>
  </ion-modal>
</template>

<script setup>
import {
  IonModal,
  IonItem,
  IonLabel,
  IonIcon,
  toastController,
} from "@ionic/vue";
import { copyOutline, closeOutline } from "ionicons/icons";

const props = defineProps({
  isOpen: Boolean,
  referralLink: String,
  referralCode: String,
});
const emit = defineEmits(["update:isOpen"]);

const copyToClipboard = async (text) => {
  let success = false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      success = true;
    }
  } catch (err) {
    console.warn("Clipboard API failed, fallback:", err);
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      success = document.execCommand("copy");
    } catch (e) {
      success = false;
    }
    document.body.removeChild(textarea);
  }

  const toast = await toastController.create({
    message: success ? "Copied to clipboard!" : "Copy failed",
    duration: 1500,
    color: success ? "success" : "danger",
  });
  await toast.present();
};

function close() {
  emit("update:isOpen", false);
}
</script>

<style>
/* Modal dialog styles */
ion-modal#refer-modal {
  --width: 90%;
  --min-width: 280px;
  --max-width: 400px;
  --height: fit-content;
  --border-radius: 12px;
  --box-shadow: 0 28px 48px rgba(0, 0, 0, 0.4);
}

ion-modal#refer-modal .wrapper {
  position: relative;
  padding: 20px;
}

.close-icon {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 22px;
  color: #666;
  cursor: pointer;
  z-index: 10;
}

.referral-box {
  background: #f4f4f4;
  border-radius: 12px;
  padding: 8px;
}

.copy-icon {
  font-size: 18px;
  margin-left: 8px;
  vertical-align: middle;
  color: #ffc857;
  cursor: pointer;
}
</style>
