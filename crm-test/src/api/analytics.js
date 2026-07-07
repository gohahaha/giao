import request from '@/utils/request'

const BASE = '/analytics'

export function getDashboard() {
  return request.get(BASE + '/dashboard')
}

export function getCustomerIndustry() {
  return request.get(BASE + '/customer-industry')
}

export function getSalesFunnel() {
  return request.get(BASE + '/sales-funnel')
}

export function getMonthlySales() {
  return request.get(BASE + '/monthly-sales')
}

export function getTicketStats() {
  return request.get(BASE + '/ticket-stats')
}
