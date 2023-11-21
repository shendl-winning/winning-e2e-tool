<template>
  <div id="left"><router-view name="leftView" /></div>
  <div id="right"><router-view name="rightView" /></div>
</template>
<script setup>

</script>
<style scoped>
  #left {
    position:absolute;
    left:0px;
    top:0;
    width:300px;
    border-right:1px #CCCCFF solid;
    bottom:0px;
  }

  #right {
    position:absolute;
    left:300px;
    top:0;
    right:0px;
    bottom:0px;
  }

</style>