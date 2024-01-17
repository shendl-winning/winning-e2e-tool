<template>
  <div class="leftContent">
    <el-input
      v-model="filterText"
      class="w-50 m-2"
      placeholder="Filter keyword"
      :prefix-icon="Search"
    />
    <el-tree
      ref="treeRef"
      :props="props"
      :load="loadManages"
      lazy
      node-key="id"
      highlight-current
      draggable
      :allow-drop="allowDrop"
      :allow-drag="allowDrag"
      @node-drop="handleDrop"
      :expand-on-click-node="false"
      :filter-node-method="filterNode"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <span>
            <span v-if="data.type == 5"
              ><el-checkbox
                v-model="data.checked"
                @click="checkboxClick(data)"
              />
              &nbsp;</span
            >
            <spn @click="handleNodeClick(data.type, data.id, data.name)">
              {{ node.label }}
            </spn>
          </span>

          <span>
            <span style="float: left">
              <a @click="refresh(node, data)">
                <el-icon><Refresh /></el-icon>
              </a>
            </span>
            <el-popover
              v-model="useTestcaseAppend.visible"
              placement="bottom"
              :width="180"
              trigger="click"
              transition="el-zoom-in-top"
              hide-after="0"
            >
              <template #reference>
                <span style="margin-left: 4px">
                  <a>
                    <el-icon><MoreFilled /></el-icon>
                  </a>
                </span>
              </template>
              <el-menu>
                <el-menu-item index="1" v-if="data.type != 1">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>复制</span>
                </el-menu-item>

                <el-menu-item index="2">
                  <el-icon><EditPen /></el-icon>
                  <span>重命名</span>
                </el-menu-item>

                <el-menu-item
                  index="2"
                  v-if="data.type == 3"
                  @click="useTestcaseAppend.executeTest(data, node)"
                >
                  <el-icon><VideoPlay /></el-icon>
                  <span>执行测试</span>
                </el-menu-item>

                <el-divider></el-divider>

                <el-menu-item index="6" v-if="data.type != 5">
                  <el-icon><FolderAdd /></el-icon>
                  <span v-if="data.type == 1">添加新产品</span>
                  <span v-if="data.type == 2">添加新套件</span>
                  <span v-if="data.type == 3">添加新分类</span>
                  <span v-if="data.type == 4">添加新分类</span>
                </el-menu-item>

                <el-menu-item
                  index="7"
                  @click="remove(node, data)"
                  v-if="data.type != 1"
                >
                  <el-icon><Delete /></el-icon>
                  <span>删除</span>
                </el-menu-item>
              </el-menu>
            </el-popover>
            <el-tooltip
              content="点击新增测试用例"
              placement="top"
              effect="light"
            >
              <span>
                <a
                  @click="useTestcaseAppend.openAppendDialog(data, node)"
                  v-if="[3, 4].includes(data.type)"
                >
                  <el-icon><Plus /></el-icon>
                </a>
              </span>
            </el-tooltip>
          </span>
        </span>
      </template>
    </el-tree>

    <el-dialog
      v-model="useTestcaseAppend.dialogFormVisible"
      title="新增测试用例"
      width="30%"
      @opened="useTestcaseAppend.onOpend()"
    >
      <el-form :model="form">
        <el-form-item label="测试用例名称：" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" ref="inputRef" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="useTestcaseAppend.dialogFormVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="useTestcaseAppend.append()">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
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
import { ElLoading } from "element-plus";
import { ref, reactive, onMounted, watch } from "vue";
import type Node from "element-plus/es/components/tree/src/model/node";
import type { DragEvents } from "element-plus/es/components/tree/src/model/useDragNode";
import type {
  FakeNode,
  AllowDropType,
  NodeDropType,
} from "element-plus/es/components/tree/src/model/tree.type";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";

const emit = defineEmits(["rightComponentHandle"]);
const handleNodeClick = (type, id, name) => {
  emit("rightComponentHandle", type, id, name);
};

const filterText = ref("");
const treeRef = ref();

watch(filterText, (val) => {
  console.log(val);
  treeRef.value!.filter(val);
});
const filterNode = (value: string, data: Tree) => {
  if (!value) return true;
  return data.name.includes(value);
};

interface TestRecord {
  id: string;
  name: string;
  testsuite?: string;
  testcase: string[];
  tests: string;
  passes: string;
  pending: string;
  failures: string;
  duration: string;
  passPercent: string;
  report: string;
  record: string;
  executetime: string;
  executestat: string;
  creationdate: string;
}

