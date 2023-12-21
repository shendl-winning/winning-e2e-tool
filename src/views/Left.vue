<template>
  <div class="leftContent">
    <el-input
      v-model="filterText"
      class="w-50 m-2"
      placeholder="Filter keyword"
      :prefix-icon="Search"
    />
    <el-tree
      ref="treeRef"
      :data="dataSource"
      node-key="id"
      default-expand-all
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span @click="handleNodeClick(data.type, data.id)">
            <el-icon v-if="data.type == 0"><House /></el-icon>
            <el-icon v-if="data.type == 1"><Cloudy /></el-icon>
            <el-icon v-if="data.type == 2"><Files /></el-icon>
            <el-icon v-if="data.type == 3"><Folder /></el-icon>
            <el-icon v-if="data.type == 4"><Document /></el-icon>
            {{ node.label }}
          </span>
          <span>
            <el-popover
              placement="bottom"
              :width="180"
              trigger="hover"
              transition="el-zoom-in-top"
              hide-after="0"
            >
              <template #reference>
                <span style="margin-left: 4px">
                  <a>
                    <el-icon><MoreFilled /></el-icon>
                  </a>
                </span>
              </template>
              <el-menu>

                <el-menu-item index="0" v-if="data.type == 1" @click="handleNodeClick(data.type + .1, data.id)">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>交互节点配置</span>
                </el-menu-item>

                <el-menu-item index="0" v-if="data.type == 0" @click="handleNodeClick(data.type + .1)">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>输入方式配置</span>
                </el-menu-item>

                <el-menu-item index="1" v-if="data.type != 0">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>复制</span>
                </el-menu-item>

                <el-menu-item index="2">
                  <el-icon><EditPen /></el-icon>
                  <span>重命名</span>
                </el-menu-item>

                <el-menu-item index="4" v-if="data.type != 0">
                  <el-icon><Right /></el-icon>
                  <span>移动到</span>
                </el-menu-item>

                <el-divider></el-divider>

                <el-menu-item index="6">
                  <el-icon><FolderAdd /></el-icon>
                  <span>添加子目录</span>
                </el-menu-item>

                <el-menu-item index="7" @click="remove(node, data)" v-if="data.type != 0">
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-menu-item>
              </el-menu>
            </el-popover>
            <el-tooltip
              content="点击新增测试用例"
              placement="top"
              effect="light"
            >
              <span>
                <a
                  @click="useTestcaseAppend.openAppendDialog(data)"
                  v-if="data.type != 4"
                >
                  <el-icon><Plus /></el-icon>
                </a>
              </span>
            </el-tooltip>
          </span>
        </span>
      </template>
    </el-tree>

    <el-dialog
      v-model="useTestcaseAppend.dialogFormVisible"
      title="新增测试用例"
      width="30%"
      @opened="useTestcaseAppend.onOpend()"
    >
      <el-form :model="form">
        <el-form-item label="测试用例名称：" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" ref="inputRef" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="useTestcaseAppend.dialogFormVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="useTestcaseAppend.append()">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
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
  Delete,
  EditPen,
  DocumentCopy,
  Right,
  FolderAdd,
} from "@element-plus/icons-vue";
import { ref, reactive, onMounted, watch } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";

const emit = defineEmits(["rightComponentHandle"]);
const handleNodeClick = (type, id) => {
  emit("rightComponentHandle", type, id);
};

const filterText = ref("");
const treeRef = ref();

watch(filterText, (val) => {
  console.log(val);
  treeRef.value!.filter(val);
});
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.label.includes(value);
};

interface Tree {
  id: string;
  label: string;
  type: number; //0:根节点 1:产品线 2：测试套件 3：分组目录 4：测试用例
  children?: Tree[];
}
let id = 1000;

const remove = (node: Node, data: Tree) => {
  const parent = node.parent;
  const children: Tree[] = parent.data.children;
  const index = children.findIndex((d) => d.id === data.id);
  children.splice(index, 1);
};

const dataSource = ref<Tree[]>([
  {
    id: "763d94fa-d899-4703-881f-58d40286267a",
    label: "区域卫生测试套件",
    type: 0,
    children: [
      {
        id: "0790bc07-dd97-4106-a339-1b71c3fceda3",
        label: "基本公卫5.6",
        type: 1,
        children: [
          {
            id: "71617682-6d02-4aa4-ad7a-e412d8db35cf",
            label: "[国家版]",
            type: 2,
            children: [
              {
                id: "bb11222e-afec-4d3c-b63f-d62551733e53",
                label: "居民健康档案管理服务规范",
                type: 2,
                children: [
                  {
                    id: "c982a1d7-e2c6-4f9e-a7fe-84f68463fe40",
                    label: "新增个人档案",
                    type: 4,
                    children: [],
                  },
                ],
              },
              {
                id: "bfe9bc32-ea5e-448b-937b-23f9c19bb662",
                label: "健康教育服务规范",
                type: 2,
              },
            ],
          },
        ],
      },
      {
        id: "c8cca17c-7fd9-4603-8cbb-9c63a3ad3b8e",
        label: "基层诊疗5.6",
        type: 2,
        children: [
          {
            id: "cc4601e1-9ed3-4d77-9ea8-df6490555663",
            label: "门诊管理",
            type: 2,
            children: [
              {
                id: "64a0f1b4-7da9-4406-ac40-8f1709b9f806",
                label: "门诊挂号",
                type: 4,
              },
            ],
          },
          {
            id: "4c5f5fab-890d-4e6f-be0e-cae71adaaadc",
            label: "门诊医生站",
            type: 2,
          },
        ],
      },
    ],
  },
]);

/*
 * 场景：新增测试用例
 *
 */
const form = reactive({
  name: "",
});
const inputRef = ref();
const formLabelWidth = "140px";
const useTestcaseAppend = reactive({
  dialogFormVisible: false,
  data: null,
  onOpend: () => {
    inputRef.value && inputRef.value.focus();
  },
  openAppendDialog: (data: Tree) => {
    form.name = "";
    useTestcaseAppend.dialogFormVisible = true;
    useTestcaseAppend.data = data;
  },
  append: () => {
    useTestcaseAppend.dialogFormVisible = false;
    const newChild = { id: uuidv4(), label: form.name, type: 4, children: [] };
    if (!useTestcaseAppend.data.children) {
      useTestcaseAppend.data.children = [];
    }
    useTestcaseAppend.data.children.push(newChild);
  },
});
</script>

<style scoped>
.leftContent {
  padding: 3px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.custom-tree-node a {
  display: none;
}

.custom-tree-node:hover a {
  display: block;
}

:global(.el-popover.el-popper) {
  padding: 0px;
}

:global(.el-menu-item) {
  height: 40px;
}

:global(.el-divider) {
  margin: 0px;
}

:global(.el-menu) {
  border: solid 0px;
}

:global(.el-tooltip__trigger) {
  float: right;
}

:global(.el-icon) {
  padding: 3px;
}

:global(.el-icon:hover) {
  background-color: #ccc;
}
</style>