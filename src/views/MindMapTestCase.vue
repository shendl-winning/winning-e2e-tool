<template>
  <div class="content">
    <el-tabs v-model="activeName" class="tabs">
      <el-tab-pane label="测试用例" name="first">
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
                @dblclick="stepDblClickHandl(step, index)"
              >
                <el-checkbox v-model="step.check" /> {{ step.name }}
                <el-icon v-if="step.datas.length > 0"><Document /></el-icon>
                <el-icon :class="['icon', stepActive == index ? 'active' : '']"
                  ><CaretRight
                /></el-icon>
                <el-icon class="icon" @click="stepDelete(index)"
                  ><Delete
                /></el-icon>
              </div>
            </div>
            <div class="tab1bottom">
              <el-button type="primary" @click="stepAdd">添加步骤</el-button>
              <el-button type="primary" @click="stepAddWithFlow"
                >添加步骤(交互图)</el-button
              >
            </div>
          </el-form>
        </div>
        <div :class="rightDataClass">
          <stepData v-model="stepDatas" :productid="productid"></stepData>
        </div>
        <div :class="rightAssertionClass">
          <stepAssertion
            v-model="stepAssertions"
            :iframekey="stepIframekey"
            :iframekeyOptions="iframekeyOptions"
          ></stepAssertion>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="opbuttons">
      <el-button @click="execute" size="small" v-if="env">单例启动</el-button>
      <el-button type="success" size="small" @click="testCaseModifyHandlConfirm"
        >保 存</el-button
      >
    </div>
  </div>

  <el-dialog v-model="dialogVisible" title="Tips" width="35%">
    <el-form>
      <el-form-item label="下级节点: ">
        <el-select
          v-model="nextstep"
          value-key="id"
          filterable
          remote
          reserve-keyword
          placeholder="请输入关键字"
          :remote-method="remoteParentSteps"
          :loading="loading"
          class="custerClass"
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

  <el-dialog v-model="flowDialogVisible" width="90%" style="height: 600px">
    <div
      style="
        position: absolute;
        top: 50px;
        bottom: 0px;
        left: 10px;
        width: 340px;
        border-right: 1px #ccc solid;
      "
    >
      <el-tree
        ref="treeRef"
        style="max-width: 350px"
        :data="groupSelect"
        show-checkbox
        check-strictly
        default-expand-all
        :default-checked-keys="groupids"
        node-key="id"
        highlight-current
        :props="defaultProps"
        @check="getCheckedKeys"
      />
    </div>
    <div
      style="
        position: absolute;
        top: 50px;
        bottom: 0px;
        left: 360px;
        right: 20px;
      "
    >
      <mindMap v-model="groupids4temp" @getMindMapids="getMindMapids"></mindMap>
    </div>
    <!--  -->
  </el-dialog>
  <el-dialog
    v-model="stepDialogVisible"
    title="测试用例步骤"
    width="80%"
    style="height: 600px"
  >
    <stepView
      v-model="step"
      :productid="productid"
      :groupid="groupid"
      @update:stepsItem="updateStepsItem"
      @update:dialogVisible="
        (b) => {
          stepDialogVisible = b;
        }
      "
    ></stepView>
  </el-dialog>
</template>
<script setup lang="ts">
import axios from "axios";
import { ref, reactive, onMounted, inject, provide } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import type { TabsPaneContext } from "element-plus";
import { ElMessage, ElNotification } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import "element-plus/es/components/message/style/css";
import moment from "moment";
import stepData from "@/components/stepData/stepData.vue";
import stepAssertion from "@/components/stepAssertion/stepAssertion.vue";
import stepView from "@/components/step/stepView.vue";
import mindMap from "@/views/MindMapStepConfig.vue";
import { ElTree } from "element-plus";

let proid = inject("proid").value;
let testcaseid = proid.id;
let testcasename = proid.name;
let groupids = proid.groupids;
let productid = proid.productid;
let productname = proid.productname;

let props = ref({
  id: groupids[0],
  groupids: groupids,
  productid: productid,
  productname: productname,
});

provide("proid", props);

const env = ref();
const execute = () => {
  Kelp.execute(
    "yarn run cypress open --env id=" + testcaseid + ",envid=" + env.value
  );
};

const iframekeyOptions = [
  {
    value: "iframe:visible",
    label: "Tab对应的ifarme",
    children: [
      {
        value: "iframe:visible",
        label: "列表、表单对应的ifarme",
      },
    ],
  },
];

