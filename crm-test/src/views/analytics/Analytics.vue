<template>
  <div class="page-wrap">
    <el-row :gutter="20">
      <el-col :span="8" v-for="item in statsCards" :key="item.label">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" :style="{backgroundColor:item.color}">{{item.icon}}</div>
          <div><div class="stat-val">{{item.value}}</div><div class="stat-lbl">{{item.label}}</div></div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12"><el-card header="销售漏斗"><div ref="funnelChart" style="height:350px"></div></el-card></el-col>
      <el-col :span="12"><el-card header="月度销售趋势"><div ref="salesChart" style="height:350px"></div></el-card></el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top:20px">
      <el-col :span="12"><el-card header="客户行业分布"><div ref="industryChart" style="height:350px"></div></el-card></el-col>
      <el-col :span="12"><el-card header="工单统计"><div ref="ticketChart" style="height:350px"></div></el-card></el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getDashboard,getSalesFunnel,getMonthlySales,getCustomerIndustry,getTicketStats } from '@/api/analytics'
import * as echarts from 'echarts'
const statsCards=reactive([{icon:'👥',label:'客户总数',value:0,color:'#409EFF'},{icon:'🎯',label:'销售线索',value:0,color:'#67C23A'},{icon:'💼',label:'商机数',value:0,color:'#E6A23C'},{icon:'📋',label:'订单数',value:0,color:'#F56C6C'},{icon:'🎫',label:'工单数',value:0,color:'#909399'},{icon:'💰',label:'总金额(元)',value:0,color:'#409EFF'}])
const funnelChart=ref(null),salesChart=ref(null),industryChart=ref(null),ticketChart=ref(null)
onMounted(async()=>{
  try{const r=await getDashboard();if(r.code===200){const d=r.data;statsCards[0].value=d.customerCount||0;statsCards[1].value=d.leadCount||0;statsCards[2].value=d.opportunityCount||0;statsCards[3].value=d.orderCount||0;statsCards[4].value=d.ticketCount||0}}catch(e){}
  try{const r=await getSalesFunnel();const c=echarts.init(funnelChart.value);c.setOption({tooltip:{trigger:'item'},series:[{type:'funnel',left:'10%',width:'80%',data:(r.data?.stages||[]).map((s,i)=>({name:s,value:(r.data?.counts||[])[i]||0})),label:{show:true,position:'inside'}}]})}catch(e){}
  try{const r=await getMonthlySales();const c=echarts.init(salesChart.value);c.setOption({tooltip:{trigger:'axis'},xAxis:{data:r.data?.months||[]},yAxis:{},series:[{name:'销售额',type:'bar',data:r.data?.amounts||[],itemStyle:{color:'#409EFF'}}]})}catch(e){}
  try{const r=await getCustomerIndustry();const c=echarts.init(industryChart.value);c.setOption({tooltip:{trigger:'item'},series:[{type:'pie',radius:['40%','70%'],data:(r.data?.labels||[]).map((l,i)=>({name:l,value:(r.data?.values||[])[i]||0}))}]})}catch(e){}
  try{const r=await getTicketStats();const c=echarts.init(ticketChart.value);c.setOption({tooltip:{trigger:'item'},series:[{type:'pie',radius:'70%',data:[{name:'待处理',value:r.data?.pending||0},{name:'处理中',value:r.data?.processing||0},{name:'已解决',value:r.data?.resolved||0},{name:'SLA超时',value:r.data?.slaBreach||0}]}]})}catch(e){}
})
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.stat-card{display:flex;align-items:center;gap:12px}.stat-icon{width:48px;height:48px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:24px}.stat-val{font-size:24px;font-weight:bold}.stat-lbl{font-size:13px;color:#909399}</style>
