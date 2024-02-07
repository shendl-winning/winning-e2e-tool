<template>
  <div class="content">
    <el-tabs v-model="activeName" class="tabs" @tab-remove="removeTab">
      <el-tab-pane label="交互节点管理" name="first">
        <el-table :data="steps">
          <el-table-column label="节点名称">
            <template #default="scope">
              {{ scope.row.name }}
            </template>
          </el-table-column>
          <el-table-column label="活动名称" width="100">
            <template #default="scope">
              {{ scope.row.action }}
            </template>
          </el-table-column>
          <el-table-column label="唯一标识">
            <template #default="scope">
              {{ scope.row.key }}
            </template>
          </el-table-column>
          <el-table-column label="Iframe标识">
            <template #default="scope">
              {{ scope.row.iframekey }}
            </template>
          </el-table-column>
          <el-table-column label="上级节点">
            <template #default="scope">
              <span v-for="(item, index) in scope.row.parentid" :key="index">
                <span v-if="index != 0">,</span>
                {{ item.label }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
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
      <el-tab-pane
        v-if="editableTab"
        :label="editableTabtitle"
        name="second"
        closable="true"
      >
        <div class="content1-left">
          <el-form label-width="120px">
            <el-form-item label="节点名称:">
              <el-input v-model="step.name" type="text" size="small" />
            </el-form-item>
            <el-form-item label="活动名称:">
              <el-select
                v-model="step.action"
                placeholder="Select"
                size="small"
                @change="actionChange"
              >
                <el-option
                  v-for="item in actionOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="唯一标识:">
              <el-input v-model="step.key" type="text" size="small" />
            </el-form-item>
            <el-form-item label="Iframe标识:">
              <el-cascader
                v-model="step.iframekey"
                :options="iframekeyOptions"
                :props="props1"
                clearable
                :show-all-levels="false"
                size="small"
              />
            </el-form-item>
            <el-form-item label="上级节点">
              <el-select
                v-model="step.parentid"
                multiple
                size="small"
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键字"
                :remote-method="remoteParentSteps"
                :loading="loading"
              >
                <el-option
                  v-for="item in parentStepOptions"
                  :key="item.step.value"
                  :label="item.step.label"
                  :value="item.step"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <div style="text-align: center">
            <el-button @click="handleCancel">取 消</el-button>
            <el-button type="primary" @click="handleConfirm">保 存</el-button>
          </div>
        </div>
        <div :class="rightDataClass">
          <el-tree
            :data="dataSource"
            node-key="id"
            default-expand-all
            :expand-on-click-node="false"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <span>
                  <el-input
                    size="small"
                    v-model="data.fieldCode"
                    v-bind:style="{ width: setField0Width(data) }"
                    :disabled="data.disabled"
                  />
                  <el-select
                    v-model="data.fieldInputMethod"
                    size="small"
                    filterable
                    remote
                    reserve-keyword
                    placeholder="请输入关键字"
                    :remote-method="remoteInputMethod"
                    :loading="loading"
                    :disabled="data.disabled"
                    style="width: 120px"
                    @change="
                      (val) => {
                        changeInputMethod(val, data);
                      }
                    "
                  >
                    <el-option
                      v-for="item in options"
                      :key="item.inputmethod.value"
                      :label="item.inputmethod.label"
                      :value="item.inputmethod"
                    />
                  </el-select>
                  <el-select
                    style="width: 70px"
                    size="small"
                    v-model="data.inputDataType"
                    :disabled="data.disabled"
                  >
                    <el-option label="值" value="0" />
                    <el-option label="对象" value="1" />
                    <el-option label="数组" value="2" />
                  </el-select>
                  <el-input
                    size="small"
                    v-model="data.mock"
                    style="width: 150px"
                    :disabled="data.disabled"
                  />
                  <el-input
                    size="small"
                    v-model="data.fieldCname"
                    style="width: 120px"
                    :disabled="data.disabled"
                  />
                </span>
                <span style="float: right">
                  <a @click="append(node, data)">
                    <el-icon><Plus /></el-icon>
                  </a>
                  <a @click="remove(node, data)">
                    <el-icon><Delete /></el-icon>
                  </a>
                </span>
              </span>
            </template>
          </el-tree>
        </div>
        <div :class="rightAssertionClass">
          <el-button
            size="small"
            style="float: right; margin-top: 3px"
            @click="assertionHandleAdd"
            >+断言</el-button
          >
          <el-table :data="Assertions">
            <el-table-column label="标题">
              <template #default="scope">
                判断（ {{ scope.row.selector }} ）, {{ scope.row.asser.label }}
              </template>
            </el-table-column>
            <el-table-column label="是否启用" width="100">
              <template #default="scope">
                <el-switch
                  v-model="scope.row.enable"
                  inline-prompt
                  active-text="启用"
                  inactive-text="不启用"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="scope">
                <el-button
                  size="small"
                  @click="assertionHandleEdit(scope.$index, scope.row)"
                  >编辑</el-button
                >
                <el-button
                  size="small"
                  type="danger"
                  @click="assertionHandleDelete(scope.$index, scope.row)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="opbuttons">
      <el-button type="info" size="small" @click="openDialog"
        >思维导图</el-button
      >

      <el-button type="success" size="small" @click="handleAdd"
        >新 建</el-button
      >
      <el-button type="success" size="small" @click="handleLoad"
        >刷 新</el-button
      >
    </div>
  </div>

  <el-dialog v-model="dialogVisible" title="思维导图" width="70%">
    <div style="height: 500px">
      <VueFlow>
        <Background />
        <Controls position="top-right"></Controls>
        <template>
          <FlowNodeGroup />
        </template>
      </VueFlow>
    </div>
  </el-dialog>

  <el-dialog v-model="dialogAssertionVisible" title="断言" width="30%">
    <el-form>
      <el-form-item label="元素选择器：" label-width="100px">
        <el-input v-model="Assertion.selector" type="text" size="small" />
      </el-form-item>
      <el-form-item label="断言：" label-width="100px">
        <el-select v-model="Assertion.asser" placeholder="Select" size="small">
          <el-option
            v-for="item in Assertion.options"
            :key="item.value"
            :label="item.label"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="内容：" label-width="100px">
        <el-input v-model="Assertion.content" type="text" size="small" />
      </el-form-item>
      <el-form-item label="是否启用：" label-width="100px">
        <el-switch v-model="Assertion.enable" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogAssertionVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogAssertionConfirm">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import axios from "axios";
import { ref, reactive, inject, onMounted } from "vue";
import type { TabsPaneContext } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";
import { VueFlow, useVueFlow, Position, getRectOfNodes } from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
import { MiniMap } from "@vue-flow/minimap";
import FlowNodeGroup from "@/views/FlowNodeGroup.vue";
import { vueFlowSetRoot, vueFlowInit } from "@/common/vue-flow";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import "@vue-flow/controls/dist/style.css";
import "@vue-flow/minimap/dist/style.css";
import moment from "moment";

const proid = inject("proid");
const activeName = ref("first");
const editableTab = ref(false);
const editableTabtitle = ref("");
const dialogVisible = ref(false);
const dialogAssertionVisible = ref(false);
let rightDataClass = ref(["content1-right", "content1-data"]);
let rightAssertionClass = ref(["content1-right", "content1-assertion"]);

const {
  getNode,
  getNodes,
  addNodes,
  addEdges,
  nodes,
  edges,
  onPaneReady,
  setViewport,
} = useVueFlow({
  nodesDraggable: true,
  // set this to true so edges get elevated when selected, defaults to false
  fitViewOnInit: false,
  nodes: [],
  edges: [],
});

const openDialog = () => {
  dialogVisible.value = true;
};

const removeTab = (targetName: string) => {
  if (activeName.value === targetName) {
    activeName.value = "first";
  }
  editableTab.value = false;
};

interface Datas {
  id: string;
  level: number;
  disabled: boolean;
  fieldCode: string;
  fieldInputMethod: any;
  inputDataType: string;
  mock: string;
  fieldCname: string;
  children?: Datas[];
}

interface Step {
  id: string;
  name: string;
  action: string;
  key: string;
  iframekey: string;
  parentid: string[];
  assertion?: any[];
  datas?: Datas[];
}

let steps = ref<Step[]>([]);
let dialogStat = "";

const handleLoad = () => {
  steps.value = [];
  axios
    .post("http://172.16.7.148:9200/step/_doc/_search", {
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
        let step = element._source;
        steps.value.push({
          id: step.id,
          name: step.name,
          action: step.action,
          key: step.key,
          iframekey: step.iframekey,
          parentid: step.parentid,
          assertion: [],
          datas: [],
        });
        if (step.parentid.length == 0) {
          vueFlowSetRoot(step.id);
        }
        addNodes({
          id: step.id,
          label: step.name,
          position: { x: 0, y: 0 },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        });
        step.parentid.forEach((parent) => {
          addEdges({
            id: uuidv4(),
            source: parent.value,
            target: step.id,
          });
        });
      });
      vueFlowInit(
        getNode,
        getNodes,
        addNodes,
        addEdges,
        nodes,
        edges,
        onPaneReady,
        setViewport
      );
    });
};

