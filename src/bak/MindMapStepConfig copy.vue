<template>
  <winMap
    v-model="data"
    :branch="rangeList['branch'].value"
    :x-gap="rangeList['x-gap'].value"
    :y-gap="rangeList['y-gap'].value"
    :zoom="checkboxList['zoom'].value"
    :fit-btn="checkboxList['fit-btn'].value"
    :center-btn="checkboxList['center-btn'].value"
    :download-btn="checkboxList['download-btn'].value"
    :drag="checkboxList['drag'].value"
    :edit="checkboxList['edit'].value"
    :add-node-btn="checkboxList['add-node-btn'].value"
    :sharp-corner="checkboxList['sharp-corner'].value"
    :ctm="checkboxList['contextmenu'].value"
    :timetravel="checkboxList['timetravel'].value"
  ></winMap>
  <el-dialog
    v-model="dialogVisible"
    title="测试用例步骤"
    width="80%"
    style="height: 600px"
  >
    <div
      style="position: absolute; top: 50px; bottom: 0px; left: 0px; right: 0px"
    >
      <div class="content1-left">
        <el-form label-width="120px">
          <el-form-item label="节点名称:">
            <el-input v-model="step.parentid" type="hidden" size="small" />
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
              :props="{ checkStrictly: true }"
              clearable
              :show-all-levels="false"
              size="small"
            />
          </el-form-item>
          <el-form-item label="所属模块">
            <el-tree-select
              v-model="step.group"
              :data="groupSelect"
              check-strictly
              default-expand-all="true"
              size="small"
            />
          </el-form-item>
          <el-form-item label="等待时间:">
            <el-input-number v-model="step.wait" step="500" size="small" />
          </el-form-item>
        </el-form>
        <div style="text-align: center">
          <el-button @click="handleCancel">取 消</el-button>
          <el-button type="primary" @click="handleConfirm(step.id)"
            >保 存</el-button
          >
        </div>
      </div>
      <div :class="rightDataClass">
        <stepData v-model="step.datas" :productid="productid"></stepData>
      </div>
      <div :class="rightAssertionClass">
        <stepAssertion
          v-model="step.assertion"
          :iframekey="step.iframekey"
          :iframekeyOptions="iframekeyOptions"
        ></stepAssertion>
      </div>
    </div>
  </el-dialog>
</template>
<script lang="ts" setup>
import axios from "axios";
import { ref, reactive, inject, onMounted, defineComponent, watch } from "vue";
import {
  winMap,
  setStepDetailsEdit,
  setStepDetailsAppend,
  getStepList,
  setMindMapSave,
  setStepDetailsDelete,
  rushData,
} from "../components/mindMap/vue3-mindmap.es.js";
import "@/components/mindMap/style.css";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import stepData from "@/components/stepData/stepData.vue";
import stepAssertion from "@/components/stepAssertion/stepAssertion.vue";
import { ElMessage } from "element-plus";

let proid = inject("proid").value;
let groupid = proid.id;
let groupids = proid.groupids;
let productid = proid.productid;
let productname = proid.productname;

const actionOptions = [
  {
    value: "visit",
    label: "系统访问",
  },
  {
    value: "fill",
    label: "表单填充",
  },
  {
    value: "click",
    label: "鼠标单击",
  },
  {
    value: "realClick",
    label: "鼠标真实单击",
  },
  {
    value: "realHover",
    label: "鼠标真实悬浮",
  },
  {
    value: "dblclick",
    label: "鼠标双击",
  },
];

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

type checkbox = { [key: string]: { value: boolean; disabled?: boolean } };
const checkboxList = reactive<checkbox>({
  "center-btn": { value: false },
  "fit-btn": { value: true },
  timetravel: { value: false },
  "download-btn": { value: false },
  "add-node-btn": { value: true },
  zoom: { value: true },
  drag: { value: true },
  edit: { value: true },
  contextmenu: { value: true },
  "sharp-corner": { value: false },
  vertical: { value: false, disabled: true },
});
const rangeList = reactive({
  branch: { value: 1, min: 1, max: 6 },
  "x-gap": { value: 50, min: 0, max: 100 },
  "y-gap": { value: 50, min: 0, max: 100 },
});

interface Data {
  uuid?: string;
  name: string;
  children?: Array<Data>;
  left?: boolean;
  collapse?: boolean;
  updated?: boolean;
  parentid?: string;
  parentname?: string;
  sort?: number;
}

const data = ref<[Data]>([
  {
    uuid: uuidv4(),
    name: productname,
    updated: true,
  },
]);

const groupSelect = ref([]);

