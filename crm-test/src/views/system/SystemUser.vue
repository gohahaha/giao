<template>
  <div class="page-wrap">
    <el-card class="table-card">
      <div class="toolbar"><el-button type="primary" @click="openDialog()">新增用户</el-button></div>
      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" width="130" />
        <el-table-column prop="realName" label="真实姓名" width="120" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="status" label="状态" width="80"><template #default="{row}"><el-tag :type="row.status===1?'success':'danger'">{{row.status===1?'启用':'禁用'}}</el-tag></template></el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right"><template #default="{row}"><el-button type="primary" link @click="openDialog(row)">编辑</el-button><el-button type="danger" link @click="handleDelete(row.id)">删除</el-button></template></el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="isEdit?'编辑用户':'新增用户'" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="用户名" prop="username"><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="密码" :prop="isEdit?'':'password'"><el-input v-model="form.password" type="password" :placeholder="isEdit?'留空则不修改':''" /></el-form-item>
        <el-form-item label="真实姓名"><el-input v-model="form.realName" /></el-form-item>
        <el-form-item label="手机号"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="状态"><el-select v-model="form.status" style="width:100%"><el-option :value="1" label="启用" /><el-option :value="0" label="禁用" /></el-select></el-form-item>
      </el-form>
      <template #footer><el-button @click="dialogVisible=false">取消</el-button><el-button type="primary" @click="handleSave" :loading="saving">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref,reactive,onMounted } from 'vue'
import { getUserList,addUser,updateUser,deleteUser } from '@/api/system'
import { ElMessage,ElMessageBox } from 'element-plus'
const loading=ref(false),saving=ref(false),tableData=ref([]),dialogVisible=ref(false),isEdit=ref(false),formRef=ref(null),editId=ref(null)
const form=reactive({username:'',password:'',realName:'',phone:'',email:'',status:1})
const rules={username:[{required:true,message:'请输入用户名',trigger:'blur'}],password:[{required:true,message:'请输入密码',trigger:'blur'}]}
onMounted(()=>loadData())
async function loadData(){loading.value=true;try{const res=await getUserList();if(res.code===200){tableData.value=res.data||[]}}catch(e){}finally{loading.value=false}}
function openDialog(row){isEdit.value=!!row;editId.value=row?.id||null;if(row){Object.keys(form).forEach(k=>form[k]=row[k]??form[k]);form.password=''}else{Object.keys(form).forEach(k=>form[k]=k==='status'?1:'')};dialogVisible.value=true}
async function handleSave(){const valid=await formRef.value.validate().catch(()=>false);if(!valid)return;saving.value=true;try{const data={...form};if(isEdit.value&&!data.password)delete data.password;const res=isEdit.value?await updateUser(editId.value,data):await addUser(data);if(res.code===200){ElMessage.success(isEdit.value?'更新成功':'新增成功');dialogVisible.value=false;loadData()}}catch(e){}finally{saving.value=false}}
async function handleDelete(id){await ElMessageBox.confirm('确定删除?','提示',{type:'warning'});try{await deleteUser(id);ElMessage.success('删除成功');loadData()}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.toolbar{margin-bottom:16px;display:flex;gap:10px}</style>
