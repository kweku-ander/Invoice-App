<template>
  <div class="home container">
    <!-- Header -->
    <div class="header flex">
      <div class="left flex flex-column">
        <h1>Invoices</h1>
        <span> {{ numberOfInvoices }} </span>
      </div>
      <div class="right flex">
        <div class="filter flex" @click="toggleFilterMenu">
          <span
            >Filter by status <span v-if="filteredInvoice">: {{ filteredInvoice }}</span>
          </span>
          <img src="@/assets/icon-arrow-down.svg" alt="" />
          <ul class="filter-menu" v-show="filterMenu">
            <li @click="filterInvoice">Draft</li>
            <li @click="filterInvoice">Pending</li>
            <li @click="filterInvoice">Paid</li>
            <li @click="filterInvoice">Clear Filter</li>
          </ul>
        </div>
        <div class="button flex" @click="newInvoice">
          <div class="inner-button flex">
            <img src="@/assets/icon-plus.svg" alt="" />
          </div>
          <span>New Invoice</span>
        </div>
      </div>
    </div>

    <!-- Invoices -->
    <div v-if="invoiceData.length > 0">
      <Invoice v-for="(invoice, index) in filteredData" :invoice="invoice" :key="index" />
    </div>
    <div v-else class="empty flex flex-column">
      <img src="../assets/illustration-empty.svg" alt="image" />
      <h3>There are no Invoices</h3>
      <p>Click on the New Invoice button to create new invoice</p>
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import Invoice from '../components/Invoice.vue'
export default {
  name: 'home',
  components: { Invoice },
  data() {
    return {
      filterMenu: null,
      filteredInvoice: null,
      numberOfInvoices: null
    }
  },
  created() {
    this.CalInvoices()
  },
  methods: {
    ...mapMutations(['TOGGLE_INVOICE']),
    newInvoice() {
      this.TOGGLE_INVOICE()
    },

    toggleFilterMenu() {
      this.filterMenu = !this.filterMenu
    },

    filterInvoice(e) {
      if (e.target.innerText === 'Clear Filter') {
        this.filteredInvoice = null
        return
      }
      this.filteredInvoice = e.target.innerText
    },
    CalInvoices() {
      if (this.invoiceData.length <= 1) {
        this.numberOfInvoices = `There is ${this.invoiceData.length} total invoice`
        return
      }

      this.numberOfInvoices = `There are ${this.invoiceData.length} total invoices`
    }
  },
  computed: {
    ...mapState(['invoiceData']),

    filteredData() {
      return this.invoiceData.filter((invoice) => {
        if (this.filteredInvoice === 'Draft') {
          return invoice.invoiceDraft === true
        }
        if (this.filteredInvoice === 'Pending') {
          return invoice.invoiceDraft === true
        }
        if (this.filteredInvoice === 'Paid') {
          return invoice.invoicePaid === true
        }
        return invoice
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.home {
  color: white;

  .header {
    margin-bottom: 65px;

    .left,
    .right {
      flex: 1;
    }

    .right {
      justify-content: flex-end;
      align-items: center;

      .button,
      .filter {
        align-items: center;

        span {
          font-size: 12px;
        }
      }

      .filter {
        position: relative;
        margin-right: 40px;
        cursor: pointer;

        img {
          margin-left: 12px;
          width: 9px;
          height: 5px;
        }

        .filter-menu {
          width: 120px;
          position: absolute;
          top: 25px;
          list-style: none;
          background-color: #1e2139;
          box-shadow:
            0 4px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);

          li {
            cursor: pointer;
            font-size: 12px;
            padding: 10px 20px;

            &:hover {
              color: #1e2139;
              background-color: white;
            }
          }
        }
      }

      .button {
        padding: 8px 10px;
        background-color: #7c5dfa;
        border-radius: 40px;

        .inner-button {
          margin-right: 8px;
          background-color: white;
          border-radius: 50px;
          padding: 8px;
          align-items: center;
          justify-content: center;

          img {
            width: 10px;
            height: 10px;
          }
        }
      }
    }
  }

  .empty {
    margin-top: 160px;
    align-items: center;

    img {
      width: 214px;
      height: 200px;
    }

    h3 {
      font-size: 28px;
      margin-top: 40px;
    }

    p {
      text-align: center;
      max-width: 224px;
      font-size: 12px;
      font-weight: 300;
      margin-top: 16px;
    }
  }
}
</style>