const handleAdd = () => {
  step.value = {
    id: uuidv4(),
    name: "",
    action: "",
    key: "",
    iframekey: "",
    parentid: [],
    assertion: [],
    datas: [],
  };
  dataSource.value[0].children = [];
  dialogStat = "add";
  activeName.value = "second";
  editableTab.value = true;
  editableTabtitle.value = "新增交互节点";
  actionChange(step.value.action);
};
const handleEdit = (row) => {
  axios.get("http://172.16.7.148:9200/step/_doc/" + row.id).then((res) => {
    const im = res.data._source;
    step.value.id = im.id;
    step.value.name = im.name;
    step.value.action = im.action;
    step.value.key = im.key;
    step.value.iframekey = im.iframekey;
    step.value.parentid = im.parentid;
    step.value.assertion = im.assertion;
    step.value.datas = im.datas;
    dataSource.value[0].children = im.datas;
    Assertions.value = im.assertion;
    dialogStat = "edit";
    activeName.value = "second";
    editableTab.value = true;
    editableTabtitle.value = "修改交互节点";
    actionChange(im.action);
  });
};
const handleDelete = (row) => {
  axios.delete("http://172.16.7.148:9200/step/_doc/" + row.id).then((res) => {
    handleLoad();
  });
};

handleLoad();

