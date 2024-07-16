<template>
  <div @click="checkClick" ref="invoicewrap" class="invoice-wrap flex flex-column">
    <form @submit.prevent="submitForm" class="invoice-content">
      <Loading v-if="loading" />
      <h1 v-if="!editInvoice">New Invoice</h1>
      <h1 v-else>Edit Invoice</h1>

      <!-- Bill From -->
      <div class="bill-form flex flex-column">
        <h4>Bill From</h4>
        <div class="input flex flex-column">
          <label for="billerStreetAddress">Street Address</label>
          <input type="text" required id="billerStreetAddress" v-model="billerStreetAddress" />
        </div>
        <div class="flex location-details">
          <div class="input flex flex-column">
            <label for="billerCity">City</label>
            <input type="text" required id="billerCity" v-model="billerCity" />
          </div>
          <div class="input flex flex-column">
            <label for="billerZipCode">Zip Code</label>
            <input type="text" required id="billerZipCode" v-model="billerZipCode" />
          </div>
          <div class="input flex flex-column">
            <label for="billerCountry">Country</label>
            <input type="text" required id="billerCountry" v-model="billerCountry" />
          </div>
        </div>
      </div>

      <!-- Bill To -->
      <div class="bill-to flex flex-column">
        <h4>Bill To</h4>
        <div class="input flex flex-column">
          <label for="clientName">Client's Name</label>
          <input type="text" required id="clientName" v-model="clientName" />
        </div>
        <div class="input flex flex-column">
          <label for=" clientEmail">Client's Email</label>
          <input type="text" required id=" clientEmail" v-model="clientEmail" />
        </div>
        <div class="input flex flex-column">
          <label for="clientStreetAddress">Street Address</label>
          <input type="text" required id="clientStreetAddress" v-model="clientStreetAddress" />
        </div>
        <div class="flex location-details">
          <div class="input flex flex-column">
            <label for="clientCity">Client's City</label>
            <input type="text" required id="clientCity" v-model="clientCity" />
          </div>
          <div class="input flex flex-column">
            <label for="clientZipCode">Zip Code</label>
            <input type="text" required id="clientZipCode" v-model="clientZipCode" />
          </div>
          <div class="input flex flex-column">
            <label for="clientCountry">Country</label>
            <input type="text" required id="clientCountry" v-model="clientCountry" />
          </div>
        </div>
      </div>

      <!-- Invoice Work Details -->
      <div class="invoice-work flex flex-column">
        <div class="payment flex">
          <div class="input flex flex-column">
            <label for="invoiceDate">Invoice Date</label>
            <input type="text" disabled id="invoiceDate" v-model="invoiceDate" />
          </div>
          <div class="input flex flex-column">
            <label for="paymentDueDate">Payment Due</label>
            <input type="text" disabled id="paymentDueDate" v-model="paymentDueDate" />
          </div>
        </div>
        <div class="input flex flex-column">
          <label for="paymentTerms">Payment Terms</label>
          <select required id="paymentTerms" v-model="paymentTerms">
            <option value="30">Net 30 Days</option>
            <option value="60">Net 60 Days</option>
          </select>
        </div>
        <div class="input flex flex-column">
          <label for="productDescription">Product Description</label>
          <input type="text" required id="productDescription" v-model="productDescription" />
        </div>
        <div class="work-items">
          <h2>Item List</h2>
          <table class="item-list">
            <tr class="table-heading flex">
              <th class="item-name">Item Name</th>
              <th class="qty">Qty</th>
              <th class="price">Price</th>
              <th class="total">Total</th>
            </tr>
            <tr class="table-items flex" v-for="(item, index) in invoiceItemList" :key="index">
              <td class="item-name"><input type="text" v-model="item.itemName" /></td>
              <td class="qty"><input type="text" v-model="item.qty" /></td>
              <td class="price"><input type="text" v-model="item.price" /></td>
              <td class="total flex">${{ (item.total = item.qty * item.price) }}</td>
              <img @click="deleteInvoiceItem(item.id)" src="@/assets/icon-delete.svg" alt="" />
            </tr>
          </table>
          <div class="flex button" @click="addNewInvoiceItem">
            <img src="@/assets/icon-plus.svg" alt="" />
            Add New Item
          </div>
        </div>
      </div>

      <!-- Save/Exit -->
      <div class="save flex">
        <div class="left">
          <button type="button" @click="closeInvoice" class="red">Cancel</button>
        </div>
        <div class="right flex">
          <button v-if="!editInvoice" type="submit" class="dark-purple" @click="saveDraft">
            Save Draft
          </button>
          <button v-if="!editInvoice" type="submit" class="purple" @click="createInvoice">
            Create Invoice
          </button>
          <button v-if="editInvoice" type="submit" class="purple">Update Invoice</button>
        </div>
      </div>
      <Modal v-if="modalActive" />
    </form>
  </div>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex'
