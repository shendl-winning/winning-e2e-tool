<template>
  <div class="content">
    <el-tabs v-model="activeName" class="tabs">
      <el-tab-pane label="用例步骤" name="first">
        <div class="content1-left">
          <el-form>
            <div class="tab1top">
              <el-form-item label="用例名称：">
                <el-input
                  v-model="testcase.name"
                  autocomplete="off"
                  ref="autofocus"
                  readonly
                />
              </el-form-item>
              <el-form-item label="用例目的：">
                <el-input
                  v-model="testcase.describe"
                  autocomplete="off"
                  type="textarea"
                />
              </el-form-item>
            </div>
            <div class="tab1steps">
              <div
                v-for="(step, index) in testcase.steps"
                :key="index"
                :class="['step', stepActive == index ? 'active' : '']"
                @click="stepClickHandl(step, index)"
              >
                <el-checkbox v-model="step.check" /> {{ step.name }}
                <el-icon v-if="step.datas.length > 0"><Document /></el-icon>
                <el-icon :class="['icon', stepActive == index ? 'active' : '']"
                  ><CaretRight
                /></el-icon>
                <el-icon class="icon" @click="stepDelete(index)"><Delete /></el-icon>
              </div>
            </div>
            <div class="tab1bottom">
              <el-button type="primary" @click="stepAdd">添加步骤</el-button>
            </div>
          </el-form>
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
          <el-button size="small" style="float: right; margin-top: 3px"
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
      <el-button @click="execute" size="small">单例启动</el-button>
      <el-button type="success" size="small" @click="testCaseModifyHandlConfirm"
        >保 存</el-button
      >
    </div>
  </div>
  <el-dialog v-model="dialogVisible" title="Tips" width="25%">
    <el-form>
      <el-form-item label="下级节点: ">
        <el-select
          v-model="nextstep"
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
            :key="item.id"
            :label="item.name"
            :value="item"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="stepAddhandlCancel">取消</el-button>
        <el-button type="primary" @click="stepAddhandlConfirm">
          确定
        </el-button>
      </span>
    </template>
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
import {
  Bottom,
  Plus,
  Delete,
  CaretRight,
  Coin,
  Timer,
} from "@element-plus/icons-vue";
import { ref, reactive, onMounted, inject } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import type { TabsPaneContext } from "element-plus";
import { ElMessage, ElNotification } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import "element-plus/es/components/message/style/css";
import moment from "moment";

let proid = inject("proid").value;
let testcaseid = proid.id;
let testcasename = proid.name;
const execute = () => {
  Kelp.execute("yarn run cypress open --env id=" + testcaseid);
};
const activeName = ref("first");
const autofocus = ref(null);
const dialogAssertionVisible = ref(false);
let rightDataClass = ref(["content1-right", "content1-data"]);
let rightAssertionClass = ref(["content1-right", "content1-assertion"]);

interface Datas {
  id: string;
  level: number;
  disabled: boolean;
  fieldCode: string;
  fieldInputMethod: any;
  inputDataType: string;
  mock: string;
  fieldCname: string;
  children: Datas[];
}

interface Step {
  id: string;
  name: string;
  action: string;
  check: boolean;
  assertion: any[];
  datas: Datas[];
}

interface TestCase {
  id: string;
  name: string;
  describe: string;
  steps: Step[];
}
const testcase = ref<TestCase>({
  id: testcaseid,
  name: testcasename,
  describe: "",
  steps: [],
});
let testcaseAdded = true;
onMounted(() => {
  autofocus.value.focus();
  axios
    .get("http://172.16.7.148:9200/testcase/_doc/" + testcaseid)
    .then((res) => {
      testcase.value = res.data._source;
      const ids = [];
      testcase.value.steps.map((step) => {
        ids.push(step.id);
      });
      axios
        .post("http://172.16.7.148:9200/step/_doc/_search", {
          query: {
            terms: {
              id: ids,
            },
          },
        })
        .then((res) => {
          const id_name = {};
          res.data.hits.hits.forEach((element) => {
            let step = element._source;
            id_name[step.id] = step.name;
          });

          testcase.value.steps.map((step) => {
            step.name = id_name[step.id];
          });
        });
    })
    .catch((error) => {
      // 请求失败处理
      testcaseAdded = false;
    });
});
const stepActive = ref(0);
const loading = ref(false);
const dialogVisible = ref(false);
const nextstep = ref<Step>();
const parentStepOptions = ref<Step[]>([]);

