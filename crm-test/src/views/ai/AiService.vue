<template>
  <div class="page-wrap">
    <el-row :gutter="20">
      <el-col :span="8" v-for="card in cards" :key="card.title">
        <el-card shadow="hover" class="ai-card" @click="activeCard = card.key">
          <div class="ai-card-icon">{{ card.icon }}</div>
          <h3>{{ card.title }}</h3>
          <p>{{ card.desc }}</p>
        </el-card>
      </el-col>
    </el-row>

    <!-- 智能FAQ -->
    <el-card v-if="activeCard === 'faq'" header="💬 智能问答 FAQ" style="margin-top:20px">
      <el-input v-model="faqQuestion" placeholder="请输入您的问题..." size="large" @keyup.enter="sendFaq" />
      <div v-if="faqAnswer" style="margin-top:16px;padding:16px;background:#f5f7fa;border-radius:8px">
        <strong>回答：</strong>{{ faqAnswer }}
      </div>
    </el-card>

    <!-- 客户评分 -->
    <el-card v-if="activeCard === 'score'" header="📊 智能客户评分" style="margin-top:20px">
      <el-form :inline="true"><el-form-item label="客户ID"><el-input v-model="scoreCustomerId" /></el-form-item><el-form-item><el-button type="primary" @click="runScore">开始评分</el-button></el-form-item></el-form>
      <div v-if="scoreResult" style="margin-top:16px;padding:16px;background:#f5f7fa;border-radius:8px">
        <p>评分：<el-progress :percentage="scoreResult.score" :color="scoreResult.score>70?'#67C23A':scoreResult.score>40?'#E6A23C':'#F56C6C'" /></p>
        <p style="margin-top:8px">建议：{{ scoreResult.suggestion }}</p>
      </div>
    </el-card>

    <!-- 摘要生成 -->
    <el-card v-if="activeCard === 'summary'" header="📝 智能摘要生成" style="margin-top:20px">
      <el-input v-model="summaryContent" type="textarea" :rows="4" placeholder="请输入需要生成摘要的内容..." />
      <el-button type="primary" style="margin-top:12px" @click="runSummary">生成摘要</el-button>
      <div v-if="summaryResult" style="margin-top:16px;padding:16px;background:#f5f7fa;border-radius:8px"><strong>摘要：</strong>{{ summaryResult }}</div>
    </el-card>

    <!-- 商机推荐 -->
    <el-card v-if="activeCard === 'recommend'" header="🎯 智能商机推荐" style="margin-top:20px">
      <el-button type="primary" @click="runRecommend">获取推荐</el-button>
      <el-table v-if="recommendations.length" :data="recommendations" style="margin-top:16px">
        <el-table-column prop="content" label="推荐内容" /><el-table-column label="操作" width="100"><template><el-button type="primary" size="small" link>查看详情</el-button></template></el-table-column>
      </el-table>
    </el-card>

    <!-- 文档解析 -->
    <el-card v-if="activeCard === 'doc'" header="📄 文档智能解析" style="margin-top:20px">
      <el-upload drag action="/api/file/upload"><el-icon :size="40"><UploadFilled /></el-icon><div>拖拽文件到此处或点击上传</div></el-upload>
    </el-card>

    <!-- TTS -->
    <el-card v-if="activeCard === 'tts'" header="🔊 文本转语音 TTS" style="margin-top:20px">
      <el-input v-model="ttsText" type="textarea" :rows="3" placeholder="请输入需要转换的文字..." />
      <el-button type="primary" style="margin-top:12px" @click="runTts">生成语音</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref,reactive } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/utils/request'

const activeCard = ref('faq')

const cards = [
  { key: 'faq', icon: '💬', title: '智能问答 FAQ', desc: 'AI 驱动的智能客服问答，快速解答常见问题' },
  { key: 'score', icon: '📊', title: '智能客户评分', desc: '基于多维度数据分析，自动评估客户价值' },
  { key: 'summary', icon: '📝', title: '智能摘要生成', desc: '自动提取文档关键信息，生成简洁摘要' },
  { key: 'recommend', icon: '🎯', title: '智能商机推荐', desc: '基于历史数据，推荐高转化潜力的商机' },
  { key: 'doc', icon: '📄', title: '文档智能解析', desc: 'OCR + NLP 自动解析合同、发票等文档' },
  { key: 'tts', icon: '🔊', title: '文本转语音 TTS', desc: '将文字内容转换为自然流畅的语音' }
]

const faqQuestion=ref(''),faqAnswer=ref('')
const scoreCustomerId=ref(''),scoreResult=ref(null)
const summaryContent=ref(''),summaryResult=ref('')
const recommendations=ref([])
const ttsText=ref('')

async function sendFaq(){if(!faqQuestion.value)return;try{const r=await request.post('/ai/faq',{question:faqQuestion.value});faqAnswer.value=r.data?.answer||'暂无回答'}catch(e){}}
async function runScore(){try{const r=await request.post('/ai/customer-score',{customerId:scoreCustomerId.value});scoreResult.value=r.data}catch(e){}}
async function runSummary(){if(!summaryContent.value)return;try{const r=await request.post('/ai/summary',{content:summaryContent.value});summaryResult.value=r.data?.summary||''}catch(e){}}
async function runRecommend(){try{const r=await request.get('/ai/opportunity-recommend');const arr=r.data?.recommendations||[];recommendations.value=arr.map(c=>({content:c}))}catch(e){}}
async function runTts(){if(!ttsText.value)return;try{await request.post('/ai/tts',{text:ttsText.value});ElMessage.success('语音生成成功')}catch(e){}}
</script>
<style scoped>.page-wrap{display:flex;flex-direction:column;gap:16px}.ai-card{cursor:pointer;text-align:center;transition:all .3s}.ai-card:hover{transform:translateY(-4px)}.ai-card-icon{font-size:48px;margin-bottom:12px}.ai-card h3{font-size:16px;margin-bottom:8px}.ai-card p{font-size:13px;color:#909399}</style>
