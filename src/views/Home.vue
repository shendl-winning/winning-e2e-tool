<template>
  <div id="left"><router-view name="leftView" @rightComponentHandle="rightComponentHandle" /></div>
  <div id="right">
    <transition name="fade">
    <component :is="rightComponent" />
    </transition>
  </div>
</template>
<script setup>
import { shallowRef } from 'vue'
import rightDefault from '@/views/RightDefault.vue'
import right from '@/views/Right.vue'

const  rightComponent = shallowRef(rightDefault)

const rightComponentHandle = () => {
		rightComponent.value = right;
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
    padding:3px;
  }

  #right {
    position:absolute;
    left:350px;
    top:0;
    right:0px;
    bottom:0px;
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