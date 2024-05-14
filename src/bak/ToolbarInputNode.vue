<template>
  <NodeToolbar
    :is-visible="data.toolbarVisible"
    position="top"
  >
     <el-button type="primary" size="small" @click="updateVueflowStartId(id)">开始</el-button>
  </NodeToolbar>

  <div>
    {{ label }}
  </div>
  <Handle type="source" :position="Position.Right" :class="[vueflowStartId == id ? 'vue-flow__handle-start' : '']"/>
</template>

<script lang="ts" setup>
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { Handle, Position } from '@vue-flow/core'
import { NodeToolbar } from '@vue-flow/node-toolbar'
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from '@element-plus/icons-vue'
defineProps(['id',"data", "vueflowStartId",'label'])
const emit = defineEmits(["updateVueflowStartId"]);
const updateVueflowStartId = (id) => {
  emit("updateVueflowStartId", id);
}
</script>
<style scoped>

.vue-flow__handle-start {
    background:none !important;
    border-radius:0 !important;
    width: 16px !important;
    height: 16px !important;
    background-image: url("@/assets/image/start.png") !important;;
}

</style>


