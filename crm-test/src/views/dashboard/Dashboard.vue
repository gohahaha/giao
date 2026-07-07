<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col :span="4" v-for="item in stats" :key="item.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{ backgroundColor: item.color }">{{ item.icon }}</div>
          <div class="stat-info">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表区 -->
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card header="销售漏斗">
          <div ref="funnelChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="月度销售趋势">
          <div ref="salesChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card header="客户行业分布">
          <div ref="industryChart" style="height: 350px"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card header="工单统计">
          <div ref="ticketChart" style="height: 350px"></div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getDashboard, getSalesFunnel, getMonthlySales, getCustomerIndustry, getTicketStats } from '@/api/analytics'
import * as echarts from 'echarts'

const stats = ref([
  { icon: '👥', label: '客户数', value: 0, color: '#409EFF' },
  { icon: '🎯', label: '销售线索', value: 0, color: '#67C23A' },
  { icon: '💼', label: '商机数', value: 0, color: '#E6A23C' },
  { icon: '📋', label: '订单数', value: 0, color: '#F56C6C' },
  { icon: '🎫', label: '工单数', value: 0, color: '#909399' }
])

const funnelChart = ref(null)
const salesChart = ref(null)
const industryChart = ref(null)
const ticketChart = ref(null)

onMounted(async () => {
  // 仪表盘数据
  try {
    const res = await getDashboard()
    if (res.code === 200) {
      const d = res.data
      stats.value[0].value = d.customerCount || 0
      stats.value[1].value = d.leadCount || 0
      stats.value[2].value = d.opportunityCount || 0
      stats.value[3].value = d.orderCount || 0
      stats.value[4].value = d.ticketCount || 0
    }
  } catch (e) { /* 使用默认值 */ }

  // 销售漏斗
  try {
    const res = await getSalesFunnel()
    const chart = echarts.init(funnelChart.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'funnel',
        left: '10%', width: '80%',
        data: (res.data?.stages || []).map((s, i) => ({
          name: s,
          value: (res.data?.counts || [])[i] || 0
        })),
        label: { show: true, position: 'inside' }
      }]
    })
  } catch (e) { /* ignore */ }

  // 月度销售
  try {
    const res = await getMonthlySales()
    const chart = echarts.init(salesChart.value)
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { data: res.data?.months || [] },
      yAxis: {},
      series: [{
        name: '销售额',
        type: 'bar',
        data: res.data?.amounts || [],
        itemStyle: { color: '#409EFF' }
      }]
    })
  } catch (e) { /* ignore */ }

  // 行业分布
  try {
    const res = await getCustomerIndustry()
    const chart = echarts.init(industryChart.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: ['40%', '70%'],
        data: (res.data?.labels || []).map((l, i) => ({
          name: l,
          value: (res.data?.values || [])[i] || 0
        }))
      }]
    })
  } catch (e) { /* ignore */ }

  // 工单统计
  try {
    const res = await getTicketStats()
    const chart = echarts.init(ticketChart.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '70%',
        data: [
          { name: '待处理', value: res.data?.pending || 0 },
          { name: '处理中', value: res.data?.processing || 0 },
          { name: '已解决', value: res.data?.resolved || 0 },
          { name: 'SLA超时', value: res.data?.slaBreach || 0 }
        ]
      }]
    })
  } catch (e) { /* ignore */ }
})
</script>

<style scoped>
.dashboard { padding: 0; }
.stat-card { display: flex; align-items: center; cursor: pointer; }
.stat-icon { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; margin-right: 12px; flex-shrink: 0; }
.stat-value { font-size: 24px; font-weight: bold; color: #303133; }
.stat-label { font-size: 13px; color: #909399; margin-top: 4px; }
</style>