interface Tree {
  id: string;
  name: string;
  type: number;
  leaf: boolean;
  parentid: string;
  sort: number;
  checked: boolean;
}

const props = {
  label: "name",
  children: "zones",
  isLeaf: "leaf",
};

let id = 1000;

const remove = (node: Node, data: Tree) => {
  axios
    .delete("http://172.16.7.148:9200/manages/_doc/" + data.id)
    .then((res) => {
      treeRef.value.remove(node);
    });
};

const refresh = (node: Node, data: Tree) => {
  node.loaded = false;
  node.expand();
};

const loadManages = (node: Node, resolve: (data: Tree[]) => void) => {
  let querystring = "";
  if (node.level > 0) {
    console.log(node.data.id);
    querystring = node.data.id;
  }
  axios
    .post("http://172.16.7.148:9200/manages/_doc/_search", {
      from: 0,
      size: 1000,
      query: {
        term: {
          parentid: "" + querystring,
        },
      },
      sort: {
        sort: {
          order: "asc",
        },
      },
    })
    .then((res) => {
      const data: Tree[] = [];
      res.data.hits.hits.forEach((element) => {
        let managenode = element._source;
        data.push({
          id: managenode.id,
          name: managenode.name,
          type: managenode.type,
          leaf: managenode.leaf,
          parentid: managenode.parentid,
          sort: managenode.sort,
          checked: managenode.checked,
        });
      });
      return resolve(data);
    });
};

const allowDrop = (draggingNode: Node, dropNode: Node, type: AllowDropType) => {
  return (
    [4, 5].includes(dropNode.data.type) &&
    ((type == "inner" && dropNode.loaded) || type != "inner")
  );
};
const allowDrag = (draggingNode: Node) => {
  return [4, 5].includes(draggingNode.data.type);
};

const handleDrop = (
  draggingNode: Node,
  dropNode: Node,
  dropType: NodeDropType,
  ev: DragEvents
) => {
  let data = "\n";
  dropNode.parent.childNodes.forEach((node, index) => {
    data +=
      '{ "index":  { "_index": "manages", "_type": "_doc" , "_id": "' +
      node.data.id +
      '"}}\n';
    data +=
      '{"id": "' +
      node.data.id +
      '","name": "' +
      node.data.name +
      '","type": ' +
      node.data.type +
      ',"leaf": ' +
      node.data.leaf +
      ',"parentid": "' +
      dropNode.parent.data.id +
      '","sort": ' +
      index +
      ',"checked": ' +
      node.data.checked +
      "}\n";
  });
  data += "\n";
  axios
    .post("http://172.16.7.148:9200/_bulk", data, {
      headers: {
        "Content-Type": "application/x-ndjson",
      },
    })
    .then((res) => {
      console.log(res);
    });
};

const checkboxClick = (data: Tree) => {
  console.log(data.checked);
  axios
    .post("http://172.16.7.148:9200/manages/_doc/" + data.id + "/_update", {
      doc: {
        checked: !data.checked,
      },
    })
    .then((res) => {
      console.log(res);
    });
};

/*
 * 场景：新增测试用例
 *
 */
