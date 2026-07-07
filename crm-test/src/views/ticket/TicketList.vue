<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="工单标题"><el-input v-model="searchForm.title" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="优先级"><el-select v-model="searchForm.priority" placeholder="请选择" clearable><el-option :value="1" label="低" /><el-option :value="2" label="中" /><el-option :value="3" label="高" /><el-option :value="4" label="紧急" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable><el-option :value="0" label="待处理" /><el-option :value="1" label="处理中" /><el-option :value="2" label="已解决" /><el-option :value="3" label="已关闭" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新増工单</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="ticketNo" label="工单编号" width="150" /><el-table-column prop="title" label="标题" min-width="180" />
        <el-table-column prop="priority" label="优先级" width="80"><template #default="{row}"><el-tag :type="['','info','warning','danger','danger'][row.priority]">{{['','低','中','高','紧急'][row.priority]}}</el-tag></template></el-table-column>
        <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag :type="['info','warning','success',''][row.status]">{{['待处理','处理中','已解决','已关闭'][row.status]}}</el-tag></template></el-table-column>
        <el-table-column prop="slaDeadline" label="SLA截止" width="170" />
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑工单':'新増工单'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="工单编号" prop="ticketNo"><el-input v-model="form.ticketNo" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="标题" prop="title"><el-input v-model="form.title" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="客户ID"><el-input v-model="form.customerId" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="优先级"><el-select v-model="form.priority" style="width:100%"><el-option :value="1" label="低" /><el-option :value="2" label="中" /><el-option :value="3" label="高" /><el-option :value="4" label="紧急" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="待处理" /><el-option :value="1" label="处理中" /><el-option :value="2" label="已解决" /><el-option :value="3" label="已关闭" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="SLA截止"><el-date-picker v-model="form.slaDeadline" type="datetime" style="width:100%" value-format="YYYY-MM-DD HH:mm:ss" /></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="描述"><el-input v-model="form.description" type="textarea" :rows="3" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getTicketList,addTicket,updateTicket,deleteTicket,batchDeleteTickets } from '@/api/ticket'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,title:'',priority:null,status:null})
const form=reactive({ticketNo:'',customerId:'',contactId:'',title:'',description:'',priority:1,status:0,slaDeadline:'',solution:''})
const rules={title:[{required:true,message:'请输入标题',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getTicketList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.title='';searchForm.priority=null;searchForm.status=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='priority'?1:k==='status'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateTicket(editId.value,form):await addTicket(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteTicket(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteTickets(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
