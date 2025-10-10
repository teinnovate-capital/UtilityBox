<!-- src/views/Usage.vue-->
<template>
  <ion-page class="usage-page" fullscreen>
    <ion-content class="ion-padding custom-bg usage-page" fullscreen>
      <HeaderComponent />
      <div class="page-body">
         <!-- Energy Usage Chart -->
      <div style="text-align: center">
        <h2 class="section-title">Energy Usage</h2>
      </div>

      <div class="chart-container">
        <div v-if="isLoading" class="chart-loader-overlay">
          <div class="loader-bars">
            <div class="bar1"></div>
            <div class="bar2"></div>
            <div class="bar3"></div>
            <div class="bar4"></div>
            <div class="bar5"></div>
            <div class="bar6"></div>
          </div>
          <p class="loader-text">Loading chart data...</p>
        </div>
        <canvas class="chart-canvas" ref="usageChartCanvas" v-show="!isLoading"></canvas>
      </div>

      <h2 class="section-title">Transaction History</h2>

      <div
        class="history-line"
        v-for="(tx, index) in transactionHistory"
        :key="index"
      >
        <div class="tx-row">
          <!-- Left: Date & Time -->
          <div class="tx-date">
            {{ formatDate(tx.entrydt) }}
          </div>

          <!-- Divider -->
          <div class="tx-divider"></div>

          <!-- Right: Transaction Info -->
          <div class="tx-details">
            <div class="tx-pin selectable">
              {{ formatToken(tx.responsepin) }}
              <ion-icon
                :icon="copyOutline"
                class="copy-icon"
                @click="copyToClipboard(tx.responsepin)"
              />
            </div>

            <div class="tx-amount">₦{{ (tx.amount / 100).toLocaleString() }} :: {{ tx.units || 'N/A' }}</div>

            <div class="tx-meter selectable">
              Meter: {{ tx.accountno }}
              <ion-icon
                :icon="copyOutline"
                class="copy-icon"
                @click="copyToClipboard(tx.accountno)"
              />
            </div>

            <div class="tx-edc">EDC: {{ tx.pid.toUpperCase() }}</div>
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
  IonIcon,
  toastController
} from '@ionic/vue';
import { copyOutline } from 'ionicons/icons';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';
import HeaderComponent from '../components/HeaderComponent.vue';
import { useElectricityStore } from '@/stores/electricityStore'

const electricityStore = useElectricityStore()
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const usageChartCanvas = ref(null);
const usageData = ref([]);
const transactionHistory = ref([]);
const isLoading = ref(true);

const userid = localStorage.getItem('userId');

const fetchTransactionHistory = async () => {
  isLoading.value = true;
  const data = { userid, status: 1 };

  try {
    const res = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserTransaction',
      data,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (Array.isArray(res.data)) {
      transactionHistory.value = res.data;
    } else {
      console.error('❌ Unexpected response format:', res.data);
    }
  } catch (err) {
    console.error('❌ Failed to fetch transactions:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchUsageChartData = async () => {
  const payload = { userid, status: 1 };

  try {
    const res = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserEnergyUsage',
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );

    if (Array.isArray(res.data)) {
      usageData.value = res.data;
      renderChart();
    }
  } catch (err) {
    console.error("❌ Error fetching usage chart data:", err);
  }
};

const formatToken = (token) => {
  if (!token) return '';
  if (token.includes('-')) return token;
  return token.replace(/(.{4})/g, '$1-').replace(/-$/, '');
};

const renderChart = () => {
  if (!usageChartCanvas.value || usageData.value.length === 0) return;

  const ctx = usageChartCanvas.value.getContext('2d');
  if (window.currentChart) window.currentChart.destroy();

  const monthMap = {
    January: "Jan", February: "Feb", March: "Mar", April: "Apr",
    May: "May", June: "Jun", July: "Jul", August: "Aug",
    September: "Sep", October: "Oct", November: "Nov", December: "Dec"
  };

  // const labels = usageData.value.map(item => monthMap[item.monthname] + ' ' + item.year);
  // const values = usageData.value.map(item => item.totalamount / 100);

  const labels = usageData.value.map(item => monthMap[item.monthname] + ' ' + item.year).reverse();
  const values = usageData.value.map(item => item.totalamount / 100).reverse();

  window.currentChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Usage (N)', data: values, backgroundColor: '#7e61ff', borderRadius: 4, borderSkipped: false }] },
    options: {
      responsive: true,
      plugins: { legend: { display: false }, tooltip: { enabled: true } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Amount (N)' } } }
    }
  });
};

