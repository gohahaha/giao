<template>
  <div class="page-wrap">
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm">
        <el-form-item label="商机名称"><el-input v-model="searchForm.opportunityName" placeholder="请输入" clearable /></el-form-item>
        <el-form-item label="阶段"><el-select v-model="searchForm.stage" placeholder="请选择" clearable><el-option :value="1" label="初步接触" /><el-option :value="2" label="需求分析" /><el-option :value="3" label="方案报价" /><el-option :value="4" label="谈判" /><el-option :value="5" label="签约" /><el-option :value="6" label="关闭" /></el-select></el-form-item>
        <el-form-item><el-button type="primary" @click="handleSearch">搜索</el-button><el-button @click="resetSearch">重置</el-button></el-form-item>
      </el-form>
    </el-card>
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增商机</el-button><el-button type="danger" :disabled="selectedIds.length===0" @click="handleBatchDelete">批量删除</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="s=>selectedIds=s.map(r=>r.id)">
        <el-table-column type="selection" width="45" /><el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="opportunityName" label="商机名称" min-width="180" />
        <el-table-column prop="amount" label="金额(元)" width="130" />
        <el-table-column prop="stage" label="阶段" width="100"><template #default="{row}">{{['','初步接触','需求分析','方案报价','谈判','签约','关闭'][row.stage]}}</template></el-table-column>
        <el-table-column prop="probability" label="概率" width="80"><template #default="{row}">{{row.probability}}%</template></el-table-column>
        <el-table-column prop="expectedDate" label="预计成交" width="120" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
      <el-pagination v-model:current-page="searchForm.pageNum" v-model:page-size="searchForm.pageSize" :total="total" :page-sizes="[10,20,50]" layout="total,sizes,prev,pager,next" @change="loadData" style="margin-top:20px;justify-content:flex-end" />
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑商机':'新增商机'" width="550px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-row :gutter="16">
          <el-col :span="24"><el-form-item label="商机名称" prop="opportunityName"><el-input v-model="form.opportunityName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="客户ID"><el-input v-model="form.customerId" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="金额"><el-input-number v-model="form.amount" :min="0" :precision="2" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="阶段"><el-select v-model="form.stage" style="width:100%"><el-option :value="1" label="初步接触" /><el-option :value="2" label="需求分析" /><el-option :value="3" label="方案报价" /><el-option :value="4" label="谈判" /><el-option :value="5" label="签约" /><el-option :value="6" label="关闭" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="概率(%)"><el-input-number v-model="form.probability" :min="0" :max="100" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="预计成交日期"><el-date-picker v-model="form.expectedDate" type="date" placeholder="选择日期" style="width:100%" value-format="YYYY-MM-DD" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getOpportunityList,addOpportunity,updateOpportunity,deleteOpportunity,batchDeleteOpportunities } from '@/api/opportunity'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),total=ref(0),selectedIds=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const searchForm=reactive({pageNum:1,pageSize:10,opportunityName:'',stage:null})
const form=reactive({opportunityName:'',customerId:'',amount:0,stage:1,probability:50,expectedDate:''})
const rules={opportunityName:[{required:true,message:'请输入商机名称',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getOpportunityList(searchForm);if(res.code===200){tableData.value=res.data.records||[];total.value=res.data.total||0}}catch(e){}finally{loading.value=false}}
function handleSearch(){searchForm.pageNum=1;loadData()}
function resetSearch(){searchForm.opportunityName='';searchForm.stage=null;handleSearch()}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k])}else{Object.keys(form).forEach(k=>form[k]=k==='stage'?1:k==='probability'?50:k==='amount'?0:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const res=isEdit.value?await updateOpportunity(editId.value,form):await addOpportunity(form);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteOpportunity(id);ElMessage.success('删除成功');loadData()}catch(e){}}
async function handleBatchDelete(){await ElMessageBox.confirm(`确定删除选中的${selectedIds.value.length}条?`,'提示',{type:'warning'});try{await batchDeleteOpportunities(selectedIds.value);ElMessage.success('批量删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
