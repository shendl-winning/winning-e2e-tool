<template>
  <div class="rightDefault-top">
    当前环境：<el-text class="mx-1" type="success">{{ envName }}</el-text>
  </div>
  <div class="rightDefault-left">
    <el-tree
      ref="treeRef"
      :data="dataSource"
      node-key="id"
      highlight-current
      default-expand-all
      :expand-on-click-node="false"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span
            ><input
              node-key="id"
              type="radio"
              name="environments"
              v-if="data.type == 1"
              :checked="data.id == env"
              :value="data.id"
              @change="environmentChange(data)"
            /><span @click="handleNodeClick(data)">{{ node.label }}</span></span
          >

          <span class="custom-tree-node-opration">
            <dd @click="append(data)" v-if="data.type == 0">
              <el-icon><Plus /></el-icon>
            </dd>
            <a @click="DocumentCopy(node, data)" v-if="data.type == 1"
              ><el-icon><DocumentCopy /></el-icon>
            </a>
            <a @click="remove(node, data)" v-if="data.type == 1">
              <el-icon><Delete /></el-icon>
            </a>
          </span>
        </span>
      </template>
    </el-tree>
  </div>
  <div class="rightDefault-right" >
    <div class="right-top" v-if="currentKey">
      <el-button
        type="success"
        size="small"
        style="float: right; margin-left: 10px"
        @click="tableSave()"
        >保存</el-button
      >
      <el-button
        type="primary"
        size="small"
        style="float: right"
        @click="tableAdd()"
        >新增</el-button
      >
    </div>
    <div class="right-bottom" v-if="currentKey">
      <el-table :data="tableData" style="width: 100%" >
        <el-table-column label="字段名" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-input
                v-model="scope.row.name"
                style="width: 240px"
                placeholder="请输入字段名"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="编码" width="180">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-input
                v-model="scope.row.code"
                style="width: 240px"
                placeholder="请输入字段编码"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="值" width="250">
          <template #default="scope">
            <div style="display: flex; align-items: center">
              <el-input
                v-model="scope.row.note"
                style="width: 240px"
                placeholder="请输入字段的值"
              />
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template #default="scope">
            <el-button
              size="small"
              type="danger"
              @click="tableDelete(scope.$index, scope.row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>

  <el-dialog v-model="dialogEnvironmentVisible" title="新增环境名" width="30%">
    <el-form>
      <el-form-item label="环境名称：">
        <el-input v-model="environmentName" autocomplete="off" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogEnvironmentVisible = false">取消</el-button>
        <el-button type="primary" @click="environmentAppend()">
          确认
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script lang="ts" setup>
import axios from "axios";
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
  Refresh,
  VideoPlay,
} from "@element-plus/icons-vue";
import { ElLoading, ElMessage, ElMessageBox } from "element-plus";
import { ref, reactive, inject, onMounted } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const env = ref();
const envName = ref("-");
const dialogEnvironmentVisible = ref(false);
const environmentName = ref("");
const environmentData = ref();
const currentKey = ref("");

onMounted(() => {
  axios
    .post("http://172.16.7.148:9200/environment/_doc/_search", {
      from: 0,
      size: 10000,
      "query": {
        "match_all": {}
      },
      sort: {
        modificationdate: {
          order: "desc",
        },
      },
    })
    .then((res) => {
      res.data.hits.hits.forEach((element) => {
        let environment = element._source;
        const data = {
            id: environment.id,
            label: environment.name,
            type: 1,
            datas:environment.datas
        }
        dataSource.value[0].children.push(data);
        treeRef.value.append(data, dataSource.value[0].id);
      })
      env.value = Kelp.getEnv("ENVIRONMENT");
      treeRef.value.setCurrentKey(env.value);
      currentKey.value = treeRef.value.getCurrentKey();
      const currentNode = treeRef.value.getNode(env.value)
      env.value && handleNodeClick(currentNode.data);
      env.value && (envName.value = currentNode.data.label);
    });
});

const environmentAppend = () => {
  const data = {
    id: uuidv4(),
    type: 1,
    label: environmentName.value,
  };
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  axios
    .post("http://172.16.7.148:9200/environment/_doc/" + data.id + "/_create", {
      "id": data.id,
      "name" : data.label,
      "creationdate" : formattedDate,
      "modificationdate" : formattedDate
    })
    .then((res) => {
      environmentData.value.children.push(data);
      treeRef.value.append(data, environmentData.value);
      dialogEnvironmentVisible.value = false;
      treeRef.value.setCurrentKey(data);
      handleNodeClick(data);
    });
};

const treeRef = ref();

interface Tree {
  id: string;
  label: string;
  type: number;
  datas?: any[];
  children?: Tree[];
}

const environmentChange = (data: Tree) => {
  envName.value = data.label;
  const paramsToModify = {
    ENVIRONMENT: data.id,
  };
  Kelp.setEnv(paramsToModify);
  handleNodeClick(data);
};

const append = (data: Tree) => {
  environmentName.value = "";
  environmentData.value = data;
  dialogEnvironmentVisible.value = true;
};

const remove = (node: Node, data: Tree) => {
  treeRef.value.remove(node);
};

const handleNodeClick = (data: Tree) => {
  currentKey.value = data.id;
  tableData.value = [];
  data.datas && data.datas.forEach((item) => {
    tableData.value.push({
        name : item.name,
        code : item.code,
        note : item.note
    });
  });
};

const dataSource = ref<Tree[]>([
  {
    id: "1",
    label: "环境设置",
    type: 0,
    children: [],
  },
]);

interface User {
  name: string;
  code: string;
  note: string;
}

const handleEdit = (index: number, row: User) => {
  console.log(index, row);
};
const handleDelete = (index: number, row: User) => {
  console.log(index, row);
};

const tableData = ref<User[]>([
]);

const tableAdd = () => {
  tableData.value.push({
    name: "",
    code: "",
    note: "",
  });
};

const tableDelete = (index) => {
  tableData.value.splice(index, 1);
};

const tableSave = () => {
  const currentKey = treeRef.value.getCurrentKey();
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  axios
    .post("http://172.16.7.148:9200/environment/_doc/" + currentKey + "/_update", {
      "doc": {
        "datas":tableData.value,
        "modificationdate" : formattedDate
      }
    })
    .then((res) => {
      const currentNode =  treeRef.value.getNode(currentKey);
      currentNode.data.datas = tableData.value;
      ElMessage({
        type: "success",
        message: "保存成功！",
      });
    });

};
</script>
<style scoped>
.rightDefault-top {
  line-height: 10px;
  text-align: right;
}

.rightDefault-left {
  border: 1px solid #ccc;
  position: absolute;
  top: 30px;
  right: 70%;
  bottom: 0;
  left: 0;
}

.rightDefault-right {
  border: 1px solid #ccc;
  border-left: 0px;
  position: absolute;
  top: 30px;
  right: 0;
  bottom: 0;
  left: 30%;
}

::-webkit-scrollbar {
  width: 2px; /* 宽度为10px */
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
.custom-tree-node-opration {
  float: right;
}

.custom-tree-node a {
  display: none;
  float: left;
}

.custom-tree-node:hover a {
  display: block;
  float: left;
}

.right-top {
  position: absolute;
  left: 0px;
  top: 10px;
  right: 0px;
  height: 50px;
}

.right-top button {
  margin-right: 5px;
}

.right-bottom {
  position: absolute;
  left: 5px;
  top: 50px;
  right: 5px;
  bottom: 0px;
}
</style>