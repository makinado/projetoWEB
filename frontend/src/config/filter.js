import Vue from 'vue'

import { formatToBRL } from 'brazilian-values'

Vue.filter('currency', value => {
    if (!value) return "R$ 0,00"

    return formatToBRL(value)
})

Vue.filter('decimal', value => {
    if (!value) return "0,00"

    return formatToBRL(value).replace('R$', '')
})

Vue.filter('percent', value => {
    if (!value) return "0,00 %"

    return formatToBRL(value).replace('R$', '') + " %"
})

Vue.filter('date', value => {
    if (!value) return ""

    return new Date(value).toLocaleDateString()
})