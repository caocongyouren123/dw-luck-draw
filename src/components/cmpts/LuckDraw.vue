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
    <div class="start">开始</div>
    <!-- 抽奖区域 end -->

    <!-- 抽奖类型区域 start -->
    <el-radio-group v-model="prizeValue" class="radioGroup">
      <el-radio-button v-for="item in prizeType" :label="item" :key=item />
    </el-radio-group>
    <!-- 抽奖类型区域 end -->

    <!-- 抽奖记录区域 start -->
    <div class="right">
      <el-button>参与人员</el-button>
      <el-button>抽奖记录</el-button>
      <el-button>重新抽奖</el-button>  <!-- 之前抽奖全部作废，抽奖记录也会被清空 -->
    </div>
    <!-- 抽奖记录区域 end -->
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { prizeInfo } from '../peizeInfo'

const prizeType = ['特等奖','一等奖','二等奖','三等奖']
const prizeValue = ref('特等奖')
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
  top: 63%;
  left: 50%;
  transform: translateX(-50%);
  width: 160px;
  height: 160px;
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
  right: 20px;
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