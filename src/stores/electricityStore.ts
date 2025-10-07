import { defineStore } from 'pinia'

/** Type definitions for your electricity transaction */
export interface ElectricityTransaction {
  userId: string | null
  meterNumber: string
  amount: number
  token: string
  provider: string
  date: string // ISO string
}

/** Store state type */
interface ElectricityState {
  lastTransaction: ElectricityTransaction | null
  transactions: ElectricityTransaction[]
  refreshKey: number // 👈 new property for triggering refresh
}

export const useElectricityStore = defineStore('electricity', {
  state: (): ElectricityState => ({
    lastTransaction: JSON.parse(
      localStorage.getItem('lastElectricityTransaction') || 'null'
    ),
    transactions: JSON.parse(
      localStorage.getItem('electricityTransactions') || '[]'
    ),
    refreshKey: 0,
  }),

  actions: {
    /** Save successful purchase details */
    handleSuccessfulElectricityPurchase(transactionData: ElectricityTransaction) {
      this.lastTransaction = transactionData
      this.transactions.unshift(transactionData)

      // Persist to localStorage
      localStorage.setItem(
        'lastElectricityTransaction',
        JSON.stringify(transactionData)
      )
      localStorage.setItem(
        'electricityTransactions',
        JSON.stringify(this.transactions)
      )

      console.log('✅ Electricity purchase saved:', transactionData)
        // 🔁 Trigger refresh for pages watching this
      this.refreshKey++
    },

    /** Clear all electricity data */
    clearTransactions() {
      this.lastTransaction = null
      this.transactions = []
      localStorage.removeItem('lastElectricityTransaction')
      localStorage.removeItem('electricityTransactions')
    },
  },
})
