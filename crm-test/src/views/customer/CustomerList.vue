<template>
  <div class="page-wrap">
    <!-- 搜索区 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" size="default">
        <el-form-item label="客户名称">
          <el-input v-model="searchForm.customerName" placeholder="请输入" clearable />
        </el-form-item>
        <el-form-item label="行业">
          <el-select v-model="searchForm.industry" placeholder="请选择" clearable>
            <el-option label="IT" value="IT" /><el-option label="金融" value="金融" />
            <el-option label="制造" value="制造" /><el-option label="教育" value="教育" />
            <el-option label="医疗" value="医疗" />
          </el-select>
        </el-form-item>
        <el-form-item label="等级">
          <el-select v-model="searchForm.level" placeholder="请选择" clearable>
            <el-option label="1星" :value="1" /><el-option label="2星" :value="2" />
            <el-option label="3星" :value="3" /><el-option label="4星" :value="4" /><el-option label="5星" :value="5" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="请选择" clearable>
            <el-option label="潜在" :value="0" /><el-option label="正式" :value="1" /><el-option label="流失" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区 -->
    <el-card class="table-card">
      <div class="toolbar">
        <el-button type="primary" @click="openDialog()">新增客户</el-button>
        <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
      </div>
      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="45" />
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="customerName" label="客户名称" min-width="150" />
        <el-table-column prop="industry" label="行业" width="100" />
        <el-table-column prop="source" label="来源" width="100" />
        <el-table-column prop="level" label="等级" width="80"><template #default="{ row }">{{ '⭐'.repeat(row.level || 0) }}</template></el-table-column>
        <el-table-column prop="region" label="地区" width="100" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.status === 1 ? 'success' : row.status === 2 ? 'danger' : 'info'">{{ ['潜在','正式','流失'][row.status] || '未知' }}</el-tag></template></el-table-column>
        <el-table-column prop="score" label="评分" width="80" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="openDialog(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="searchForm.pageNum"
        v-model:page-size="searchForm.pageSize"
        :total="total" :page-sizes="[10, 20, 50]"
        layout="total, sizes, prev, pager, next"
        @change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑客户' : '新增客户'" width="600px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="客户名称" prop="customerName"><el-input v-model="form.customerName" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="行业" prop="industry"><el-select v-model="form.industry" style="width:100%"><el-option label="IT" value="IT" /><el-option label="金融" value="金融" /><el-option label="制造" value="制造" /><el-option label="教育" value="教育" /><el-option label="医疗" value="医疗" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="来源"><el-input v-model="form.source" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="等级"><el-select v-model="form.level" style="width:100%"><el-option :value="1" label="1星" /><el-option :value="2" label="2星" /><el-option :value="3" label="3星" /><el-option :value="4" label="4星" /><el-option :value="5" label="5星" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="地区"><el-input v-model="form.region" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="0" label="潜在" /><el-option :value="1" label="正式" /><el-option :value="2" label="流失" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="评分"><el-input-number v-model="form.score" :min="0" :max="100" style="width:100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="负责人"><el-input v-model="form.ownerId" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCustomerList, addCustomer, updateCustomer, deleteCustomer, batchDeleteCustomers } from '@/api/customer'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)
const saving = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([])
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const editId = ref(null)

const searchForm = reactive({ pageNum: 1, pageSize: 10, customerName: '', industry: '', level: null, status: null })
const form = reactive({ customerName: '', industry: '', source: '', level: 1, region: '', status: 0, score: 0, ownerId: '' })
const rules = { customerName: [{ required: true, message: '请输入客户名称', trigger: 'blur' }] }

onMounted(() => loadData())

async function loadData() {
  loading.value = true
  try {
    const res = await getCustomerList(searchForm)
    if (res.code === 200) {
      tableData.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) { /* ignore */ }
  finally { loading.value = false }
}

function handleSearch() { searchForm.pageNum = 1; loadData() }
function resetSearch() { searchForm.customerName = ''; searchForm.industry = ''; searchForm.level = null; searchForm.status = null; handleSearch() }
function handleSelectionChange(rows) { selectedIds.value = rows.map(r => r.id) }

function openDialog(row) {
  isEdit.value = !!row
  editId.value = row?.id || null
  if (row) {
    Object.keys(form).forEach(k => form[k] = row[k] ?? form[k])
  } else {
    Object.keys(form).forEach(k => form[k] = k === 'level' ? 1 : k === 'score' ? 0 : k === 'status' ? 0 : '')
  }
  dialogVisible.value = true
}

async function handleSave() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  saving.value = true
  try {
    const res = isEdit.value ? await updateCustomer(editId.value, form) : await addCustomer(form)
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '新增成功')
      dialogVisible.value = false
      loadData()
    }
  } catch (e) { /* ignore */ }
  finally { saving.value = false }
}

async function handleDelete(id) {
  await ElMessageBox.confirm('确定要删除该客户吗？', '提示', { type: 'warning' })
  try {
    const res = await deleteCustomer(id)
    if (res.code === 200) { ElMessage.success('删除成功'); loadData() }
  } catch (e) { /* ignore */ }
}

async function handleBatchDelete() {
  await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.value.length} 条数据吗？`, '提示', { type: 'warning' })
  try {
    const res = await batchDeleteCustomers(selectedIds.value)
    if (res.code === 200) { ElMessage.success('批量删除成功'); loadData() }
  } catch (e) { /* ignore */ }
}
</script>

<style scoped>
.page-wrap { display: flex; flex-direction: column; gap: 16px; }
.toolbar { margin-bottom: 16px; display: flex; gap: 10px; }
</style>
