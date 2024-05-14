<template>
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
</template>
<script lang="ts" setup>
import axios from "axios";
import { ref, reactive, inject, onMounted, defineComponent, watch } from "vue";
import "@/components/mindMap/style.css";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import stepData from "@/components/stepData/stepData.vue";
import stepAssertion from "@/components/stepAssertion/stepAssertion.vue";
import { ElMessage } from "element-plus";

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

const step = ref<Step>({
  id: "",
  name: "",
  action: "",
  key: "",
  iframekey: [],
  parentid: [],
  assertion: [],
  datas: [],
  sort:0,
  wait: null,
  group: "",
});

const emit = defineEmits(["editcallback", "appendcallback", "update:dialogVisible", "update:stepsItem"]);
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  productid: String,
  groupid:String
});
watch(
  () => props.modelValue,
  (n, o) => {
    step.value = props.modelValue as Step;
    actionChange(step.value.action);
  },
  { deep: true }
);

const groupSelect = ref([]);
onMounted(() => {
    axios
    .post("http://172.16.7.148:9200/manages/_doc/_search", {
      from: 0,
      size: 10000,
      query: {
        term: {
          productid: props.productid,
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
})

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

let rightDataClass = ref(["content1-right", "content1-data"]);
let rightAssertionClass = ref(["content1-right", "content1-assertion"]);

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

const handleCancel = () => {
  emit("update:dialogVisible",false);
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
      props.productid +
      '","group": "' +
      props.groupid +
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
        emit("update:stepsItem", step);
        emit("editcallback",{
          uuid: step.value.id,
          name: step.value.name,
        });
      } else {
        emit("appendcallback",{
          uuid: step.value.id,
          name: step.value.name,
        });
      }
    });
};

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