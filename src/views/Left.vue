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
            <spn @click="handleNodeClick(data, node)">
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
                <el-menu-item index="1" v-if="[3, 4, 5].includes(data.type)">
                  <el-icon><DocumentCopy /></el-icon>
                  <span>复制</span>
                </el-menu-item>

                <el-menu-item
                  index="2"
                  @click="useRenameAppend.rename(data, node)"
                >
                  <el-icon><EditPen /></el-icon>
                  <span>重命名</span>
                </el-menu-item>

                <el-menu-item
                  index="2"
                  v-if="data.type == 3"
                  @click="useTestcaseAppend.testRecord(data, node)"
                >
                  <el-icon><Files /></el-icon>
                  <span>测试记录</span>
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
                  <span
                    v-if="data.type == 1"
                    @click="useAddAppend.add(data, node, 2)"
                    >添加新产品</span
                  >
                  <span
                    v-if="data.type == 2"
                    @click="useAddAppend.add(data, node, 3)"
                    >添加新套件</span
                  >
                  <span
                    v-if="data.type == 3"
                    @click="useAddAppend.add(data, node, 4)"
                    >添加新分类</span
                  >
                  <span
                    v-if="data.type == 4"
                    @click="useAddAppend.add(data, node, 4)"
                    >添加新分类</span
                  >
                </el-menu-item>

                <el-menu-item
                  index="7"
                  @click="removeConfirm(node, data)"
                  v-if="data.type != 1 && data.leaf == true"
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

    <el-dialog
      v-model="useRenameAppend.dialogRenameVisible"
      title="重命名"
      width="30%"
      @opened="useRenameAppend.onOpend()"
    >
      <el-form :model="form">
        <el-form-item label="名称：" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" ref="inputRef" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="useRenameAppend.dialogRenameVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="useRenameAppend.append()">
            确认
          </el-button>
        </span>
      </template>
    </el-dialog>

    <el-dialog
      v-model="useAddAppend.dialogAddVisible"
      title="重命名"
      width="30%"
      @opened="useAddAppend.onOpend()"
    >
      <el-form :model="form">
        <el-form-item label="名称：" :label-width="formLabelWidth">
          <el-input v-model="form.name" autocomplete="off" ref="inputRef" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="useAddAppend.dialogAddVisible = false"
            >取消</el-button
          >
          <el-button type="primary" @click="useAddAppend.append()">
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
import { ElLoading ,ElMessage, ElMessageBox} from "element-plus";
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
let groupids;
let productid;
const handleNodeClick = (data, node) => {
  groupids = [];
  productid = "";
  getNodeProductid(node);
  if (data.type >= 3) {
    getNodeGroupids(node);
  }
  emit(
    "rightComponentHandle",
    data.type,
    data.id,
    data.name,
    groupids,
    productid
  );
};

const getNodeGroupids = (node: Node) => {
  if (node.data.type != 5) {
    groupids.push(node.data.id);
  }
  if (node.data.type != 3) {
    getNodeGroupids(node.parent);
  }
};

const getNodeProductid = (node: Node) => {
  if (node.data.type == 2) {
    productid = node.data.id;
  } else {
    getNodeProductid(node.parent);
  }
};

const filterText = ref("");
const treeRef = ref();

watch(filterText, (val) => {
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

const removeConfirm = (node: Node, data: Tree) => {
  ElMessageBox.confirm(
    '确定要删除吗？',
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      remove(node, data);
      ElMessage({
        type: 'success',
        message: '删除成功！',
      })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '删除取消了！',
      })
    })
}

const remove = (node: Node, data: Tree) => {
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");

    let bulk = "\n";
    bulk +=
      '{ "delete":  { "_index": "manages", "_type": "_doc" , "_id": "' +
      data.id +
      '"}}\n';
    if(node.parent.childNodes.length == 1){
      bulk +=
        '{ "update":  { "_index": "manages", "_type": "_doc" , "_id": "' +
        data.parentid +
        '"}}\n';
      bulk +=
        '{"doc":{"leaf": true' +
        ',"modificationdate": "' +
        formattedDate +
        '"}}\n';
    }
    bulk += "\n";
    axios
      .post("http://172.16.7.148:9200/_bulk", bulk, {
        headers: {
          "Content-Type": "application/x-ndjson",
        },
      })
      .then((res) => {
        if(node.parent.childNodes.length == 1){
          node.parent.data.leaf = true;
        }
        treeRef.value.remove(node);
        treeRef.value.setCurrentKey(data.parentid);
        //handleNodeClick(node.parent.data, node.parent);
      });

};

const refresh = (node: Node, data: Tree) => {
  node.loaded = false;
  node.expand();
};

