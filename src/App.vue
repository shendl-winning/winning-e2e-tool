<template>
  <el-config-provider :locale="locale">
    <router-view />
  </el-config-provider>
</template>
<script setup>
/*将英文组件设置为中文*/
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
let locale = zhCn
</script>
