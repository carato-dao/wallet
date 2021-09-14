import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        name: 'Dashboard',
        component: () =>
            import ('../views/Dashboard.vue')
    },

    {
        path: '/pay/:address/:amount',
        name: 'TransactionPay',
        component: () =>
            import ('../views/Transaction.vue')
    },

    {
        path: '/transaction/qrcode',
        name: 'TransactionQR',
        component: () =>
            import ('../views/Transaction.vue')
    },

    {
        path: '/transaction/receive',
        name: 'Receive',
        component: () =>
            import ('../views/Transaction.vue')
    },

    {
        path: '/transaction',
        name: 'Transaction',
        component: () =>
            import ('../views/Transaction.vue')
    },

    {
        path: '/settings',
        name: 'Settings',
        component: () =>
            import ('../views/Settings.vue')
    }

]

const router = new VueRouter({
    routes
})

export default router