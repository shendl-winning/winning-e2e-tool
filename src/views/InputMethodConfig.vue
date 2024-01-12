<template>
  <div class="content">
    <el-tabs v-model="activeName" class="tabs" @tab-click="handleClick">
      <el-tab-pane label="输入方式管理" name="first">
        <el-table :data="inputmethods">
          <el-table-column label="名称">
            <template #default="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="所属分类">
            <template #default="scope">
              {{ scope.row.classifyname }}
            </template>
          </el-table-column>
          <el-table-column label="数据类型">
            <template #default="scope">
              {{ scope.row.datatype }}
            </template>
          </el-table-column>
          <el-table-column label="脚本" width="400">
            <template #default="scope">
              {{ scope.row.method }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="scope">
              <el-button size="small" @click="handleEdit(scope.row)"
                >编辑</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <div class="opbuttons">
      <el-button type="success" size="small" @click="handleAdd"
        >新 建</el-button
      >
      <el-button type="success" size="small" @click="handleLoad"
        >刷 新</el-button
      >
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="新增输入方式" width="50%">
    <div>
      <el-form :model="inputmethod" label-width="120px">
        <el-form-item label="名称:">
          <el-input v-model="inputmethod.name" type="text" />
        </el-form-item>
        <el-form-item label="所属分类:">
          <el-cascader
            v-model="inputmethod.classifyname"
            :options="classifyOptions"
          />
        </el-form-item>
        <el-form-item label="数据类型:">
          <el-select
            size="small"
            v-model="inputmethod.datatype"
          >
            <el-option label="值" value="值" />
            <el-option label="对象" value="对象" />
            <el-option label="数组" value="数组" />
          </el-select>
        </el-form-item>
        <el-form-item label="脚本代码:">
          <Codemirror
            v-model:value="inputmethod.method"
            :options="cmOptions"
            border
            height="200"
          ></Codemirror>
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleConfirm"> 确认 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import "codemirror/lib/codemirror.css";
import axios from "axios";
import {
  Bottom,
  Plus,
  Delete,
  CaretRight,
  Coin,
  Timer,
} from "@element-plus/icons-vue";
import { ref, reactive, onMounted } from "vue";
import type { TabsPaneContext } from "element-plus";
import { v4 as uuidv4 } from "uuid";

import Codemirror from "codemirror-editor-vue3";
import type { Editor, EditorConfiguration } from "codemirror";
import "codemirror/addon/display/placeholder.js";
import "codemirror/mode/javascript/javascript.js";
import "codemirror/theme/night.css";

const activeName = ref("first");

let inputmethods = ref([]);
const handleLoad = () => {
  inputmethods.value = [];
  axios
    .post("http://172.16.7.148:9200/inputmethod/_doc/_search", {
      from: 0,
      size: 100,
      query: {
        match_all: {},
      },
      sort: {
        modificationdate: {
          order: "desc",
        },
      },
    })
    .then((res) => {
      res.data.hits.hits.forEach((element) => {
        let inputmethod = element._source;
        inputmethods.value.push({
          id: inputmethod.id,
          name: inputmethod.name, 
          classifyname: inputmethod.classifyname.join("/"),
          datatype: inputmethod.datatype,
          method: inputmethod.method,
        });
      });
    });
};
const handleAdd = () => {
  inputmethod.value = {
    id: uuidv4(),
    name: "",
    classifyname: "",
    datatype: "值",
    method: "",
  };
  dialogStat = "add";
  dialogVisible.value = true;
};
const handleEdit = (row) => {
  axios
    .get("http://172.16.7.148:9200/inputmethod/_doc/" + row.id)
    .then((res) => {
      const im = res.data._source;
      inputmethod.value.id = im.id;
      inputmethod.value.name = im.name;
      inputmethod.value.classifyname = im.classifyname;
      inputmethod.value.datatype = im.datatype;
      inputmethod.value.method = im.method;
      dialogStat = "edit";
      dialogVisible.value = true;
    });
};
const handleDelete = (row) => {
  axios
    .delete("http://172.16.7.148:9200/inputmethod/_doc/" + row.id)
    .then((res) => {
      handleLoad();
    });
};

handleLoad();
let dialogVisible = ref(false);
let dialogStat = "";
let inputmethod = ref({
  id: "",
  name: "",
  classifyname: "",
  datatype: "",
  method: "",
});

const handleConfirm = () => {
  let action = "/_update";
  let param = {};
  let p = {
    id: inputmethod.value.id,
    name: inputmethod.value.name,
    classifyname: inputmethod.value.classifyname,
    datatype: inputmethod.value.datatype,
    method: inputmethod.value.method,
  };
  if (dialogStat == "add") {
    action = "/_create";
    param = p;
    param["creationdate"] = "2023-12-11";
    param["modificationdate"] = "2023-12-11 16:08:06";
  }
  if (dialogStat == "edit") {
    param["doc"] = p;
  }
  axios
    .post(
      "http://172.16.7.148:9200/inputmethod/_doc/" +
        inputmethod.value.id +
        action,
      param
    )
    .then((res) => {
      handleLoad();
      dialogVisible.value = false;
    });
};

let classifyOptions = reactive([]);
classifyOptions = [
  {
    value: "通用表单",
    label: "通用表单",
    children: [
      {
        value: "id直接定位",
        label: "id直接定位",
      },
      {
        value: "attr属性定位",
        label: "attr属性定位",
      },
    ],
  },
  {
    value: "基本公卫5.6",
    label: "基本公卫5.6",
    children: [
      {
        value: "1.0表单",
        label: "1.0表单",
      },
      {
        value: "",
        label: "2.0表单",
        disabled: true,
      },
    ],
  },
  {
    value: "",
    label: "基层HIS5.6",
    disabled: true,
    children: [],
  },
];

const cminstance = ref<Editor>();
const cmOptions: EditorConfiguration = {
  mode: "text/javascript", // Language mode
  //theme: "night", // Theme
  lineWrapping: true,
  lineNumbers: true,
  placeholder:
    "请使用cypress的语法。\n案例：$body.find('#'+ name).clear().type(mock);",
};
</script>

<style scoped>
.content {
  position: relative;
  width: 100%;
  height: 100%;
}

:global(.el-tabs) {
  height: 100%;
}

:global(.el-tabs__content) {
  position: absolute;
  top: 50px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

::-webkit-scrollbar {
  width: 2px; /* 宽度为10px */
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
}

.opbuttons {
  position: absolute;
  top: 0px;
  right: 0px;
}

:deep(.el-form-item__content) {
  line-height: 20px;
}

:deep(.CodeMirror-gutters) {
  left: 0px !important;
  width: 27px !important;
}

:deep(.CodeMirror-sizer) {
  margin-left: 30px !important;
}

:deep(.CodeMirror-gutter-wrapper) {
  left: -30px !important;
}
</style>