const rushDataImmediately = (g = groupids) => {
  axios
    .post("http://172.16.7.148:9200/step/_doc/_search", {
      from: 0,
      size: 10000,
      query: {
        terms: {
          group: g,
        },
      },
    })
    .then((res) => {
      const stepTemp = {};
      res.data.hits.hits.forEach((element) => {
        let step = element._source;
        stepTemp[step.id] = {
          uuid: step.id,
          name: step.name,
          children: [],
          parentid: step.parentid ? step.parentid[0] : null,
          sort: step.sort,
        };
      });
      let root;

      Object.keys(stepTemp).forEach((key) => {
        if (stepTemp[key].parentid) {
          if (stepTemp[stepTemp[key].parentid.value]) {
            let arr = stepTemp[stepTemp[key].parentid.value].children;
            arr.push(stepTemp[key]);
            arr.sort((a, b) => a.sort - b.sort);
          }
        } else {
          root = stepTemp[key];
        }
      });
      if (root) {
        data.value = root;
        rushData(data.value);
      }
    });
};

const emit = defineEmits(["update:modelValue", "getMindMapids"]);
const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
});
watch(
  () => props.modelValue,
  (n, o) => {
    rushDataImmediately(props.modelValue);
  },
  { deep: true }
);
onMounted(() => {
  axios
    .post("http://172.16.7.148:9200/manages/_doc/_search", {
      from: 0,
      size: 10000,
      query: {
        term: {
          productid: productid,
        },
      },
    })
    .then((res) => {
      const manageTemp = {};
      res.data.hits.hits.forEach((element) => {
        let manage = element._source;
        manageTemp[manage.id] = {
          value: manage.id,
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

  rushDataImmediately();
});

const mindMapCallbacks = {
  editcallback: (d) => {},
  appendcallback: (d) => {},
  deletecallback: () => {},
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
  iframekey: any[];
  parentid: any[];
  assertion?: any[];
  datas?: Datas[];
  wait?: number;
  sort?: number;
  group?: string;
}

let rightDataClass = ref(["content1-right", "content1-data"]);
let rightAssertionClass = ref(["content1-right", "content1-assertion"]);
const dialogVisible = ref(false);
const step = ref<Step>({
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
});

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

setStepDetailsEdit((data: any, type: string, callback: VoidFunction) => {
  dialogVisible.value = true;
  axios.get("http://172.16.7.148:9200/step/_doc/" + data.uuid).then((res) => {
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
    actionChange(im.action);
  });
  mindMapCallbacks.editcallback = callback;
});

const handleCancel = () => {
  dialogVisible.value = false;
};

const getUpdated = (d = data.value[0]): Array<Object> => {
  let updateds = [];
  if (!d.parentid && d.updated) {
    updateds.push(d);
  }
  if (d.children && d.children.length) {
    d.children.forEach((item, index) => {
      if (item.updated) {
        item.parentid = d.uuid;
        item.parentname = d.name;
        item.sort = index;
        updateds.push(item);
      }
      updateds = updateds.concat(getUpdated(item));
    });
  }
  return updateds;
};

const handleConfirm = (id) => {
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  let bulk = "\n";
  if (id) {
    bulk +=
      '{ "update":  { "_index": "step", "_type": "_doc" , "_id": "' +
      step.value.id +
      '"}}\n';
    bulk +=
      '{"doc":{"id": "' +
      step.value.id +
      '","name": "' +
      step.value.name +
      '","action": "' +
      step.value.action +
      '","key": "' +
      step.value.key +
      '","iframekey": ' +
      JSON.stringify(step.value.iframekey) +
      ',"group": "' +
      step.value.group +
      '","parentid": ' +
      JSON.stringify(step.value.parentid || []) +
      ',"assertion": ' +
      JSON.stringify(step.value.assertion || []) +
      ',"datas": ' +
      JSON.stringify(step.value.datas || []) +
      ',"wait": ' +
      (step.value.wait || null) +
      ',"modificationdate": "' +
      formattedDate +
      '"}}\n';
    bulk += "\n";
  } else {
    step.value.id = uuidv4();
    bulk +=
      '{ "index":  { "_index": "step", "_type": "_doc" , "_id": "' +
      step.value.id +
      '"}}\n';
    bulk +=
      '{"id": "' +
      step.value.id +
      '","name": "' +
      step.value.name +
      '","action": "' +
      step.value.action +
      '","key": "' +
      step.value.key +
      '","iframekey": ' +
      JSON.stringify(step.value.iframekey) +
      ',"parentid": ' +
      JSON.stringify(step.value.parentid) +
      ',"assertion": ' +
      JSON.stringify(step.value.assertion) +
      ',"datas": ' +
      JSON.stringify(step.value.datas) +
      ',"product": "' +
      productid +
      '","group": "' +
      groupid +
      '","wait": ' +
      step.value.wait +
      ',"sort": ' +
      step.value.sort +
      ',"creationdate": "' +
      formattedDate +
      '","modificationdate": "' +
      formattedDate +
      '"}\n';
  }
  bulk += "\n";
  console.log(bulk);
  axios
    .post("http://172.16.7.148:9200/_bulk", bulk, {
      headers: {
        "Content-Type": "application/x-ndjson",
      },
    })
    .then((res) => {
      if (id) {
        mindMapCallbacks.editcallback({
          uuid: step.value.id,
          name: step.value.name,
        });
      } else {
        mindMapCallbacks.appendcallback({
          uuid: step.value.id,
          name: step.value.name,
        });
      }
    });
};

const saveSort = () => {
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  let bulk = "\n";
  const updateds = getUpdated();
  if (!updateds.length) return;
  updateds.forEach((d: Data) => {
    if (!d.parentid) {
      bulk +=
        '{ "index":  { "_index": "step", "_type": "_doc" , "_id": "' +
        d.uuid +
        '"}}\n';
      bulk +=
        '{"id": "' +
        d.uuid +
        '","name": "' +
        d.name +
        '","product": "' +
        productid +
        '","group": "' +
        groupid +
        '","creationdate": "' +
        formattedDate +
        '","modificationdate": "' +
        formattedDate +
        '"}\n';
    } else {
      bulk +=
        '{ "update":  { "_index": "step", "_type": "_doc" , "_id": "' +
        d.uuid +
        '"}}\n';
      bulk +=
        '{"doc":{"parentid": ' +
        JSON.stringify([{ label: d.parentname, value: d.parentid }]) +
        ',"modificationdate": "' +
        formattedDate +
        '","sort": "' +
        d.sort +
        '"}}\n';
    }
  });
  bulk += "\n";
  axios
    .post("http://172.16.7.148:9200/_bulk", bulk, {
      headers: {
        "Content-Type": "application/x-ndjson",
      },
    })
    .then((res) => {
      dialogVisible.value = false;
      ElMessage({
        message: "保存成功！",
        type: "success",
      });
    });
};

setStepDetailsAppend((data: any, type: string, callback: VoidFunction) => {
  step.value = {
    id: "",
    name: "",
    action: "",
    key: "",
    iframekey: [],
    parentid: [],
    group:groupid,
    assertion: [],
    datas: [],
    wait: null,
  };
  let parent = {};
  switch (type) {
    case "add":
      parent = {
        label: data.name,
        value: data.uuid,
      };
      break;
    case "add-sibling":
      parent = {
        label: data.parent.name,
        value: data.parent.uuid,
      };
      break;
    case "add-sibling-before":
      parent = {
        label: data.parent.name,
        value: data.parent.uuid,
      };
      break;
    case "add-parent":
      parent = {
        label: data.parent.name,
        value: data.parent.uuid,
      };
      break;
  }
  step.value.parentid.push(parent);
  const array = data.id.split("-").map((n) => ~~n);
  step.value.sort = array.pop();
  dialogVisible.value = true;
  mindMapCallbacks.appendcallback = callback;
});

setStepDetailsDelete((data: any, type: string, callback: VoidFunction) => {
  mindMapCallbacks.deletecallback = callback;
  switch (type) {
    case "delete":
      const getUuid4Delete = (d = data): Array<Object> => {
        let uuids = [];
        uuids.push(d.uuid);
        if (d.children && d.children.length) {
          d.children.forEach((item) => {
            uuids = uuids.concat(getUuid4Delete(item));
          });
        }
        return uuids;
      };

      let bulk = "\n";
      getUuid4Delete().forEach((uuid: string) => {
        bulk +=
          '{ "delete":  { "_index": "step", "_type": "_doc" , "_id": "' +
          uuid +
          '"}}\n';
      });
      bulk += "\n";
      axios
        .post("http://172.16.7.148:9200/_bulk", bulk, {
          headers: {
            "Content-Type": "application/x-ndjson",
          },
        })
        .then((res) => {
          mindMapCallbacks.deletecallback();
        });

      break;
    case "delete-one":
      axios
        .delete("http://172.16.7.148:9200/step/_doc/" + data.uuid)
        .then((res) => {
          mindMapCallbacks.deletecallback();
        });
      break;
  }
});

getStepList((steps: string[]) => {
  emit("getMindMapids",steps);
});

setMindMapSave((callback: VoidFunction) => {
  saveSort();
  callback();
  dialogVisible.value = false;
});
</script>

<style scoped>
::-webkit-scrollbar {
  width: 2px; /* 宽度为10px */
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
}

.content1-left {
  position: absolute;
  top: 0px;
  right: 65%;
  left: 0px;
  bottom: 0px;
  margin-right: 5px;
  overflow-y: scroll;
  border: 1px solid #ccc;
  padding: 10px 20px 0px 0px;
}

.content1-right {
  position: absolute;
  top: 0px;
  right: 0px;
  left: 35%;
  bottom: 0px;
  border: 1px solid #ccc;
  overflow: scroll;
  padding: 0px 5px;
}

.content1-data-for-fill {
  top: 0px;
  bottom: 40%;
  padding-top: 3px;
}

.content1-assertion-for-fill {
  margin-top: 5px;
  top: 60%;
  bottom: 0px;
}

.content1-data {
  top: 0px;
  bottom: 0;
}

.content1-assertion {
  top: 0px;
  bottom: 0px;
}

.custom-tree-node {
  width: 100%;
}
</style>