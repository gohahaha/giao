import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layout/MainLayout.vue'),
    redirect: '/dashboard',
    children: [
      { path: 'dashboard', name: 'Dashboard', component: () => import('@/views/dashboard/Dashboard.vue'), meta: { title: '首页' } },
      { path: 'customer', name: 'Customer', component: () => import('@/views/customer/CustomerList.vue'), meta: { title: '客户管理' } },
      { path: 'contact', name: 'Contact', component: () => import('@/views/contact/ContactList.vue'), meta: { title: '联系人管理' } },
      { path: 'lead', name: 'Lead', component: () => import('@/views/lead/LeadList.vue'), meta: { title: '销售线索' } },
      { path: 'opportunity', name: 'Opportunity', component: () => import('@/views/opportunity/OpportunityList.vue'), meta: { title: '商机管理' } },
      { path: 'quote', name: 'Quote', component: () => import('@/views/quote/QuoteList.vue'), meta: { title: '报价管理' } },
      { path: 'contract', name: 'Contract', component: () => import('@/views/contract/ContractList.vue'), meta: { title: '合同管理' } },
      { path: 'order', name: 'Order', component: () => import('@/views/order/OrderList.vue'), meta: { title: '订单管理' } },
      { path: 'marketing', name: 'Marketing', component: () => import('@/views/marketing/MarketingList.vue'), meta: { title: '市场活动' } },
      { path: 'ticket', name: 'Ticket', component: () => import('@/views/ticket/TicketList.vue'), meta: { title: '服务工单' } },
      { path: 'analytics', name: 'Analytics', component: () => import('@/views/analytics/Analytics.vue'), meta: { title: '数据分析' } },
      { path: 'system', name: 'System', component: () => import('@/views/system/SystemUser.vue'), meta: { title: '系统管理' } },
      { path: 'ai', name: 'Ai', component: () => import('@/views/ai/AiService.vue'), meta: { title: 'AI服务' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
