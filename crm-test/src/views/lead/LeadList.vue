<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="线索名称"><el-input v-model="searchForm.leadName" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="来源"><el-select v-model="searchForm.source" placeholder="请选择" clearable><el-option label="官网" value="官网" /><el-option label="展会" value="展会" /><el-option label="广告" value="广告" /><el-option label="转介绍" value="转介绍" /></el-select></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable><el-option :value="0" label="新建" /><el-option :value="1" label="跟进中" /><el-option :value="2" label="已转化" /><el-option :value="3" label="已关闭" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增线索</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="leadName" label="线索名称" min-width="150" /><el-table-column prop="companyName" label="公司" width="150" />
        <el-table-column prop="contactName" label="联系人" width="100" /><el-table-column prop="phone" label="电话" width="130" />
        <el-table-column prop="source" label="来源" width="80" />
        <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="['info','warning','success','danger'][row.status]">{{['新建','跟进中','已转化','已关闭'][row.status]}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑线索':'新增线索'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="线索名称" prop="leadName"><el-input v-model="form.leadName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="公司名称"><el-input v-model="form.companyName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系人"><el-input v-model="form.contactName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="来源"><el-select v-model="form.source" style="width:100%"><el-option label="官网" value="官网" /><el-option label="展会" value="展会" /><el-option label="广告" value="广告" /><el-option label="转介绍" value="转介绍" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="新建" /><el-option :value="1" label="跟进中" /><el-option :value="2" label="已转化" /><el-option :value="3" label="已关闭" /></el-select></el-form-item></el-col>
          <el-col :span="24"><el-form-item label="备注"><el-input v-model="form.remark" type="textarea" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getLeadList,addLead,updateLead,deleteLead,batchDeleteLeads } from '@/api/lead'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,leadName:'',source:'',status:null})
const form=reactive({leadName:'',companyName:'',contactName:'',phone:'',email:'',source:'',status:0,remark:''})
const rules={leadName:[{required:true,message:'请输入线索名称',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getLeadList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.leadName='';searchForm.source='';searchForm.status=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='status'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateLead(editId.value,form):await addLead(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteLead(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteLeads(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
