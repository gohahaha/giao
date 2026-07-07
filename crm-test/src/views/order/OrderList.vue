<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="订单编号"><el-input v-model="searchForm.orderNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable><el-option :value="0" label="待支付" /><el-option :value="1" label="已支付" /><el-option :value="2" label="已发货" /><el-option :value="3" label="已完成" /><el-option :value="4" label="已取消" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增订单</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="orderNo" label="订单编号" width="160" /><el-table-column prop="amount" label="金额(元)" width="130" />
        <el-table-column prop="paymentMethod" label="支付方式" width="100" />
        <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="['warning','success','primary','success','info'][row.status]">{{['待支付','已支付','已发货','已完成','已取消'][row.status]}}</el-tag></template></el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑订单':'新增订单'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="订单编号" prop="orderNo"><el-input v-model="form.orderNo" /></el-form-item>
        <el-form-item label="客户ID"><el-input v-model="form.customerId" /></el-form-item>
        <el-form-item label="金额"><el-input-number v-model="form.amount" :min="0" :precision="2" style="width:100%" /></el-form-item>
        <el-form-item label="支付方式"><el-select v-model="form.paymentMethod" style="width:100%"><el-option label="微信" value="微信" /><el-option label="支付宝" value="支付宝" /><el-option label="银行转账" value="银行转账" /><el-option label="现金" value="现金" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="待支付" /><el-option :value="1" label="已支付" /><el-option :value="2" label="已发货" /><el-option :value="3" label="已完成" /><el-option :value="4" label="已取消" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getOrderList,addOrder,updateOrder,deleteOrder,batchDeleteOrders } from '@/api/order'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,orderNo:'',status:null})
const form=reactive({orderNo:'',customerId:'',amount:0,status:0,paymentMethod:''})
const rules={orderNo:[{required:true,message:'请输入订单编号',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getOrderList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.orderNo='';searchForm.status=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='status'?0:k==='amount'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateOrder(editId.value,form):await addOrder(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteOrder(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteOrders(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
