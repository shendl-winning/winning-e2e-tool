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
    <stepView
      v-model="step"
      :productid="productid"
      :groupid="groupid"
      @editcallback="
        (j) => {
          mindMapCallbacks.editcallback(j);
        }
      "
      @appendcallback="
        (j) => {
          mindMapCallbacks.appendcallback(j);
        }
      "
      @update:dialogVisible="
        (b) => {
          dialogVisible = b;
        }
      "
    ></stepView>
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
import stepView from "@/components/step/stepView.vue";
import { ElMessage } from "element-plus";

let proid = inject("proid").value;
let groupid = proid.id;
let groupids = proid.groupids;
let productid = proid.productid;
let productname = proid.productname;

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
  rushDataImmediately();
});

const mindMapCallbacks = {
  editcallback: (d) => {},
  appendcallback: (d) => {},
  deletecallback: () => {},
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

const dialogVisible = ref(false);
setStepDetailsEdit((data: any, type: string, callback: VoidFunction) => {
  if(getUpdated().length > 0){
    ElMessage.error('您的交互流程图还未保存！')
    return
  }
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
  });
  mindMapCallbacks.editcallback = callback;
});

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
  //console.log(bulk)
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
  if(getUpdated().length > 0){
    ElMessage.error('您的交互流程图还未保存！')
    return
  }
  dialogVisible.value = true;
  setTimeout(() => {
    step.value = {
      id: "",
      name: "",
      action: "",
      key: "",
      iframekey: [],
      parentid: [],
      group: groupid,
      assertion: [],
      datas: [],
      wait: null,
      sort: 0,
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
  }, 100);
  mindMapCallbacks.appendcallback = callback;
});

setStepDetailsDelete((data: any, type: string, callback: VoidFunction) => {
  if(getUpdated().length > 0){
    ElMessage.error('您的交互流程图还未保存！')
    return
  }
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
  emit("getMindMapids", steps);
});

setMindMapSave((callback: VoidFunction) => {
  saveSort();
  callback();
  dialogVisible.value = false;
});
</script>