import { uid } from 'uid'
import db from '../firebase/firebaseinit'
import Modal from '../components/Modal.vue'
import { collection, doc, setDoc, updateDoc } from 'firebase/firestore'
import Loading from './Loading.vue'
export default {
  name: 'invoiceModal',
  components: { Loading },
  data() {
    return {
      docId: null,
      billerStreetAddress: null,
      billerCity: null,
      billerZipCode: null,
      billerCountry: null,
      clientName: null,
      clientEmail: null,
      clientStreetAddress: null,
      clientCity: null,
      clientZipCode: null,
      clientCountry: null,
      invoiceDateUnix: null,
      invoicePending: null,
      invoiceDraft: null,
      invoiceItemList: [],
      invoiceTotal: 0,
      invoiceDate: null,
      paymentTerms: null,
      paymentDueDateUnix: null,
      paymentDueDate: null,
      productDescription: null,
      dateOptions: { year: 'numeric', month: 'short', day: 'numeric' },
      loading: null
    }
  },
  created() {
    if (!this.editInvoice) {
      this.invoiceDateUnix = Date.now()
      this.invoiceDate = new Date(this.invoiceDateUnix).toLocaleDateString(
        'en-us',
        this.dateOptions
      )
    }

    if (this.editInvoice) {
      const invoiceData = this.currentInvoice[0]
      this.docId = invoiceData.docId
      this.billerStreetAddress = invoiceData.billerStreetAddress
      this.billerCity = invoiceData.billerCity
      this.billerZipCode = invoiceData.billerZipCode
      this.billerCountry = invoiceData.billerCountry
      this.clientName = invoiceData.clientName
      this.clientEmail = invoiceData.clientEmail
      this.clientStreetAddress = invoiceData.clientStreetAddress
      this.clientCity = invoiceData.clientCity
      this.clientZipCode = invoiceData.clientZipCode
      this.clientCountry = invoiceData.clientCountry
      this.invoiceDateUnix = invoiceData.invoiceDateUnix
      this.invoiceDate = invoiceData.invoiceDate
      this.paymentTerms = invoiceData.paymentTerms
      this.paymentDueDateUnix = invoiceData.paymentDueDateUnix
      this.paymentDueDate = invoiceData.paymentDueDate
      this.productDescription = invoiceData.productDescription
      this.invoicePending = invoiceData.invoicePending
      this.invoiceDraft = invoiceData.invoiceDraft
      this.invoiceItemList = invoiceData.invoiceItemList
      this.invoiceTotal = invoiceData.invoiceTotal
    }
  },
  methods: {
    ...mapMutations(['TOGGLE_INVOICE', 'TOGGLE_MODAL']),
    ...mapActions(['UPDATE_INVOICE', 'GET_INVOICES']),

    checkClick(e) {
      if (e.target === this.$refs.invoicewrap) {
        this.TOGGLE_MODAL()
        console.log('Helloooo')
      }
    },

    closeInvoice() {
      this.TOGGLE_MODAL()
    },
    async addNewInvoiceItem() {
      this.invoiceItemList.push({
        id: uid(),
        itemName: '',
        qty: '',
        price: 0,
        total: 0
      })
    },
    deleteInvoiceItem(id) {
      this.invoiceItemList = this.invoiceItemList.filter((item) => item.id !== id)
    },
    calInvoiceTotal() {
      this.invoiceTotal = 0
      this.invoiceItemList.forEach((item) => (this.invoiceTotal += item.total))
    },
    createInvoice() {
      this.invoicePending = true
    },
    saveDraft() {
      this.invoiceDraft = true
    },
    async uploadInvoice() {
      if (this.invoiceItemList.length <= 0) {
        alert('Please fill out work items!')
        return
      }

      this.loading = true

      this.calInvoiceTotal()

      const dataBase = doc(collection(db, 'invoices'))
      await setDoc(dataBase, {
        invoiceId: uid(6),
        billerStreetAddress: this.billerStreetAddress,
        billerCity: this.billerCity,
        billerZipCode: this.billerZipCode,
        billerCountry: this.billerCountry,
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        clientStreetAddress: this.clientStreetAddress,
        clientCity: this.clientCity,
        clientZipCode: this.clientZipCode,
        clientCountry: this.clientCountry,
        invoiceDateUnix: this.invoiceDateUnix,
        invoicePending: this.invoicePending,
        invoiceDraft: this.invoiceDraft,
        invoiceItemList: this.invoiceItemList,
        invoiceTotal: this.invoiceTotal,
        invoiceDate: this.invoiceDate,
        paymentTerms: this.paymentTerms,
        paymentDueDateUnix: this.paymentDueDateUnix,
        paymentDueDate: this.paymentDueDate,
        productDescription: this.productDescription,
        invoicePaid: null
      })

      this.loading = false
      this.TOGGLE_INVOICE()
      this.GET_INVOICES()
    },
    async updateInvoice() {
      if (this.invoiceItemList.length <= 0) {
        alert('Please fill out work items!')
        return
      }

      this.loading = true

      this.calInvoiceTotal()

      const dataBase = doc(collection(db, 'invoices'), this.docId)
      await updateDoc(dataBase, {
        billerStreetAddress: this.billerStreetAddress,
        billerCity: this.billerCity,
        billerZipCode: this.billerZipCode,
        billerCountry: this.billerCountry,
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        clientStreetAddress: this.clientStreetAddress,
        clientCity: this.clientCity,
        clientZipCode: this.clientZipCode,
        clientCountry: this.clientCountry,
        invoiceItemList: this.invoiceItemList,
        invoiceTotal: this.invoiceTotal,
        paymentTerms: this.paymentTerms,
        paymentDueDateUnix: this.paymentDueDateUnix,
        paymentDueDate: this.paymentDueDate,
        productDescription: this.productDescription
      })

      this.loading = false

      const data = {
        docId: this.docId,
        routeId: this.$route.params.invoiceId
      }
      this.UPDATE_INVOICE(data)
    },
    submitForm() {
      if (this.editInvoice) {
        this.updateInvoice()
        return
      }
      this.uploadInvoice()
    }
  },
  computed: {
    ...mapState(['editInvoice', 'currentInvoice', 'modalActive'])
  },
  watch: {
    paymentTerms() {
      const futureDate = new Date()
      this.paymentDueDateUnix = futureDate.setDate(
        futureDate.getDate() + parseInt(this.paymentTerms)
      )
      this.paymentDueDate = new Date(this.paymentDueDateUnix).toLocaleDateString(
        'en-us',
        this.dateOptions
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.invoice-wrap {
  position: fixed;
  top: 0;
  left: 0;
  background-color: transparent;
  width: 100%;
  height: 100vh;
  -ms-overflow-style: none; /* Internet Explorer 10+ */
  scrollbar-width: none;
  overflow: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  @media (min-width: 900px) {
    left: 90px;
  }

  .invoice-content {
    padding: relative;
    padding: 56px;
    max-width: 700px;
    width: 100%;
    background-color: #141625;
    color: white;
    box-shadow:
      10px 4px 6px -1px rgba(0, 0, 0, 0.2),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);

    h1 {
      color: white;
      margin-bottom: 20px;
    }

    h2 {
      margin-bottom: 16px;
      font-size: 18px;
      color: #777f98;
    }

    h4 {
      color: #7c5dfa;
      font-size: 12px;
      margin-bottom: 24px;
    }

    // Bill to / Bill from
    .bill-to,
    .bill-from {
      margin-bottom: 48px;

      .location-details {
        gap: 16px;
        div {
          flex: 1;
        }
      }
    }

    // Invoice Work
    .invoice-work {
      .payment {
        gap: 24px;
        div {
          flex: 1;
        }
      }

      .work-items {
        .item-list {
          width: 100%;

          // Item Table Styling
          .table-heading,
          .table-items {
            gap: 16px;
            font-size: 12px;

            .item-name {
              flex-basis: 50%;
            }

            .qty {
              flex-basis: 10%;
            }

            .price {
              flex-basis: 20%;
            }

            .total {
              flex-basis: 20%;
              align-self: center;
            }
          }
          .table-heading {
            margin-bottom: 16px;

            th {
              text-align: left;
            }
          }
          .table-items {
            position: relative;
            margin-bottom: 24px;

            img {
              position: absolute;
              top: 15px;
              right: 0;
              width: 12px;
              height: 16px;
            }
          }
        }

        .button {
          color: white;
          background-color: #252945;
          align-items: center;
          justify-content: center;
          width: 100%;

          img {
            margin-right: 4px;
          }
        }
      }
    }
    .save {
      margin-top: 60px;

      div {
        flex: 1;
      }

      .right {
        justify-content: flex-end;
      }
    }
  }

  .input {
    margin-bottom: 24px;
  }
  label {
    font-size: 12px;
    margin-bottom: 6px;
  }

  input,
  select {
    width: 100%;
    background-color: #1e2139;
    color: white;
    border-radius: 4px;
    padding: 12px 4px;
    border: none;

    &:focus {
      outline: none;
    }
  }
}
</style>
