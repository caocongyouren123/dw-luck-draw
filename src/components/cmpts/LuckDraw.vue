<template>
  <div class="container">
    <!-- 奖品详情区域 start -->
    <div class="left">
      <div class="prize">奖品：</div>
      <div v-for="item in prizeInfo" :key="item.name" class="prizeInfo">
        <span>{{ item.name }}</span>
        <img class="prizeImg" :src="item.url" />
      </div>
    </div>
    <!-- 奖品详情区域 end -->

    <!-- 抽奖区域 start -->
    <div :class="[startStatus ? 'start' : 'stop']" @click="drawStart">
      <span v-if="!haveRemeber">开始</span>
      <span v-else class="showName">{{ showName }}</span>
    </div>
    <!-- 抽奖区域 end -->

    <!-- 抽奖类型区域 start -->
    <el-radio-group v-model="prizeValue" class="radioGroup" @change="changePrizeType">
      <el-radio-button v-for="item in prizeType" :label="item" :key=item />
    </el-radio-group>
    <!-- 抽奖类型区域 end -->

    <!-- 抽奖记录区域 start -->
    <div class="right">
      <el-button @click="drawParticipant">参与人员</el-button>
      <el-button @click="drawHistory">抽奖记录</el-button>
      <el-button @click="drawAgain">重新抽奖</el-button>  <!-- 之前抽奖全部作废，抽奖记录也会被清空 -->
    </div>
    <!-- 抽奖记录区域 end -->

    <!-- 弹窗显示中奖人员 start -->
    <ShowDrawName v-model:dialogVisible="dialogVisible" :showName="showName" :haveRemeber="haveRemeber" :prizeValue="prizeValue" />
    <!-- 弹窗显示中奖人员 end -->

    <!-- 参与人员和抽奖记录的抽屉 start -->
    <ParticiPantVue v-model:drawVisible="drawVisible" :drawTitle="drawTitle" @nameList="nameList" @clearData="clearData"/>
    <!-- 参与人员和抽奖记录的抽屉 end -->
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
// import { storeToRefs } from 'pinia'
import { ElMessageBox,ElMessage } from 'element-plus'
import ShowDrawName from './ShowDrawName.vue'
import ParticiPantVue from './ParticiPant.vue'
import { prizeInfo } from '../peizeInfo'
// import { useAppStore } from "@/stores"

// 定义类型中奖人员名单数据类型
interface luckNameListType {
  name: string
  sex: string
  dept: string
  prize: string
}

// 定义变量部分
// const appStore = useAppStore()
const prizeType = ['特等奖','一等奖','二等奖','三等奖']
const prizeValue = ref<string>('特等奖')
const dialogVisible = ref(false)   // 显示中奖人员的弹窗可见性
const drawVisible = ref(false)  // 参与人员抽屉可见性
const drawTitle = ref('参与人员')  // 抽屉标题
const haveRemeber = ref<boolean>(false)  // 记录是否有参加抽奖人员的数据
// const { tableNameList } = storeToRefs(appStore)  // 从pinia中获取当前导入数据中的姓名，注意不要丢失了响应式
const useNameList = ref<any>([])
const isStop = ref(true)   // 控制抽奖时姓名滚动的状态，true表示停止滚动，false表示一直滚动
const showName = ref('开始')  // 当前显示的中奖人员名单
const startStatus = ref(true)  //是否可以抽奖的状态，默认可以抽奖

// 逻辑处理部分
const initLoad = () => {
  // let tableData = JSON.parse(localStorage.getItem('tableData')!)
  let nameList = JSON.parse(localStorage.getItem('nameList')!)
  if(nameList && nameList.length){
    // 获取所有的姓名列表
    const allNameList = JSON.parse(localStorage.getItem('nameList')!)
    // 获取中奖人员名单
    const luckNameList = JSON.parse(localStorage.getItem('luckNameList')!)
    if(luckNameList){
      // 将中奖人员从下一次抽奖中过滤掉，确保同一奖项每个人只能有一次中奖机会
      const newNameList = allNameList.filter((itemA: any) => luckNameList.every((itemB: any) => itemB.name !== itemA.name))
      // 将新的姓名列表重新赋值给 useNameList
      useNameList.value = newNameList
      // 校验当前奖项是否已经被抽完
      setTimeout(()=>{checkoutDraw(luckNameList)})
    }else{
      useNameList.value = allNameList
    }
    haveRemeber.value = true
  }else{
    useNameList.value = []
    haveRemeber.value = false
  }
}
initLoad()