const form = reactive({
  name: "",
});
const inputRef = ref();
const formLabelWidth = "140px";
const useTestcaseAppend = reactive({
  dialogFormVisible: false,
  data: null,
  node: null,
  visible: false,
  onOpend: () => {
    inputRef.value && inputRef.value.focus();
  },
  openAppendDialog: (data: Tree, node: Node) => {
    form.name = "";
    useTestcaseAppend.dialogFormVisible = true;
    useTestcaseAppend.data = data;
    useTestcaseAppend.node = node;
  },
  append: () => {
    const newChild = {
      id: uuidv4(),
      name: form.name,
      type: 5,
      leaf: true,
      parentid: useTestcaseAppend.data.id,
      sort: useTestcaseAppend.node.childNodes.length + 1,
      checked: true,
    };
    axios
      .post(
        "http://172.16.7.148:9200/manages/_doc/" + newChild.id + "/_create",
        newChild
      )
      .then((res) => {
        console.log(newChild);
        useTestcaseAppend.dialogFormVisible = false;
        const testcase: FakeNode = {
          data: newChild,
        };
        useTestcaseAppend.node.insertChild(testcase);
        treeRef.value.setCurrentKey(newChild.id);
        handleNodeClick(newChild.type, newChild.id, newChild.name);
      });
  },
  executeTest: (data: Tree, node: Node) => {
    const loading = ElLoading.service({
      lock: true,
      text: data.name + " Running",
      background: "rgba(0, 0, 0, 0.4)",
    });
    let testcase: string[] = [];
    async function getTestCase(parentid: string) {
      return new Promise(async (resolve, reject) => {
        // const compressPromises = []; // 存储promise执行队列
        const res = await axios.post(
          "http://172.16.7.148:9200/manages/_doc/_search",
          {
            query: {
              bool: {
                must: [
                  {
                    term: {
                      parentid: parentid,
                    },
                  },
                  {
                    term: {
                      checked: true,
                    },
                  },
                ],
              },
            },
            sort: {
              sort: {
                order: "asc",
              },
            },
          }
        );
        await Promise.all(
          res.data.hits.hits.map(async (element) => {
            let node = element._source;
            if (node.type == 5) {
              testcase.push(node.id);
            } else if (node.type == 4) {
              await getTestCase(node.id);
            }
          })
        );

        resolve(true);
      });
    }
    getTestCase(data.id).then((res) => {
      useTestcaseAppend.visible = false;
      const currentDate = new Date();
      // 使用moment.js格式化日期
      const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
      let uuid = uuidv4();
      console.log(testcase.length);
      let record = {
        id: uuid,
        name: data.name,
        testsuite: data.id,
        testcase: testcase,
        report: "/src/assets/cypress/results/" + uuid.id,
        record: "/src/assets/cypress/videos/" + uuid.id,
        executetime: formattedDate,
        executestat: "1",
        creationdate: formattedDate,
      };
      axios
        .post(
          "http://172.16.7.148:9200/testrecord/_doc/" + uuid + "/_create",
          record
        )
        .then((res) => {
          console.log(res);
          //Kelp.execute("yarn run cypress open --env id=" + uuid
          Kelp.execute(
            "yarn cypress run -s 'cypress/e2e/testsuite.cy.js' --config screenshotsFolder=src/assets/cypress/screenshots/" +
              uuid +
              ",videosFolder=src/assets/cypress/videos/" +
              uuid +
              " --reporter-options reportDir=src/assets/cypress/results/" +
              uuid +
              ",overwrite=true,html=true,json=true --env id=" +
              uuid
          ).then(
            (succ) => {
              useTestcaseAppend.updateTestrecord(uuid, data, loading, 2);
            },
            (fail) => {
              //如果 promise 的状态为 rejected，则执行这里的代码
              useTestcaseAppend.updateTestrecord(uuid, data, loading, 3);
              console.error(fail);
            }
          );

          setTimeout(function () {
            handleNodeClick(data.type, data.id, data.name);
          }, 1500); // 定时

        });
    });
  },
  updateTestrecord: (uuid, data, loading, executestat) => {
    axios
      .get("/src/assets/cypress/results/" + uuid + "/mochawesome.json")
      .then((res) => {
        const mochawesome = res.data;
        const currentDate = new Date();
        // 使用moment.js格式化日期
        const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
        const update = {
          doc: {
            tests: mochawesome.stats.tests,
            passes: mochawesome.stats.passes,
            pending: mochawesome.stats.pending,
            failures: mochawesome.stats.failures,
            duration: mochawesome.stats.duration,
            passPercent: mochawesome.stats.passPercent,
            executetime: formattedDate,
            executestat: executestat,
          },
        };
        axios
          .post(
            "http://172.16.7.148:9200/testrecord/_doc/" + uuid + "/_update",
            update
          )
          .then(() => {
            setTimeout(function () {
              handleNodeClick(data.type, data.id, data.name);
              loading.close();
            }, 1500); // 定时
          });
      });
  },
});
</script>

<style scoped>
.leftContent {
  padding: 3px;
}
.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}

.custom-tree-node a {
  display: none;
}

.custom-tree-node:hover a {
  display: block;
}

:global(.el-popover.el-popper) {
  padding: 0px;
}

:global(.el-menu-item) {
  height: 40px;
}

:global(.el-divider) {
  margin: 0px;
}

:global(.el-menu) {
  border: solid 0px;
}

:global(.el-tooltip__trigger) {
  float: right;
}

:global(.el-icon) {
  padding: 3px;
}

:global(.el-icon:hover) {
  background-color: #ccc;
}

:global(.el-loading-parent--relative) {
  position: static !important;
}
</style>