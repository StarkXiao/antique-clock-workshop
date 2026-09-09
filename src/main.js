import { createApp, ref, computed } from 'vue'
import './style.css'

const parts = ref([
  { id:'barrel', name:'发条盒', icon:'◉', wear:18, status:'待拆解', type:'动力' },
  { id:'escape', name:'擒纵叉', icon:'⌁', wear:62, status:'磨损', type:'调速' },
  { id:'wheel', name:'中心轮', icon:'⚙', wear:34, status:'磨损', type:'传动' },
  { id:'pendulum', name:'摆轮游丝', icon:'◌', wear:8, status:'完好', type:'调速' },
  { id:'bridge', name:'夹板', icon:'⌂', wear:27, status:'待拆解', type:'结构' },
  { id:'pin', name:'蓝钢螺钉', icon:'•', wear:49, status:'磨损', type:'固定' }
])

const activePart = ref(null)
const selectedLetter = ref(0)
const tuning = ref(50)
const logs = ref(['08:42  接收「月影」座钟，顾客：林女士', '08:44  开始记录：机芯编号 M-1896-04'])
const letters = [
  { title:'第一封 · 1936 年春', text:'“父亲从苏州带回这座钟。每到整点，它会把午后的阳光切成十二段。”', mark:'苏州 · 林宅' },
  { title:'第二封 · 1958 年冬', text:'“钟停在了母亲离开的那天。请让它重新走起来，像她还在窗边读信。”', mark:'上海 · 北四川路' },
  { title:'第三封 · 2024 年秋', text:'“这是家里最后一件会说话的老物件。走时不必太快，稳定就好。”', mark:'杭州 · 林女士' }
]

function addLog(t){ logs.value.unshift(`${new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})}  ${t}`) }
function selectPart(p){ activePart.value=p; addLog(`取下 ${p.name}，检查齿面与轴榫`) }
function repair(){ if(!activePart.value) return; const p=activePart.value; p.status='已修复'; p.wear=Math.max(0,p.wear-25); addLog(`${p.name} 完成清洁与修复`); activePart.value=null }
const rhythm = computed(()=> Math.round(100-Math.abs(tuning.value-57)*1.7))
const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001'
async function saveRecord(){ try { const response=await fetch(`${apiBase}/api/records`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({parts:parts.value,rhythm:rhythm.value,logs:logs.value})}); if(!response.ok) throw new Error('save failed'); addLog('维修记录已保存至 Node.js 档案库') } catch { addLog('保存失败：请确认 Node.js 服务已启动') } }