// 1. 重新抽奖
const drawAgain = () => {
  // 重新抽奖指的是清除最近一次抽奖记录，可以一直重置，直到抽奖记录为空。
  let tableDrawData = JSON.parse(localStorage.getItem('luckNameList')!)
  if(tableDrawData && tableDrawData.length){
    ElMessageBox.confirm(
      '确定要重置上一次的抽奖操作吗？',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    ).then(() => {
      const popValue = tableDrawData.pop()
      localStorage.setItem('luckNameList',JSON.stringify(tableDrawData))
      // 重置后刚才中奖的人应该继续放入带抽奖列表中
      useNameList.value.push({
        name: popValue.name
      })
      ElMessage.success('重置成功！')
    }).catch(() => {
      ElMessage.info('取消重置！')
    })
  }else{
    ElMessage.warning('请先完成一次抽奖！')
  }
}

// 2. 点击开始抽奖
const drawStart = () => {
  // isStop.value ? startDraw() : stopDraw()
  const luckNameList = JSON.parse(localStorage.getItem('luckNameList')!)
  if(haveRemeber.value){  // 如果没有参与人员不进行后续操作直接弹出导入人员提示
    if(luckNameList && luckNameList.length){
      // 校验当前奖项是否已经被抽完
      const flag = checkoutDraw(luckNameList)
      // 根据 startStatus 的状态决定当前奖项能否再抽
      if(flag){
        if(isStop.value){
          startDraw()
        }else{
          stopDraw()
        }
      }else{  
        // 不可以抽奖，说明该奖项名额已经抽完了
        ElMessage.warning(`${prizeValue.value}` + '已经抽完了！')
      }  
    }else{
      //此时没有中奖人员，任何奖项下都可以抽奖
      if(isStop.value){
        startDraw()
      }else{
        stopDraw()
      }
    }
  }else{
    dialogVisible.value = true
  }
  
}

// 3. 点击参与人员
const drawParticipant = () => {
  drawVisible.value = true
  drawTitle.value = '参与人员'
}

// 4. 点击抽奖记录
const drawHistory = () => {
  drawVisible.value = true
  drawTitle.value = '抽奖记录'
}

// 5. 循环数组
const forNameList = (list: any) => {
  list = shuffle(list);
  for(let i=0; i<list.length; i++){
    setTimeout(() => {
      if(!isStop.value){
        showName.value = list[i].name;
        if(i == list.length - 1){
          // 当数组循环结束后，没有停止就在继续循环
          // 获取所有的姓名列表
          const allNameList = JSON.parse(localStorage.getItem('nameList')!)
          // 获取中奖人员姓名列表
          const luckNameList = JSON.parse(localStorage.getItem('luckNameList')!)
          if(luckNameList){
            // 将中奖人员从下一次抽奖中过滤掉，确保同一奖项每个人只能有一次中奖机会
            const newNameList = allNameList.filter((itemA: any) => luckNameList.every((itemB: any) => itemB.name !== itemA.name))
            // 将新的姓名列表重新赋值给 useNameList
            useNameList.value = newNameList
          }else{
            useNameList.value = allNameList
          }
          forNameList(useNameList.value)
        }
      }
    },50 * i);
  }
}

// 6. 洗牌算法打乱姓名数组,保证每个人中奖的概率相同
const shuffle = (arr: any) => {
	const arrNew = [];  // 打乱后的数组
  const len=arr.length 
  for (let i=len;i>0;i--){
    // 生成一个在0-len之间的随机数
    const rand=Math.floor(Math.random()*i)
    // 从原数组中拿出这个随机下标对应的数放入新数组当中
    arrNew.push(arr[rand]);
    // 从原数组当中删除拿出的这个值
    arr.splice(rand,1)
  }
  return arrNew;
}

// 7. 点击开始
const startDraw = () => {
  // 如果没有导入抽奖人员数据则提示 “请先导入抽奖人员数据！”
  if(!haveRemeber.value){
    dialogVisible.value = true
  }else{
    // 如果有数据开始循环滚动姓名，再次点击则停止滚动并弹出中奖人员
    isStop.value = false  // 开始循环  
    // 获取所有的姓名列表
    const allNameList = JSON.parse(localStorage.getItem('nameList')!)
    // 获取中奖人员
    const luckNameList = JSON.parse(localStorage.getItem('luckNameList')!)
    // 如果清除了中奖人员
    if(!luckNameList || luckNameList && !luckNameList.length){
      useNameList.value = allNameList
    }
    forNameList(useNameList.value)  // 循环姓名数组
  }     
}

