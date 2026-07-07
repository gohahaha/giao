<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="报价单号"><el-input v-model="searchForm.quoteNo" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="状态"><el-select v-model="searchForm.status" placeholder="请选择" clearable><el-option :value="0" label="草稿" /><el-option :value="1" label="已发送" /><el-option :value="2" label="已确认" /><el-option :value="3" label="已驳回" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增报价</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="quoteNo" label="报价单号" width="150" /><el-table-column prop="productName" label="产品名称" min-width="150" />
        <el-table-column prop="unitPrice" label="单价" width="100" /><el-table-column prop="quantity" label="数量" width="70" />
        <el-table-column prop="totalAmount" label="总金额" width="120" /><el-table-column prop="finalAmount" label="最终金额" width="120" />
        <el-table-column prop="status" label="状态" width="90"><template #default="{row}"><el-tag :type="['info','warning','success','danger'][row.status]">{{['草稿','已发送','已确认','已驳回'][row.status]}}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑报价':'新增报价'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="12"><el-form-item label="报价单号" prop="quoteNo"><el-input v-model="form.quoteNo" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="产品名称"><el-input v-model="form.productName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="单价"><el-input-number v-model="form.unitPrice" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="数量"><el-input-number v-model="form.quantity" :min="1" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="折扣"><el-input-number v-model="form.discount" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="草稿" /><el-option :value="1" label="已发送" /><el-option :value="2" label="已确认" /><el-option :value="3" label="已驳回" /></el-select></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getQuoteList,addQuote,updateQuote,deleteQuote,batchDeleteQuotes } from '@/api/quote'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,quoteNo:'',status:null})
const form=reactive({quoteNo:'',productName:'',productSpec:'',quantity:1,unitPrice:0,totalAmount:0,discount:0,finalAmount:0,status:0})
const rules={quoteNo:[{required:true,message:'请输入报价单号',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getQuoteList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.quoteNo='';searchForm.status=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='quantity'?1:k==='status'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateQuote(editId.value,form):await addQuote(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteQuote(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteQuotes(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