const loadManages = (node: Node, resolve: (data: Tree[]) => void) => {
  let querystring = "";
  if (node.level > 0) {
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
  const currentDate = new Date();
  // 使用moment.js格式化日期
  const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
  let data = "\n";
  dropNode.parent.childNodes.forEach((node, index) => {
    data +=
      '{ "update":  { "_index": "manages", "_type": "_doc" , "_id": "' +
      node.data.id +
      '"}}\n';
    data +=
      '{"doc":{"sort": ' +
      (index+1) +
      "" +
      ',"modificationdate": "' +
      formattedDate +
      '"}}\n';
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
    node.loaded = false;
    node.expand();
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
        useTestcaseAppend.dialogFormVisible = false;
        const testcase: FakeNode = {
          data: newChild,
        };
        useTestcaseAppend.node.insertChild(testcase, newChild.sort, true);
        treeRef.value.setCurrentKey(newChild.id);
        handleNodeClick(newChild, testcase);
      });
  },
  testRecord: (data: Tree, node: Node) => {
    const newData = Object.assign({}, data);
    newData.type = 31;
    handleNodeClick(newData, node);
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
      let record = {
        id: uuid,
        name: data.name,
        testsuite: data.id,
        testcase: testcase,
        report: "cypress/results/" + uuid,
        record: "cypress/videos/" + uuid,
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
          //Kelp.execute("yarn run cypress open --env id=" + uuid
          Kelp.execute(
            "yarn cypress run -s 'cypress/e2e/testsuite.cy.js' --config screenshotsFolder=cypress/screenshots/" +
              uuid +
              ",videosFolder=cypress/videos/" +
              uuid +
              " --reporter-options reportDir=cypress/results/" +
              uuid +
              ",overwrite=true,html=true,json=true --env id=" +
              uuid
          ).then(
            (succ) => {
              useTestcaseAppend.updateTestrecord(uuid, data, node, loading, 2);
            },
            (fail) => {
              //如果 promise 的状态为 rejected，则执行这里的代码
              useTestcaseAppend.updateTestrecord(uuid, data, node, loading, 3);
              console.error(fail);
            }
          );

          setTimeout(function () {
            useTestcaseAppend.testRecord(data, node);
          }, 1500); // 定时
        });
    });
  },
  updateTestrecord: (uuid, data, node, loading, executestat) => {
    axios
      .get(Kelp.path("../../../../../cypress/results/" + uuid + "/mochawesome.json"))
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
              useTestcaseAppend.testRecord(data, node);
              loading.close();
            }, 1500); // 定时
          });
      });
  },
});
const useRenameAppend = reactive({
  dialogRenameVisible: false,
  data: null,
  node: null,
  visible: false,
  onOpend: () => {
    inputRef.value && inputRef.value.focus();
  },
  rename: (data: Tree, node: Node) => {
    form.name = data.name;
    useRenameAppend.dialogRenameVisible = true;
    useRenameAppend.data = data;
    useRenameAppend.node = node;
  },
  append: () => {
    const currentDate = new Date();
    // 使用moment.js格式化日期
    const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
    let param = {};
    let p = {
      name: form.name,
      modificationdate: formattedDate,
    };
    param["doc"] = p;
    axios
      .post(
        "http://172.16.7.148:9200/manages/_doc/" +
          useRenameAppend.data.id +
          "/_update",
        param
      )
      .then((res) => {
        useRenameAppend.data.name = form.name;
        useRenameAppend.dialogRenameVisible = false;
      });
  },
});

const useAddAppend = reactive({
  dialogAddVisible: false,
  data: null,
  node: null,
  type: null,
  visible: false,
  onOpend: () => {
    inputRef.value && inputRef.value.focus();
  },
  add: (data: Tree, node: Node, type) => {
    form.name = "";
    node.loaded = false;
    node.expand();
    useAddAppend.dialogAddVisible = true;
    useAddAppend.data = data;
    useAddAppend.node = node;
    useAddAppend.type = type;
  },
  append: () => {
    const currentDate = new Date();
    // 使用moment.js格式化日期
    const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
    let newChild = {
      id: uuidv4(),
      name: form.name,
      type: useAddAppend.type,
      leaf: true,
      parentid: useAddAppend.data.id,
      sort: useAddAppend.node.childNodes.length + 1,
      checked: true,
      creationdate: formattedDate,
      modificationdate: formattedDate,
    };
    let data = "\n";
    data +=
      '{ "index":  { "_index": "manages", "_type": "_doc" , "_id": "' +
      newChild.id +
      '"}}\n';
    data +=
      '{"id": "' +
      newChild.id +
      '","name": "' +
      newChild.name +
      '","type": ' +
      newChild.type +
      ',"leaf": ' +
      newChild.leaf +
      ',"parentid": "' +
      newChild.parentid +
      '","sort": ' +
      newChild.sort +
      ',"checked": ' +
      newChild.checked +
      ',"creationdate": "' +
      newChild.creationdate +
      '","modificationdate": "' +
      newChild.modificationdate +
      '"}\n';
    data +=
      '{ "update":  { "_index": "manages", "_type": "_doc" , "_id": "' +
      newChild.parentid +
      '"}}\n';
    data +=
      '{"doc":{"leaf": false' +
      ',"modificationdate": "' +
      newChild.modificationdate +
      '"}}\n';
    data += "\n";
    axios
      .post("http://172.16.7.148:9200/_bulk", data, {
        headers: {
          "Content-Type": "application/x-ndjson",
        },
      })
      .then((res) => {
        //console.log(res);
        useAddAppend.data.leaf = false;
        const child: FakeNode = {
          data: newChild,
        };
        useAddAppend.node.insertChild(child, newChild.sort, true);
        treeRef.value.setCurrentKey(newChild.id);
        handleNodeClick(newChild, child);
        useAddAppend.dialogAddVisible = false;
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