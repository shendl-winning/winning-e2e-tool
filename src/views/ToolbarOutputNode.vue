<template>
  <NodeToolbar
    :is-visible="data.toolbarVisible"
    position="top"
  >
     <el-button type="danger" size="small" @click="updateVueflowEndId(id)">结束</el-button>
  </NodeToolbar>

  <div>
    {{ label }}
  </div>
  <Handle type="target" :position="Position.Left" :class="[vueflowEndId == id ? 'vue-flow__handle-end' : '']"/>
</template>

<script lang="ts" setup>
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
defineProps(['id',"data",  "vueflowEndId", 'label'])
const emit = defineEmits(["updateVueflowEndId"]);
const updateVueflowEndId = (id) => {
  emit("updateVueflowEndId", id);
}
</script>
<style scoped>
.vue-flow__handle-end {
    background:none !important;
    border-radius:0 !important;
    width: 16px !important;
    height: 16px !important;
    background-image: url("@/assets/image/end.png") !important;;
}
</style>