const App={setup(){return{parts,activePart,selectedLetter,tuning,logs,letters,rhythm,selectPart,repair,saveRecord,done:computed(()=>parts.value.filter(p=>p.status==='已修复').length)}} ,template:`
<div class="app-shell">
  <header class="topbar"><div class="brand"><span class="brand-mark">✦</span><div><strong>时隙 · 修复室</strong><small>ANTIQUE HOROLOGY LAB</small></div></div><div class="top-meta"><span class="live-dot"></span>工作台在线 <span class="divider"></span> 2024.10.18 · 周五 <button class="icon-btn" title="设置">⚙</button></div></header>
  <main class="workspace">
    <section class="intro"><div><p class="eyebrow">ORDER 024 / IN PROGRESS</p><h1>月影 · 苏制座钟</h1><p class="subtitle">一枚来自 1936 年的八日链条式机芯，等待重新呼吸。</p></div><div class="order-status"><span class="status-dot"></span><b>维修中</b><small>预计还需 42 分钟</small></div></section>
    <div class="layout">
      <section class="bench panel"><div class="panel-head"><div><span class="section-kicker">01 / DISASSEMBLY</span><h2>机芯工作台</h2></div><span class="tiny-label">点击零件查看详情</span></div>
        <div class="clock-stage"><div class="clock-face"><div class="dial-ring"></div><div class="brand-engrave">MOON<br><i>1936</i></div><div class="hand hour"></div><div class="hand minute"></div><div class="center-pin"></div><div v-for="n in 12" :key="n" class="tick" :style="{transform:'rotate('+n*30+'deg) translateY(-118px)'}"></div></div><div class="movement"><button v-for="p in parts" :key="p.id" class="part" :class="[{active:activePart?.id===p.id, repaired:p.status==='已修复'}]" :style="{left:(p.id==='barrel'?18:p.id==='escape'?53:p.id==='wheel'?33:p.id==='pendulum'?70:p.id==='bridge'?49:75)+'%',top:(p.id==='barrel'?42:p.id==='escape'?27:p.id==='wheel'?59:p.id==='pendulum'?64:p.id==='bridge'?45:20)+'%'}" @click="selectPart(p)"><span>{{p.icon}}</span><em>{{p.name}}</em><small>{{p.status}}</small></button></div></div>
        <div class="bench-footer"><div><span class="legend-dot worn"></span>磨损件 {{parts.filter(p=>p.status==='磨损').length}}<span class="legend-dot ok"></span>已修复 {{done}}</div><button class="primary" :disabled="!activePart" @click="repair">{{activePart?'修复 '+activePart.name:'选择一个零件'}} <span>↗</span></button></div>
      </section>
      <aside class="side-column">
        <section class="panel inspector"><div class="panel-head"><div><span class="section-kicker">02 / INSPECTOR</span><h2>零件检查</h2></div><span class="counter">{{done}} / 6</span></div><div v-if="activePart" class="inspection-detail"><div class="part-big">{{activePart.icon}}</div><div><h3>{{activePart.name}}</h3><p>{{activePart.type}} · 编号 {{activePart.id.toUpperCase()}}-042</p></div><div class="wear-row"><span>磨损程度</span><b>{{activePart.wear}}%</b></div><div class="wear-track"><i :style="{width:activePart.wear+'%'}"></i></div><p class="hint">建议：使用 0.8mm 黄铜刷清洁轴榫，再上少量 9010 润滑油。</p></div><div v-else class="empty-state"><span>⌖</span><p>选择工作台上的零件<br>开始检查与修复</p></div></section>
        <section class="panel tuning"><div class="panel-head"><div><span class="section-kicker">03 / REGULATION</span><h2>节奏调校</h2></div><span class="bpm">{{(60+(tuning-57)/10).toFixed(1)}} bpm</span></div><div class="meter"><div class="meter-line"><span>慢</span><i><b :style="{left:tuning+'%'}"></b></i><span>快</span></div><input type="range" min="0" max="100" v-model="tuning"></div><div class="rhythm"><div><small>稳定度</small><strong>{{rhythm}}%</strong></div><div class="bars"><i v-for="n in 18" :key="n" :class="{on:n<Math.round(rhythm/6)}"></i></div></div></section>
      </aside>
    </div>
    <div class="bottom-grid"><section class="panel letters"><div class="panel-head"><div><span class="section-kicker">04 / ARCHIVE LETTERS</span><h2>旧信件 · 来历</h2></div><div class="letter-nav"><button @click="selectedLetter=Math.max(0,selectedLetter-1)">←</button><span>0{{selectedLetter+1}} / 03</span><button @click="selectedLetter=Math.min(2,selectedLetter+1)">→</button></div></div><div class="letter-paper"><span class="stamp">{{letters[selectedLetter].mark}}</span><p class="letter-title">{{letters[selectedLetter].title}}</p><p class="letter-text">{{letters[selectedLetter].text}}</p><div class="signature">— 林家，谨存</div></div></section><section class="panel records"><div class="panel-head"><div><span class="section-kicker">05 / LOGBOOK</span><h2>维修日志</h2></div><button class="save" @click="saveRecord">保存记录 <span>↓</span></button></div><div class="log-list"><p v-for="(l,i) in logs.slice(0,5)" :key="i"><span></span>{{l}}</p></div><div class="catalogue"><span>图鉴解锁</span><b>{{done+3}} / 24</b><div class="progress"><i :style="{width:((done+3)/24*100)+'%'}"></i></div></div></section></div>
  </main><footer><span>时隙修复室 · 让时间留下来</span><span>SESSION ID <b>MX-024-1936</b></span></footer>
</div>`}
createApp(App).mount('#app')