const activeName = ref("first");
const stepActive = ref(0);
let rightDataClass = ref(["content1-right", "content1-data"]);
let rightAssertionClass = ref(["content1-right", "content1-assertion"]);
const stepDatas = ref();
const stepAssertions = ref();
const stepIframekey = ref();
const stepClickHandl = (step, index) => {
  stepActive.value = index;
  stepDatas.value = step.datas;
  stepAssertions.value = step.assertion;
  stepIframekey.value = step.iframekey;
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

interface Step {
  id: string;
  name: string;
  action: string;
  check: boolean;
  assertion: any[];
  datas: any[];
  iframekey: string;
  sort: number;
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

const groupSelect = ref([]);
const autofocus = ref(null);
onMounted(() => {
  axios
    .post("http://172.16.7.148:9200/manages/_doc/_search", {
      from: 0,
      size: 10000,
      query: {
        bool: {
          must: [
            {
              term: {
                productid: productid,
              },
            },
            {
              terms: {
                type: ["3", "4"],
              },
            },
          ],
        },
      },
    })
    .then((res) => {
      const manageTemp = {};
      res.data.hits.hits.forEach((element) => {
        let manage = element._source;
        manageTemp[manage.id] = {
          id: manage.id,
          label: manage.name,
          sort: manage.sort,
          parentid: manage.parentid,
          productid: manage.productid,
          children: [],
        };
      });
      let root = [];
      Object.keys(manageTemp).forEach((key) => {
        if (manageTemp[key].parentid != manageTemp[key].productid) {
          if (manageTemp[manageTemp[key].parentid]) {
            let arr = manageTemp[manageTemp[key].parentid].children;
            arr.push(manageTemp[key]);
            arr.sort((a, b) => a.sort - b.sort);
          }
        } else {
          root.push(manageTemp[key]);
        }
      });
      if (root) {
        groupSelect.value = root;
      }
    });

  env.value = Kelp.getEnv("ENVIRONMENT");
  //console.log(env.value)
  autofocus.value.focus();
  axios
    .get("http://172.16.7.148:9200/testcase/_doc/" + testcaseid)
    .then((res) => {
      testcase.value = res.data._source;
      const ids = [];
      testcase.value.steps &&
        testcase.value.steps.map((step) => {
          ids.push(step.id);
        });
      axios
        .post("http://172.16.7.148:9200/step/_doc/_search", {
          from: 0,
          size: 10000,
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

          testcase.value.steps &&
            testcase.value.steps.map((step) => {
              step.name = id_name[step.id];
            });
        });
      testcase.value.steps &&
        testcase.value.steps.length > 0 &&
        stepClickHandl(testcase.value.steps[0], 0);
    });
});

const loading = ref(false);
const dialogVisible = ref(false);
const nextstep = ref<Step>();
const parentStepOptions = ref<Step[]>([]);

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
      query: {
        bool: {
          must: [
            {
              term: {
                product: productid,
              },
            },
            querystring,
          ],
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
        delete step.modificationdate;
        delete step.creationdate;
        step.check = true;
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
  if (nextstep.value) {
    testcase.value.steps.push(nextstep.value);
    stepDatas.value = nextstep.value.datas;
    stepAssertions.value = nextstep.value.assertion;
    stepIframekey.value = nextstep.value.iframekey;
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
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");

  let bulk = "\n";
  bulk +=
    '{ "index":  { "_index": "testcase", "_type": "_doc" , "_id": "' +
    testcaseid +
    '"}}\n';
  bulk +=
    '{"id": "' +
    testcaseid +
    '","name": "' +
    testcase.value.name +
    '","describe": "' +
    testcase.value.describe +
    '","steps": ' +
    (JSON.stringify(testcase.value.steps) || null) +
    ',"creationdate": "' +
    formattedDate +
    '","modificationdate": "' +
    formattedDate +
    '"}\n';
  bulk += "\n";
  console.log(bulk);
  axios
    .post("http://172.16.7.148:9200/_bulk", bulk, {
      headers: {
        "Content-Type": "application/x-ndjson",
      },
    })
    .then((res) => {
      ElMessage({
        message: "保存成功.",
        type: "success",
      });
    });
};

const flowDialogVisible = ref(false);
const treeRef = ref<InstanceType<typeof ElTree>>();
const groupids4temp = ref([]);
const getCheckedKeys = () => {
  groupids4temp.value = treeRef.value!.getCheckedKeys(false);
};
const defaultProps = {
  children: "children",
  label: "label",
};

const stepAddWithFlow = () => {
  flowDialogVisible.value = true;
};

const getMindMapids = (ids) => {
  var newArray = ids.slice(1);
  axios
    .post("http://172.16.7.148:9200/step/_doc/_search", {
      from: 0,
      size: 10000,
      query: {
        terms: {
          id: newArray,
        },
      },
    })
    .then((res) => {
      const sorts = {};
      const temp = [];
      newArray.forEach((key, index) => {
        sorts[key] = index;
      });
      res.data.hits.hits.forEach((element) => {
        let step = element._source;
        if (!testcase.value.steps) {
          testcase.value.steps = [];
        }
        step.sort = sorts[step.id];
        delete step.modificationdate;
        delete step.creationdate;
        step.check = true;
        temp.push(step);
      });

      temp.sort((a, b) => a.sort - b.sort);
      testcase.value.steps = testcase.value.steps.concat(temp);
      flowDialogVisible.value = false;
    });
};

const step = ref({
  id: "",
  name: "",
  action: "",
  key: "",
  iframekey: [],
  parentid: [],
  assertion: [],
  datas: [],
  wait: null,
  group: "",
  sort: 0,
});
let itemIndex = 0;
const stepDialogVisible = ref(false);
const stepDblClickHandl = (item, index) => {
  itemIndex = index;
  stepDialogVisible.value = true;
  axios.get("http://172.16.7.148:9200/step/_doc/" + item.id).then((res) => {
    const im = res.data._source;
    step.value.id = im.id;
    step.value.name = im.name;
    step.value.action = im.action;
    step.value.key = im.key;
    step.value.iframekey = im.iframekey;
    step.value.parentid = im.parentid;
    step.value.assertion = im.assertion;
    step.value.datas = im.datas;
    step.value.wait = im.wait;
    step.value.group = im.group;
  });
};

const updateStepsItem = (step) => {
  const check = testcase.value.steps[itemIndex].check;
  step.value.check = check;
  testcase.value.steps.splice(itemIndex, 1, Object.assign({}, step.value));
  stepClickHandl(step.value, itemIndex);
  stepDialogVisible.value = false;
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
  right: 65%;
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
  left: 35%;
  bottom: 50%;
  border: 1px solid #ccc;
  overflow: scroll;
  padding: 0px 5px;
}

.content1-data-for-fill {
  top: 0px;
  bottom: 30%;
  padding-top: 3px;
}

.content1-assertion-for-fill {
  margin-top: 5px;
  top: 70%;
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

.custerClass > :deep(.select-trigger) {
  width: 300px !important;
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