<template>
  <el-input
    v-model="input2"
    class="w-50 m-2"
    placeholder="Type something"
    :prefix-icon="Search"
  />
  <el-tree
    :data="dataSource"
    node-key="id"
    default-expand-all
    :expand-on-click-node="false"
    @node-click="handleNodeClick" 
  >
    <template #default="{ node, data }">
      <span class="custom-tree-node">
        <span>
          <el-icon v-if="data.type == 0"><House /></el-icon>
          <el-icon v-if="data.type == 1"><Cloudy /></el-icon>
          <el-icon v-if="data.type == 2"><Files /></el-icon>
          <el-icon v-if="data.type == 3"><Folder /></el-icon>
          <el-icon v-if="data.type == 4"><Document /></el-icon>
          {{ node.label }}
          </span>
        <span class="buttons">
           <el-popover
              placement="top-start"
              title="提示："
              :width="200"
              trigger="hover"
              content="点击新增测试用例"
            >
          <template #reference>
          <a @click="useTestcaseAppend.openAppendDialog(data)" v-if="data.type != 4">
            <el-icon><Plus /></el-icon>
          </a>
          </template>
           </el-popover>
          <a style="margin-left: 8px" @click="remove(node, data)">
            <el-icon><MoreFilled /></el-icon>
          </a>
        </span>
      </span>
    </template>
  </el-tree>

<el-dialog v-model="useTestcaseAppend.dialogFormVisible" title="Shipping address">
    <el-form :model="form">
      <el-form-item label="Promotion name" :label-width="formLabelWidth">
        <el-input v-model="form.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="Zones" :label-width="formLabelWidth">
        <el-select v-model="form.region" placeholder="Please select a zone">
          <el-option label="Zone No.1" value="shanghai" />
          <el-option label="Zone No.2" value="beijing" />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="useTestcaseAppend.dialogFormVisible = false">Cancel</el-button>
        <el-button type="primary" @click="useTestcaseAppend.append()">
          Confirm
        </el-button>
      </span>
    </template>
</el-dialog>


</template>
<script setup lang="ts">
import {
  Search,
  Plus,
  MoreFilled,
  Folder,
  Files,
  Document,
  House,
  Cloudy,
} from "@element-plus/icons-vue";
import { ref, reactive} from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";

const emit = defineEmits(["rightComponentHandle"]);
const rightComponentHandle = () => {
  emit("rightComponentHandle");
};

interface Tree {
  id: number;
  label: string;
  type: number; //0:根节点 1:产品线 2：测试套件 3：分组目录 4：测试用例
  children?: Tree[];
}
let id = 1000;

const append = (data: Tree) => {
  const newChild = { id: id++, label: 'testtest', type: 4, children: [] }
    if (!data.children) {
      data.children = []
    }
    data.children.push(newChild)
};

const remove = (node: Node, data: Tree) => {
  const parent = node.parent;
  const children: Tree[] = parent.data.children;
  const index = children.findIndex((d) => d.id === data.id);
  children.splice(index, 1);
};

const handleNodeClick = (data: Tree) => {
  console.log(data);
};

const dataSource = ref<Tree[]>([
  {
    id: 1,
    label: "区域卫生测试套件",
    type: 0,
    children: [
      {
        id: 2,
        label: "基本公卫5.6",
        type: 1,
        children: [
          {
            id: 3,
            label: "[国家版]",
            type: 2,
            children: [
              {
                id: 4,
                label: "居民健康档案管理服务规范",
                type: 3,
                children: [
                  {
                    id: 5,
                    label: "新增个人档案",
                    type: 4,
                    children: [],
                  },
                ],
              },
              {
                id: 6,
                label: "健康教育服务规范",
                type: 3,
              },
            ],
          },
        ],
      },
      {
        id: 7,
        label: "基层诊疗5.6",
        type: 2,
        children: [
          {
            id: 8,
            label: "门诊管理",
            type: 3,
            children: [
              {
                id: 9,
                label: "门诊挂号",
                type: 4,
              },
            ],
          },
          {
            id: 10,
            label: "门诊医生站",
            type: 3,
          },
        ],
      },
    ],
  },
]);

//const dialogFormVisible = ref(false)
const formLabelWidth = '140px'
const useTestcaseAppend = reactive({
  dialogFormVisible : false,
  data:null,
  openAppendDialog:(data: Tree) => {
    useTestcaseAppend.dialogFormVisible = true;
    useTestcaseAppend.data = data;
  },
  append:() => {
    useTestcaseAppend.dialogFormVisible = false;
    append(useTestcaseAppend.data);
  }
})

const form = reactive({
  name: '',
  region: '',
  date1: '',
  date2: '',
  delivery: false,
  type: [],
  resource: '',
  desc: '',
})

</script>
<style scoped>
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.buttons {
  display: none;
}

.custom-tree-node:hover > .buttons {
  display: block;
}
</style>