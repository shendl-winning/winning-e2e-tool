<template>
  <NodeToolbar :is-visible="data.toolbarVisible" position="top">
    <el-button type="primary" size="small" @click="updateVueflowStartId(id)">开始</el-button>
    <el-button type="danger" size="small" @click="updateVueflowEndId(id)">结束</el-button>
  </NodeToolbar>

  <div>
    {{ label }}
  </div>
  <Handle type="target" :position="Position.Left" :class="[vueflowEndId == id ? 'vue-flow__handle-end' : '']"/>
  <Handle type="source" :position="Position.Right" :class="[vueflowStartId == id ? 'vue-flow__handle-start' : '']"/>
</template>

<script lang="ts" setup>
import { Handle, Position } from "@vue-flow/core";
import { NodeToolbar } from "@vue-flow/node-toolbar";
import {
  Check,
  Delete,
  Edit,
  Message,
  Search,
  Star,
} from "@element-plus/icons-vue";
defineProps(["id", "data", "vueflowStartId",  "vueflowEndId", "label"]);
//const emit2 = defineEmits(["update:vueflowStartId"]);
const emit = defineEmits(["updateVueflowStartId", "updateVueflowEndId"]);
const updateVueflowStartId = (id) => {
  emit("updateVueflowStartId", id);
}

const updateVueflowEndId = (id) => {
  emit("updateVueflowEndId", id);
}

</script>
<style scoped>
:global(.vue-flow__node-toolbar) {
  margin-top: 8px;
}

.vue-flow__handle-start {
    background:none !important;
    border-radius:0 !important;
    width: 16px !important;
    height: 16px !important;
    background-image: url("@/assets/image/start.png") !important;
}

.vue-flow__handle-end {
    background:none !important;
    border-radius:0 !important;
    width: 16px !important;
    height: 16px !important;
    background-image: url("@/assets/image/end.png") !important;
}
</style>


