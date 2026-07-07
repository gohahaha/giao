<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="活动名称"><el-input v-model="searchForm.activityName" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="类型"><el-select v-model="searchForm.activityType" placeholder="请选择" clearable><el-option label="线上" value="线上" /><el-option label="线下" value="线下" /><el-option label="混合" value="混合" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable><el-option :value="0" label="计划中" /><el-option :value="1" label="进行中" /><el-option :value="2" label="已完成" /><el-option :value="3" label="已取消" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增活动</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="activityName" label="活动名称" min-width="180" /><el-table-column prop="activityType" label="类型" width="80" />
        <el-table-column prop="budget" label="预算" width="120" /><el-table-column prop="actualCost" label="实际花费" width="120" />
        <el-table-column prop="participantCount" label="参与人数" width="90" /><el-table-column prop="leadCount" label="获取线索" width="90" />
        <el-table-column prop="startDate" label="开始日期" width="110" /><el-table-column prop="endDate" label="结束日期" width="110" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag :type="['info','warning','success','danger'][row.status]">{{['计划中','进行中','已完成','已取消'][row.status]}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑活动':'新增活动'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="24"><el-form-item label="活动名称" prop="activityName"><el-input v-model="form.activityName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="类型"><el-select v-model="form.activityType" style="width:100%"><el-option label="线上" value="线上" /><el-option label="线下" value="线下" /><el-option label="混合" value="混合" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="计划中" /><el-option :value="1" label="进行中" /><el-option :value="2" label="已完成" /><el-option :value="3" label="已取消" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="预算"><el-input-number v-model="form.budget" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="实际花费"><el-input-number v-model="form.actualCost" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="开始日期"><el-date-picker v-model="form.startDate" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="结束日期"><el-date-picker v-model="form.endDate" type="date" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getMarketingList,addMarketing,updateMarketing,deleteMarketing,batchDeleteMarketings } from '@/api/marketing'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,activityName:'',activityType:'',status:null})
const form=reactive({activityName:'',activityType:'',status:0,budget:0,actualCost:0,startDate:'',endDate:''})
const rules={activityName:[{required:true,message:'请输入活动名称',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getMarketingList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.activityName='';searchForm.activityType='';searchForm.status=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='status'?0:k==='budget'?0:k==='actualCost'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateMarketing(editId.value,form):await addMarketing(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteMarketing(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteMarketings(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
