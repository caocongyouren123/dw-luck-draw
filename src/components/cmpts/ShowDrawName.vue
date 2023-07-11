<template>
  <el-dialog v-model="showDialog" @close="clickClose">
    <h1 v-if="haveRemeber" class="dramRemeber">
      恭喜
      <span style="color: #f00">张三</span>
      获得
      <span style="color: #f00">一等奖</span>
    </h1>
    <h1 v-else class="dramRemeber">请先导入参加抽奖人员名单!</h1>
  </el-dialog>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'

const props = defineProps({
	dialogVisible: Boolean,
})

// 定义值
const showDialog = ref(false)  // 显示中奖人员的弹窗可见性
const haveRemeber = ref<boolean>(false)  // 记录是否有参加抽奖人员的数据

// 发送值
const emits = defineEmits(['update:dialogVisible'])

// 监听 dialogVisible，来决定弹窗是否显示。这里不能直接使用，因为props接收的值是只读属性
watch(
	() => props.dialogVisible,
	() => {
		showDialog.value = props.dialogVisible
	}
)

// 关闭弹窗
const clickClose = () => {
  showDialog.value = false
  emits('update:dialogVisible', showDialog.value)
}

</script>

<style lang='scss' scoped>
.dramRemeber{
  text-align: center;
}
</style>