let step = ref<Step>({
  id: "",
  name: "",
  action: "",
  key: "",
  iframekey: "",
  parentid: [],
  assertion: [],
  datas: [],
});

const actionOptions = [
  {
    value: "visit",
    label: "visit",
  },
  {
    value: "fill",
    label: "fill",
  },
  {
    value: "click",
    label: "click",
  },
  {
    value: "hover",
    label: "hover",
  },
];

const actionChange = (value) => {
  if (value == "fill") {
    rightDataClass.value = ["content1-right", "content1-data-for-fill"];
    rightAssertionClass.value = [
      "content1-right",
      "content1-assertion-for-fill",
    ];
  } else {
    rightDataClass.value = ["content1-right", "content1-data"];
    rightAssertionClass.value = ["content1-right", "content1-assertion"];
  }
};

const props1 = {
  checkStrictly: true,
};

const iframekeyOptions = [
  {
    value: "iframe[data-id=1002]",
    label: "Tab对应的ifarme",
    children: [
      {
        value: "iframe[id=prmIframe]",
        label: "列表、表单对应的ifarme",
      },
    ],
  },
];

const parentStepOptions = ref([
  {
    step: { value: "", label: "" },
  },
]);

const remoteParentSteps = (query: string) => {
  parentStepOptions.value = [];
  if (query) {
    loading.value = true;
    axios
      .post("http://172.16.7.148:9200/step/_doc/_search", {
        from: 0,
        size: 10,
        query: {
          wildcard: {
            name: "*" + query + "*",
          },
        },
        sort: {
          modificationdate: {
            order: "desc",
          },
        },
      })
      .then((res) => {
        loading.value = false;
        res.data.hits.hits.forEach((element) => {
          let step = element._source;
          parentStepOptions.value.push({
            step: {
              value: step.id,
              label: step.name,
            },
          });
        });
      });
  }
};

const handleCancel = () => {
  activeName.value = "first";
  editableTab.value = false;
};

const handleConfirm = () => {
  let action = "/_update";
  let param = {};
  let p = {
    id: step.value.id,
    name: step.value.name,
    action: step.value.action,
    key: step.value.key,
    iframekey: step.value.iframekey,
    parentid: step.value.parentid,
    assertion: Assertions.value,
    datas: dataSource.value[0].children,
  };
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  p["modificationdate"] = formattedDate;
  if (dialogStat == "add") {
    action = "/_create";
    param = p;
    param["creationdate"] = formattedDate;
  }
  if (dialogStat == "edit") {
    param["doc"] = p;
  }
  console.log(param);
  axios
    .post("http://172.16.7.148:9200/step/_doc/" + step.value.id + action, param)
    .then((res) => {
      activeName.value = "first";
      editableTab.value = false;
      handleLoad();
    });
};

const setField0Width = (data: Datas) => {
  let width = 250;
  width = width - data.level * 18;
  return width + "px";
};

const options = ref([]);
const loading = ref(false);

