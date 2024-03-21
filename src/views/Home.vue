<template>
  <div id="left"><router-view name="leftView" @rightComponentHandle="rightComponentHandle" /></div>
  <div id="right">
    <transition name="fade">
    <component :is="rightComponent" :key="data"/>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, provide, ref , reactive} from 'vue'
import rightDefault from '@/views/RightDefault.vue'
import testcase from '@/views/Testcase.vue'
import inputMethodConfig from '@/views/InputMethodConfig.vue'
import stepConfig from '@/views/StepConfig.vue'
import testRecord from '@/views/TestRecord.vue'
import { ElLoading } from "element-plus";

const  rightComponent = shallowRef(rightDefault)
let proid = ref({});
provide('proid', proid);
const data = ref();
const rightComponentHandle = (type, id, name, groupids, productid) => {
    proid.value = {
      "id" : id,
      "name" : name,
      "groupids" : groupids,
      "productid" : productid
    };
    switch(type){
      case 5: 
      data.value = Date.now();
      rightComponent.value = testcase;
      break;
      case 3: 
      data.value = Date.now();
      rightComponent.value = stepConfig;
      break;
      case 31: 
      data.value = Date.now();
      rightComponent.value = testRecord;
      break;
      case 4: 
      data.value = Date.now();
      rightComponent.value = stepConfig;
      break;
      case 2: 
      data.value = Date.now();
      rightComponent.value = inputMethodConfig;
      break;
    }
		
}



</script>
<style scoped>
  #left {
    position:absolute;
    left:0px;
    top:0;
    width:350px;
    border-right:1px #CCCCFF solid;
    bottom:0px;
    overflow :auto;
  }

  #right {
    position:absolute;
    left:350px;
    top:0;
    right:2px;
    bottom:0px;
    padding:10px 20px;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s;
  }
 
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }

  ::-webkit-scrollbar {
    width: 2px; /* 宽度为10px */
  }

  ::-webkit-scrollbar-thumb {
    background-color: #ccc;
  }

</style>