const formatDate = (entrydt) => {
  const dt = new Date(entrydt);
  return dt.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};


const copyToClipboard = async (text ) => {
  let success = false;

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      success = true;
    } else {
      throw new Error("navigator.clipboard not available");
    }
  } catch (err) {
    console.warn("Clipboard API failed, using fallback:", err);

    // Fallback: create temporary textarea
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed"; // avoid scrolling to bottom
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      success = document.execCommand("copy");
    } catch (e) {
      console.error("Fallback copy failed:", e);
      success = false;
    }
    document.body.removeChild(textarea);
  }

  // ✅ Always show toast
  const toast = await toastController.create({
    message: success ? "Copied to clipboard!" : "Copy failed",
    duration: 1500,
    color: success ? "success" : "danger"
  });
  await toast.present();
};


onMounted(() => {
  fetchTransactionHistory();
  fetchUsageChartData();
});

// 👇 NEW — react to store updates
watch(
  () => electricityStore.refreshKey,
  async (newVal, oldVal) => {
    if (newVal !== oldVal) {
      console.log('🔄 Refreshing usage data due to new purchase...')
      await fetchTransactionHistory()
      await fetchUsageChartData()
    }
  }
)
</script>

<style scoped>
.usage-content {
  position: relative;
  background: linear-gradient(180deg, #7b2c7e 0%, #5a1a5d 100%);
  color: white;
}


.page-body {
  padding-top: 90px; 
}

/* Make text selectable */
.selectable {
  user-select: text;
  -webkit-user-select: text;
  -moz-user-select: text;
  -ms-user-select: text;
}

.copy-icon {
  font-size: 14px;
  margin-left: 6px;
  vertical-align: middle;
  color: #ffc857;
  cursor: pointer;
}

</style>


<style scoped>
.usage-page {
  --ion-background-color: linear-gradient(180deg, #7b2c7e 0%, #5a1a5d 100%);; /* Your purple background */
  color: white;
}

.chart-container {
  background: #f4f8ff;
  border-radius: 20px;
  padding: 12px;
  margin-bottom: 24px;
  margin-top: 24px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative; /* Important: makes this the positioning context */
  min-height: 200px; /* Ensure container has minimum height */
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-loader-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(244, 248, 255, 0.9); /* Match chart container background */
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
}

.loader-text {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
}

/* Override the global loader-bars positioning for this specific case */
.chart-container .loader-bars {
  position: static; /* Reset from absolute */
  transform: none; /* Reset transforms */
  margin: 0 auto;
}

.chart-canvas {
  align-items: center;
}

.chart-image {
  width: 90%;
  border-radius: 16px;
  background: #e6f0ff;
  padding: 8px;
}

.chart-title {
  margin-top: 24px;
}

.toolbar {
  margin-bottom: 30px;
}

.section-title {
  font-size: 1.2rem;
  margin: 0 16px;
  color: #fff;
  font-weight: bold;
}

.history-list {
  padding: 0 16px;
  margin-top: 10px;
}

.history-line {
  border-bottom: 1px dotted white;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}


.tab-bar {
  background: white;
  padding-bottom: env(safe-area-inset-bottom);
}

ion-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #001845;
}

ion-label {
  font-size: 12px;
}

canvas {
  width: 90% !important;
  max-height: 250px;
}

.tx-row {
  display: flex;
  align-items: stretch; /* <-- stretch to full height of the row */
  gap: 10px;
  margin-bottom: 16px;
}

.tx-date {
  width: 90px;
  font-size: 0.8rem;
  color: #fff;
  margin-left: 24px;
}

.tx-divider {
  width: 3px;
  height: auto;
  background: orange;
  border-radius: 4px;
  margin-top: 2px;
}

.tx-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: white;
  font-size: 0.85rem;
}

.tx-pin {
  font-weight: bold;
  font-size: 1.1rem;
  letter-spacing: 0.5px;
}

.tx-amount {
  color: #ffc857;
}

.tx-meter,
.tx-edc {
  opacity: 0.8;
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

</style>