const remoteInputMethod = (query: string) => {
  options.value = [];
  if (query) {
    loading.value = true;
    axios
      .post("http://172.16.7.148:9200/inputmethod/_doc/_search", {
        from: 0,
        size: 100,
        query: {
          wildcard: {
            name: "*" + query + "*",
          },
        },
        sort: {
          modificationdate: {
            order: "desc",
          },
        },
      })
      .then((res) => {
        loading.value = false;
        res.data.hits.hits.forEach((element) => {
          let inputmethod = element._source;
          options.value.push({
            inputmethod: {
              value: inputmethod.id,
              label: inputmethod.name,
              datatype: inputmethod.datatype,
            },
          });
        });
      });
  }
};

const changeInputMethod = (value, data) => {
  if (value.datatype) data.inputDataType = value.datatype;
};

const dataSource = ref<Datas[]>([
  {
    id: uuidv4(),
    disabled: true,
    level: 0,
    fieldCode: "字段",
    fieldInputMethod: "输入方式",
    inputDataType: "1",
    mock: "Mock值",
    fieldCname: "备注",
    children: [],
  },
]);

const append = (node: Node, data: Datas) => {
  const newChild = {
    id: uuidv4(),
    level: data.level,
    disabled: false,
    fieldCode: "",
    fieldInputMethod: {},
    inputDataType: "0",
    mock: "",
    fieldCname: "",
    children: [],
  };

  const itemChild = {
    id: uuidv4(),
    level: data.level + 1,
    disabled: true,
    fieldCode: "item",
    fieldInputMethod: " ",
    inputDataType: "1",
    mock: "",
    fieldCname: "",
    children: [],
  };

  if (data.inputDataType == "0") {
    const children: Datas[] = node.parent.data.children || node.parent.data;
    children.splice(children.indexOf(data) + 1, 0, newChild);
  } else {
    if (!data.children) {
      data.children = [];
    }
    if (data.inputDataType == "1") {
      newChild.level = data.level + 1;
      data.children.push(newChild);
    } else {
      data.children.push(itemChild);
    }
  }
};

const remove = (node: Node, data: Datas) => {
  console.log(data);
  const parent = node.parent;
  const children: Datas[] = parent.data.children || parent.data;
  const index = children.findIndex((d) => d.id === data.id);
  children.splice(index, 1);
};

const Assertion = ref({
  id: "",
  selector: "",
  options: [
    {
      value: "be.visible",
      label: "元素可见",
    },
  ],
  asser: null,
  content: "",
  enable: true,
  index : 0
});

const Assertions = ref([]);

const assertionHandleAdd = () => {
  Assertion.value.index = 0;
  Assertion.value.id = "";
  Assertion.value.selector = "";
  Assertion.value.asser = null;
  Assertion.value.content = "";
  Assertion.value.enable = true;
  dialogAssertionVisible.value = true;
};

const dialogAssertionConfirm = () => {
  dialogAssertionVisible.value = false;
  const asser = {
      id: Assertion.value.id,
      selector: Assertion.value.selector,
      asser: Assertion.value.asser,
      content: Assertion.value.content,
      enable: Assertion.value.enable,
    }
  if (asser.id) {
    Assertions.value[Assertion.value.index] = asser;
  } else {
    asser.id = uuidv4();
    Assertions.value.push(asser);
  }
};

const assertionHandleEdit = (index, asser) => {
  Assertion.value.index = index;
  Assertion.value.id = asser.id;
  Assertion.value.selector = asser.selector;
  Assertion.value.asser = asser.asser;
  Assertion.value.content = asser.content;
  Assertion.value.enable = asser.enable;
  dialogAssertionVisible.value = true;
};

const assertionHandleDelete = (index, asser) => {
  Assertions.value.splice(index, 1);
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

/*
:global(.el-dialog__body) {
  height: 500px;
}

:global(.vue-flow__node) {
  height: 40px;
}
*/

.content1-left {
  position: absolute;
  top: 0px;
  right: 70%;
  left: 0px;
  bottom: 0px;
  margin-right: 5px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px 20px 0px 0px;
}

.content1-right {
  position: absolute;
  right: 0px;
  left: 30%;
  bottom: 50%;
  border: 1px solid #ccc;
  overflow: scroll;
  padding: 0px 5px;
}

.content1-data-for-fill {
  top: 0px;
  bottom: 50%;
  padding-top: 3px;
}

.content1-assertion-for-fill {
  margin-top: 5px;
  top: 50%;
  bottom: 0px;
}

.content1-data {
  top: 0px;
  bottom: 100%;
}

.content1-assertion {
  top: 0;
  bottom: 0px;
}

::-webkit-scrollbar {
  width: 2px; /* 宽度为10px */
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
}

.custom-tree-node {
  width: 100%;
}

.opbuttons {
  position: absolute;
  top: 0px;
  right: 0px;
}
</style>