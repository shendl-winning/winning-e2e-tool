<template>
  <div id="left"><router-view name="leftView" @rightComponentHandle="rightComponentHandle" /></div>
  <div id="right">
    <transition name="fade">
    <component :is="rightComponent" :key="data"/>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { shallowRef, provide, ref } from 'vue'
import rightDefault from '@/views/RightDefault.vue'
import testcase from '@/views/Testcase.vue'
import inputMethodConfig from '@/views/InputMethodConfig.vue'
import stepConfig from '@/views/StepConfig.vue'

const  rightComponent = shallowRef(rightDefault)
let proid = ref<string>("");
provide('proid', proid);
const data = ref();
const rightComponentHandle = (type, id) => {
    console.log(type + "///" + id);
    proid.value = id;
    data.value = Date.now();
    switch(type){
      case 4: 
      rightComponent.value = testcase;
      break;
      case 1.1: 
      rightComponent.value = stepConfig;
      break;
      case 0.1: 
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