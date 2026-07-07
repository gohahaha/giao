<template>
  <el-container class="main-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapse">🏢 CRM 智能办公</span>
        <span v-else>🏢</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :collapse-transition="false"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>首页</span>
        </el-menu-item>
        <el-menu-item index="/customer">
          <el-icon><UserFilled /></el-icon>
          <span>客户管理</span>
        </el-menu-item>
        <el-menu-item index="/contact">
          <el-icon><PhoneFilled /></el-icon>
          <span>联系人管理</span>
        </el-menu-item>
        <el-menu-item index="/lead">
          <el-icon><Aim /></el-icon>
          <span>销售线索</span>
        </el-menu-item>
        <el-menu-item index="/opportunity">
          <el-icon><TrendCharts /></el-icon>
          <span>商机管理</span>
        </el-menu-item>
        <el-menu-item index="/quote">
          <el-icon><Document /></el-icon>
          <span>报价管理</span>
        </el-menu-item>
        <el-menu-item index="/contract">
          <el-icon><FolderOpened /></el-icon>
          <span>合同管理</span>
        </el-menu-item>
        <el-menu-item index="/order">
          <el-icon><ShoppingCart /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/marketing">
          <el-icon><Promotion /></el-icon>
          <span>市场活动</span>
        </el-menu-item>
        <el-menu-item index="/ticket">
          <el-icon><Service /></el-icon>
          <span>服务工单</span>
        </el-menu-item>
        <el-menu-item index="/analytics">
          <el-icon><PieChart /></el-icon>
          <span>数据分析</span>
        </el-menu-item>
        <el-menu-item index="/system">
          <el-icon><Setting /></el-icon>
          <span>系统管理</span>
        </el-menu-item>
        <el-menu-item index="/ai">
          <el-icon><MagicStick /></el-icon>
          <span>AI服务</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧内容 -->
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse" :size="22">
            <Fold v-if="!isCollapse" /><Expand v-else />
          </el-icon>
        </div>
        <div class="header-right">
          <span class="username">{{ userStore.realName || userStore.username }}</span>
          <el-button type="danger" size="small" @click="handleLogout">退出</el-button>
        </div>
      </el-header>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const isCollapse = ref(false)
const activeMenu = computed(() => route.path)

function handleLogout() {
  userStore.logout()
  ElMessage.success('退出成功')
  router.push('/login')
}
</script>

<style scoped>
.main-container { height: 100vh; }
.sidebar { background-color: #304156; overflow-y: auto; overflow-x: hidden; }
.logo { height: 60px; line-height: 60px; text-align: center; color: #fff; font-size: 18px; font-weight: bold; white-space: nowrap; border-bottom: 1px solid rgba(255,255,255,0.1); }
.el-menu { border-right: none; }
.header { background: #fff; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #e6e6e6; padding: 0 20px; }
.header-left { display: flex; align-items: center; }
.collapse-btn { cursor: pointer; }
.header-right { display: flex; align-items: center; gap: 12px; }
.username { color: #333; font-size: 14px; }
.main-content { background: #f0f2f5; min-height: calc(100vh - 60px); }
</style>
