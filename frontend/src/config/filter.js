import Vue from 'vue'

import { formatToBRL } from 'brazilian-values'
import { formatDate } from '@/global'
import moment from 'moment'

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

    return formatDate(new Date(value).toISOString().substr(0, 10))
})

Vue.filter('dateTime', value => {
    if (!value) return ""

    return moment(value).format('MM/DD/YYYY hh:mm')
})