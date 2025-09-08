<template>
  <ion-page class="usage-page" fullscreen>
    <ion-content class="ion-padding custom-bg" fullscreen>
      <HeaderComponent />
<!-- 
      <ion-toolbar class="toolbar" color="#4b1248"></ion-toolbar> -->
      <!-- Energy Usage Chart -->
      <div style="text-align: center">
        <h2 class="section-title" >Energy Usage</h2>
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
          <div class="tx-pin">{{ formatToken(tx.responsepin) }}</div>
          <div class="tx-amount">₦{{ (tx.amount / 100).toLocaleString() }} :: {{ tx.units || 'N/A' }}</div>
          <div class="tx-meter">Meter: {{ tx.accountno }}</div>
          <div class="tx-edc">EDC: {{ tx.pid.toUpperCase() }}</div>
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
  IonToolbar
} from '@ionic/vue';

import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import HeaderComponent from '../components/HeaderComponent.vue';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

// Canvas reference
const usageChartCanvas = ref(null);

// Loader and data
const usageData = ref([]);
const transactionHistory = ref([]);
const isLoading = ref(true);

// ⚡ Dummy email for now — replace with actual logged-in user email
const email = localStorage.getItem('email');;
const userid = localStorage.getItem('userId');

// Fetch usage + transaction data
const fetchTransactionHistory = async () => {
  isLoading.value = true;
  const userid = localStorage.getItem('userId'); // this was set after login
  const data = {
    userid,
    status: 1
  };



  try {
    const res = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserTransaction',
      data,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (Array.isArray(res.data)) {
      transactionHistory.value = res.data;
      console.log("✅ Loaded transactions:", res.data);
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
  const userid = localStorage.getItem('userId');
  const payload = {
    userid,
    status: 1
  };

  try {
    const res = await axios.post(
      'https://srwv0srmfl.execute-api.us-west-2.amazonaws.com/Prod/GetUserEnergyUsage',
      payload,
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (Array.isArray(res.data)) {
      usageData.value = res.data;
      renderChart();
    } else {
      console.error("❌ Unexpected usage data format:", res.data);
    }
  } catch (err) {
    console.error("❌ Error fetching usage chart data:", err);
  }
};

const formatToken = (token) => {
  if (!token) return '';
  
  // Check if token is already formatted (contains dashes)
  if (token.includes('-')) {
    return token; // Return as-is if already formatted
  }
  
  // Only format if it's not already formatted
  return token.replace(/(.{4})/g, '$1-').replace(/-$/, ''); // Add dashes every 4 digits
};


// Chart rendering logic
const renderChart = () => {
  if (!usageChartCanvas.value || usageData.value.length === 0) return;

  const ctx = usageChartCanvas.value.getContext('2d');

  // Clear existing chart (if needed)
  if (window.currentChart) {
    window.currentChart.destroy();
  }

const monthMap = {
  January: "Jan",
  February: "Feb",
  March: "Mar",
  April: "Apr",
  May: "May",
  June: "Jun",
  July: "Jul",
  August: "Aug",
  September: "Sep",
  October: "Oct",
  November: "Nov",
  December: "Dec"
};


  const labels = usageData.value.map(item => monthMap[item.monthname] + ' ' + item.year);
  const values = usageData.value.map(item => item.totalamount / 100); // Convert from Kobo if needed

  window.currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Usage (N)',
        data: values,
        backgroundColor: '#7e61ff',
        borderRadius: 4,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: true }
      },
      scales: {
        y: {
          title: { display: true, text: 'Amount (N)' },
          beginAtZero: true
        },
        x: {
          title: { display: true,}
        }
      }
    }
  });
};

const formatDate = (entrydt) => {
  const dt = new Date(entrydt);
  return dt.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatNaira = (amount) => {
  return Number(amount).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatKwh = (units) => {
  return Number(units).toFixed(1);
};

onMounted(() => {
  fetchTransactionHistory();
  fetchUsageChartData();
});
</script>


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