const stepClickHandl = (step, index) => {
  stepActive.value = index;
  dataSource.value[0].children = step.datas;
  Assertions.value = step.assertion;
  if (step.action == "fill") {
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

const stepAdd = () => {
  nextstep.value = null;
  dialogVisible.value = true;
  parentStepOptions.value = [];
};
const stepDelete = (index) => {
  testcase.value.steps.splice(index, 1);
  stepActive.value = index - 1;
};

const remoteParentSteps = (query: string) => {
  parentStepOptions.value = [];
  let querystring = {};
  if (query) {
    querystring = {
      wildcard: {
        name: "*" + query + "*",
      },
    };
  } else if (testcase.value.steps.length == 0) {
    querystring = {
      term: {
        name: "访问系统",
      },
    };
  } else {
    const step = testcase.value.steps.slice(-1);
    querystring = {
      match: {
        "parentid.value": step[0].id,
      },
    };
  }
  loading.value = true;
  axios
    .post("http://172.16.7.148:9200/step/_doc/_search", {
      from: 0,
      size: 10,
      query: querystring,
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
        delete step.key;
        delete step.iframekey;
        delete step.parentid;
        delete step.modificationdate;
        delete step.creationdate;
        parentStepOptions.value.push(step);
      });
    });
};

const stepAddhandlCancel = () => {
  dialogVisible.value = false;
};
const stepAddhandlConfirm = () => {
  if (testcase.value.steps.length == 0) {
    testcase.value.steps = [];
  }
  //console.log(nextstep.value);
  if (nextstep.value) {
    testcase.value.steps.push(nextstep.value);
    dataSource.value[0].children = nextstep.value.datas;
    //console.log(nextstep.value.assertion);
    Assertions.value = nextstep.value.assertion;
    if (nextstep.value.action == "fill") {
      rightDataClass.value = ["content1-right", "content1-data-for-fill"];
      rightAssertionClass.value = [
        "content1-right",
        "content1-assertion-for-fill",
      ];
    } else {
      rightDataClass.value = ["content1-right", "content1-data"];
      rightAssertionClass.value = ["content1-right", "content1-assertion"];
    }
  }
  stepActive.value = testcase.value.steps.length - 1;
  dialogVisible.value = false;
};

const testCaseModifyHandlConfirm = () => {
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  let p = {
    doc: {
      id: testcase.value.id,
      name: testcase.value.name,
      describe: testcase.value.describe,
      steps: testcase.value.steps,
      modificationdate: formattedDate,
    },
  };
  let action = "/_update";
  if (!testcaseAdded) {
    action = "/_create";
    p.doc["creationdate"] = formattedDate;
  }
  axios
    .post(
      "http://172.16.7.148:9200/testcase/_doc/" + testcaseid + action,
      testcaseAdded ? p : p.doc
    )
    .then((res) => {
      ElMessage({
        message: "保存成功.",
        type: "success",
      });
    });
};

const setField0Width = (data: Datas) => {
  let width = 250;
  width = width - data.level * 18;
  return width + "px";
};

const options = ref([]);

const remoteInputMethod = (query: string) => {
  options.value = [];
  if (query) {
    loading.value = true;
    axios
      .post("http://172.16.7.148:9200/inputmethod/_doc/_search", {
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
  index: 0,
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
  };
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

.content1-left {
  position: absolute;
  top: 0px;
  right: 70%;
  left: 0px;
  bottom: 0px;
  margin-right: 5px;
  overflow-y: scroll;
}

.tab1top {
  padding: 0px 5px;
}

.tab1steps {
  padding: 0px 5px;
}

.tab1bottom {
  padding-top: 10px;
  text-align: center;
}

.tab1steps > .step {
  border-bottom: 1px solid #ccc;
}

.tab1steps > .active {
  border-bottom: 1px solid rgb(0, 0, 0) !important;
}

.tab1steps > .step > .icon {
  margin-top: 8px;
  float: right;
  display: none;
}

.tab1steps > .step > .active {
  display: block !important;
}

.tab1steps > .step:hover > .icon {
  display: block;
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