// 8. 点击结束
const stopDraw = () => {
  isStop.value = true
  dialogVisible.value = true
  // 获取中奖人员数据弹窗显示，并存储起来
  const tableData = JSON.parse(localStorage.getItem('tableData')!)  // 所有数据
  let tableDrawData: any = JSON.parse(localStorage.getItem('luckNameList')!) || []
  tableData.forEach((item: any) => {
    if(item.name == showName.value){
      tableDrawData.push({
        name: item.name,
        sex: item.sex,
        dept: item.dept,
        prize: prizeValue.value
      })
    }
  })
  localStorage.setItem('luckNameList',JSON.stringify(tableDrawData))

  // 获取所有的姓名列表
  const allNameList = JSON.parse(localStorage.getItem('nameList')!)

  // 将中奖人员从下一次抽奖中过滤掉，确保每个人只能有一次中奖机会，也就是从 allNameList 中过滤掉 tableDrawData中的元素
  const newNameList = allNameList.filter((itemA: any) => tableDrawData.every((itemB: any) => itemB.name !== itemA.name))

  // 将新的姓名列表重新赋值给 useNameList
  useNameList.value = newNameList

  // 校验当前奖项是否已经被抽完
  checkoutDraw(tableDrawData)
}

// 9. 改变抽奖类型
const changePrizeType = (type: string) => {
  prizeValue.value = type
  // 将按钮文字重置为开始
  showName.value = '开始'
  if(haveRemeber.value){
    // 校验当前奖项是否已经被抽完,第一次抽奖时候不校验
    const luckNameList = JSON.parse(localStorage.getItem('luckNameList')!)
    if(luckNameList && luckNameList.length){
      checkoutDraw(luckNameList)
    }
  }
}

// 10. 接收姓名数据
const nameList = (arr: any) => {
  if(arr && arr.length){
    useNameList.value = arr
    haveRemeber.value = true
  }else{
    useNameList.value = []
    haveRemeber.value = false
  }
}

// 11. 检验当前奖项是否已经抽完，初始化，切换奖项类型，点击抽奖,抽奖结束的时候都需要校验
const checkoutDraw = (list: luckNameListType[]) => {
  // 此时表示有中奖人员，需要根据条件来确认是否可以在继续抽奖
  // 整理每一个奖项出现的次数
  let prizeList = list.map((item: luckNameListType) => item.prize)
  const prizObj =  prizeList.reduce((preValue: any, curValue: string)=>{
    preValue[curValue] = (preValue[curValue] + 1) || 1
    return preValue
  },{})
  console.log(prizObj,'prizObj==');

  // 如果此时在抽特等奖，只能有 1 个名额
  if(prizeValue.value === '特等奖'){
    if(prizObj['特等奖'] === 1) {  // 此时特等奖不能在抽了
      startStatus.value = false 
    }else{
      startStatus.value = true 
    }
  }else if(prizeValue.value === '一等奖'){  // 如果此时在抽一等奖，只能有 2 个名额
    if(prizObj['一等奖'] == 2 ){  // 此时一等奖不能在抽了
      startStatus.value = false 
      } else{
      startStatus.value = true 
    }
  }else if(prizeValue.value === '二等奖'){  // 如果此时在抽二等奖，只能有 5 个名额
    if(prizObj['二等奖'] == 5){  // 此时二等奖不能在抽了
      startStatus.value = false 
      } else{
      startStatus.value = true 
    }
  }else if(prizeValue.value === '三等奖'){  // 如果此时在抽三等奖，只能有 10 个名额
    if(prizObj['三等奖'] == 10){  // 此时三等奖不能在抽了
      startStatus.value = false 
      } else{
      startStatus.value = true 
    }
  }
  return startStatus.value
}

// 12. 监听子组件是否清除了中奖人员名单，只要清空了，所有奖项都可以重新抽奖
const clearData = () => {
  startStatus.value = true
}
</script>

<style lang='scss' scoped>
.container{
  width: 95vw;
  height: 95vh;
  background-image: url(../../assets/bg2.jpg);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
}
.left{
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  padding: 0 10px;
  position: absolute;
  transform: translateY(-50%);
  top: 50%;
  .prize{
    font-size: 30px;
  }
  .prizeInfo{
    display: flex;
    align-items: center;
    padding: 10px 0;
  }
  .prizeImg{
    width: 80px;
    padding-left: 10px;
  }
}
.start{
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  font-size: 60px;
  color: #fff;
  background: #f00;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  &:hover{
    box-shadow: 0px 0px 50px #000;
    background: #CC000000;
  }
}
.stop{
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  font-size: 60px;
  color: #fff;
  background: #d4bdbd;
  border-radius: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
}
.radioGroup{
  top: 40%;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: nowrap
}
:deep(.el-radio-button__inner){
  font-size: 30px;
  color: #fff;
  background: #f2ca04;
  border: unset
}
:deep(.el-radio-button__original-radio:checked+.el-radio-button__inner){
  background: #f00;
  border: unset
}
.right{
  position: absolute;
  top: 50px;
  right: 30px;
}
:deep(.el-button){
  background: #f2ca04;
  color: #fff;
  border-color: #f2ca04;
  // transition: all 1.4s; //设置上浮过渡时间
  &:hover{
    box-shadow: 0px 0px 5px #000;
    // transform: translate(0, -10px);  // 向上浮动
  }
}
</style>