<template>
  <el-table :data="Assertions">
    <el-table-column label="标题">
      <template #default="scope">
        {{ scope.row.title }}{{ scope.row.asser.label }}
        {{ scope.row.content ? '"' + scope.row.content + '"' : "" }}
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
  <el-button
    size="small"
    style="position: absolute; right: 10px; top: 6px; z-index: 2"
    @click="assertionHandleAdd"
    >+断言</el-button
  >

  <el-dialog v-model="dialogAssertionVisible" title="断言" width="30%">
    <el-form>
      <el-form-item label="名称：" label-width="100px">
        <el-input v-model="Assertion.title" type="text" size="small" />
      </el-form-item>
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
      <el-form-item
        label="内容："
        label-width="100px"
        v-if="
          Assertion.asser &&
          (Assertion.asser.value.indexOf('contain') != -1 ||
            Assertion.asser.value.indexOf('value') != -1)
        "
      >
        <el-input v-model="Assertion.content" type="text" size="small" />
      </el-form-item>
      <el-form-item label="Iframe标识:">
        <el-cascader
          v-model="Assertion.iframekey"
          :options="iframekeyOptions"
          :props="props1"
          clearable
          :show-all-levels="false"
          size="small"
        />
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

<script lang="ts" setup>
import axios from "axios";
import { ref, reactive, inject, onMounted, watch } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const emit = defineEmits(["update:modelValue"]);

const props = defineProps({
  modelValue: Array,
  iframekey: String,
  iframekeyOptions: Array,
});

const Assertions = ref([]);
watch(
  () => props.modelValue,
  () => {
    Assertions.value = props.modelValue;
  },
  { deep: true }
);

const props1 = {
  checkStrictly: true,
};

const Assertion = ref({
  id: "",
  selector: "",
  options: [
    {
      value: "be.visible",
      label: "元素可见",
    },
    {
      value: "be.hidden",
      label: "元素不可见",
    },
    {
      value: "be.exist",
      label: "元素存在",
    },
    {
      value: "not.be.exist",
      label: "元素不存在",
    },
    {
      value: "be.checked",
      label: "元素选中",
    },
    {
      value: "not.be.checked",
      label: "元素未选中",
    },
    {
      value: "be.selected",
      label: "元素已选择",
    },
    {
      value: "not.be.selected",
      label: "元素未选择",
    },
    {
      value: "be.empty",
      label: "元素为空",
    },
    {
      value: "not.be.empty",
      label: "元素不为空",
    },
    {
      value: "be.enabled",
      label: "元素可用",
    },
    {
      value: "be.disabled",
      label: "元素不可用",
    },
    {
      value: "contain",
      label: "元素包含文本",
    },
    {
      value: "not.contain",
      label: "元素不包含文本",
    },
    {
      value: "have.value",
      label: "元素值等于",
    },
    {
      value: "have.length",
      label: "元素数量等于",
    },
  ],
  asser: null,
  content: "",
  enable: true,
  title: "",
  iframekey: props.iframekey,
  index: 0,
});

const dialogAssertionVisible = ref(false);
const assertionHandleAdd = () => {
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
    title: Assertion.value.title,
    iframekey: Assertion.value.iframekey,
  };
  if (asser.id) {
    Assertions.value[Assertion.value.index] = asser;
  } else {
    asser.id = uuidv4();
    Assertions.value.push(asser);
  }
  emit("update:modelValue", Assertions);
};

const assertionHandleEdit = (index, asser) => {
  Assertion.value.index = index;
  Assertion.value.id = asser.id;
  Assertion.value.selector = asser.selector;
  Assertion.value.asser = asser.asser;
  Assertion.value.content = asser.content;
  Assertion.value.enable = asser.enable;
  Assertion.value.title = asser.title;
  Assertion.value.iframekey = asser.iframekey;
  dialogAssertionVisible.value = true;
};

const assertionHandleDelete = (index, asser) => {
  Assertions.value.splice(index, 1);
  emit("update:modelValue", Assertions);
};
</script>

