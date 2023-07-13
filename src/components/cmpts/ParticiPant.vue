<template>
  <el-drawer 
    :title="drawTitle"
    size="50%" 
    direction="rtl" 
    v-model="ShowDraw" 
    :before-close="handleClose"
  >
    <!-- 按钮部分 start -->
    <div class="buttonAction">
      <el-button v-show="drawTitle === '参与人员'" @click="downTemplate">下载模板</el-button>
      <el-button v-show="drawTitle === '参与人员'" class="impoerData">
        导入数据
        <input class="inputFile" type="file" accept=".xls,.xlsx" @change="importData" />
      </el-button>
      <el-button @click="clearData">清除数据</el-button>
    </div>
    <!-- 按钮部分 end -->

    <!-- 表格部分 start -->
    <el-table :data="tableData">
      <el-table-column type="index" label="序号" width="60px"/>
      <el-table-column v-for="item in tableHeader" :key="item.prop" :prop="item.prop" :label="item.label">
        <template #default="scope">
				  <el-tag v-if="item.prop == 'sex'" :type="scope.row.sex === '男' ? 'warning' : 'success'">{{ scope.row.sex }}</el-tag>
          <span v-else-if="item.prop == 'prize'" 
            :style="{color: scope.row.prize == '特等奖' ? '#f00' 
            : scope.row.prize == '一等奖' ? '#00FF00' 
            : scope.row.prize == '二等奖' ? '#0000FF' 
            : '#000'
          }"
          >{{ scope.row.prize }}</span>
			</template >
      </el-table-column>
    </el-table>
     <!-- 表格部分 end -->
  </el-drawer>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { ElMessageBox,ElMessage } from 'element-plus'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'
import { useAppStore } from "@/stores"

interface tableDataType {
  name: string
  sex: string
  dept: string
}
// 接收值
const props = defineProps({
  drawVisible: Boolean,
  drawTitle: String
})

// 发送值
const emits = defineEmits(['update:drawVisible','nameList','clearData'])

// 定义变量部分
const appStore = useAppStore()
const ShowDraw = ref(false)
const tableData = ref<tableDataType[]>([])  // 表格数据
const tableDataTemp = ref<tableDataType[]>([])
const tableNameData = ref<any>([])  // 只存放姓名的数组
const tableHeader = ref<any>([])
// 表头数据
const headerData = [
  {
    prop: 'name',
    label: '姓名'
  },
  {
    prop: 'sex',
    label: '性别'
  },
  {
    prop: 'dept',
    label: '部门'
  },
  {
    prop: 'prize',
    label: '奖项'
  }
]

watch(
  () => props.drawVisible,
  (val) => {
    ShowDraw.value = val
    if(val){
      if(props.drawTitle === '参与人员'){
        tableHeader.value = headerData.slice(0, headerData.length -1 )
        tableData.value = JSON.parse(localStorage.getItem('tableData')!)
      }else{
        tableHeader.value = headerData
        tableData.value = JSON.parse(localStorage.getItem('luckNameList')!)
      }
    }
  }
)

// 逻辑处理部分
// 1. 关闭抽屉
const handleClose = () => {
  console.log('关闭了'); 
  ShowDraw.value = false
  emits('update:drawVisible', ShowDraw.value)
}

// 2. 清除数据
const clearData = () => {
  ElMessageBox.confirm(
    '确定要清空所有数据吗？',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    let empty: any = []
    tableData.value = []
    if(props.drawTitle === '参与人员'){
      localStorage.setItem('tableData', JSON.stringify(empty))
      localStorage.setItem('nameList', JSON.stringify(empty))
    }else{
      localStorage.setItem('luckNameList', JSON.stringify(empty))
      emits('clearData')
    }
    ElMessage.success('清空成功！')
  }).catch(() => {
    ElMessage.info('取消清空！')
  })
}

// 3. 下载模板
const downTemplate = () => {
  const fileName = '参与抽奖人员模板.xlsx';  // 模板文件名
  const fileUrl = './src/assets/template/'  // 存放模板文件的路径（相对于index.html）
  saveAs(fileUrl + fileName, fileName)
}

// 4. 导入数据
const importData = (e: any) => {
  const file = e.target.files[0]   // 获取file对象
  const fileReader = new FileReader()  // 创建文件读取器
  fileReader.onload = (event) => {
    const result = event.target!.result  // 获取读取的结果
    const workBook = XLSX.read(result, {type: 'binary'})  // xlsx读取返回的结果
    const importData = XLSX.utils.sheet_to_json(
      workBook.Sheets[workBook.SheetNames[0]]
    )
    importData.forEach((item: any) => {
      tableDataTemp.value.push({
        name: item.姓名,
        sex: item.性别,
        dept: item.部门
      })
    });
    // 只存放姓名
    importData.forEach((item: any) => {
      tableNameData.value.push({
        name: item.姓名
      })
    });
    // 将导入的表格数据存到localStorage中
    localStorage.setItem('tableData', JSON.stringify(tableDataTemp.value))

    // 将姓名数据存在localStorage中
    localStorage.setItem('nameList', JSON.stringify(tableNameData.value))
    emits('nameList', tableNameData.value)
    // 给当前表格数据赋值
    tableData.value = tableDataTemp.value
    
    // 将导入的表格数据中的姓名存到pinia中
    appStore.getNameList(tableNameData.value)
  }
  fileReader.readAsBinaryString(file);
  // ((document.getElementsByClassName("inputFile")[0]).value = '')
}
</script>

<style lang='scss'>
.el-drawer__title{
  font-size: 20px !important;
  font-weight: bold;
}
.buttonAction{
  padding-bottom: 20px;
}
.impoerData{
  position: relative;
  input{
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
    opacity: 0;
    border: unset;
  }
}
</style>