<template>
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
            value-key="value"
            size="small"
            filterable
            remote
            reserve-keyword
            placeholder="请输入关键字"
            :remote-method="remoteInputMethod"
            :loading="loading"
            :disabled="data.disabled"
            style="width: 100px"
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
            <el-option label="字符串" value="0" />
            <el-option label="数字" value="3" />
            <el-option label="日期" value="4" />
            <el-option label="对象" value="1" />
            <el-option label="数组" value="2" />
          </el-select>
          <el-input
            size="small"
            v-model="data.mock"
            style="width: 140px"
            :disabled="data.disabled"
          />
          <el-input
            size="small"
            v-model="data.fieldCname"
            style="width: 100px"
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
</template>

<script lang="ts" setup>
import axios from "axios";
import { ref, reactive, inject, onMounted, watch } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  productid:{
    type: String,
    required: true,
  }
});



const dataSource = ref([
  {
    id: uuidv4(),
    disabled: true,
    level: 0,
    fieldCode: "字段",
    fieldInputMethod: "输入方式",
    inputDataType: "1",
    mock: "Mock值",
    fieldCname: "备注",
    children: props.modelValue,
  },
]);

watch(
      () => props.modelValue,
      () => {
        dataSource.value[0].children = props.modelValue;
      },
      { deep: true }
    );



const setField0Width = (data) => {
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
          bool: {
            must: [
              {
                term: {
                  product: props.productid,
                },
              },
              {
                wildcard: {
                  name: "*" + query + "*",
                },
              },
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

const append = (node: Node, data) => {
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
    const children = node.parent.data.children || node.parent.data;
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
  emit("update:modelValue", props.modelValue);
};

const remove = (node: Node, data) => {
  const parent = node.parent;
  const children = parent.data.children || parent.data;
  const index = children.findIndex((d) => d.id === data.id);
  children.splice(index, 1);
  emit("update:modelValue", props.modelValue);
};
</script>