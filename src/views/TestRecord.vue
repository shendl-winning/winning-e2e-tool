<template>
  <div class="content">
    <el-tabs v-model="activeName" class="tabs" @tab-remove="removeTab">
      <el-tab-pane label="测试记录" name="first">
        <el-table :data="records">
          <el-table-column label="执行时长" width="150">
            <template #default="scope">
              {{ scope.row.duration }}
            </template>
          </el-table-column>
          <el-table-column label="执行情况" width="200">
            <template #default="scope">
              <div>用例数： {{ scope.row.testcase.length }} 例</div>
              <div>总测试步骤：{{ scope.row.tests }} 步</div>
              <div>成功数：{{ scope.row.passes }} 步</div>
              <!-- <div>等待数：{{ scope.row.pending }} 步</div> -->
              <div>失败数：{{ scope.row.failures }} 步</div>
              <div>通过百分比：{{ parseFloat(scope.row.passPercent.toFixed(2)) }}%</div>
            </template>
          </el-table-column>
          <el-table-column label="执行状态" width="100">
            <template #default="scope">
              <div v-if="scope.row.executestat == 1" style="color: yellow">
                执行中
              </div>
              <div v-if="scope.row.executestat == 2" style="color: green">
                执行完成
              </div>
              <div v-if="scope.row.executestat == 3" style="color: red">
                执行失败
              </div>
            </template>
          </el-table-column>
          <el-table-column label="执行日期">
            <template #default="scope">
              <div>{{ scope.row.executetime }}</div>
              <div style="font-size: 12px; color: #ccc">
                创建日期： {{ scope.row.creationdate }}
              </div>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button
                size="small"
                type="success"
                @click="openMochawesome(scope.row)"
                >测试报告</el-button
              >
              <el-button
                size="small"
                type="primary"
                @click="openVideo(scope.row)"
                >测试视频</el-button
              >

              <el-button
                v-loading.fullscreen.lock="fullscreenLoading"
                size="small"
                type="warning"
                @click="handleExecute(scope.row)"
                >执行</el-button
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
    </el-tabs>
    <div class="opbuttons">
      <el-button type="success" size="small" @click="handleLoad"
        >刷 新</el-button
      >
    </div>
  </div>
  <el-dialog v-model="dialogMochawesome.visible" title="测试报告" width="60%">
    <iframe
      :src="dialogMochawesome.src"
      width="100%"
      height="500"
      style="border: 0px solid #000"
    >
    </iframe>
  </el-dialog>

  <el-dialog v-model="dialogVideo.visible" title="测试视频" width="60%">
    <videoPlay v-bind="options" />
  </el-dialog>
</template>
<script setup lang="ts">
import axios from "axios";
import { ref, reactive, inject } from "vue";
import type { TabsPaneContext } from "element-plus";
import type Node from "element-plus/es/components/tree/src/model/node";
import { v4 as uuidv4 } from "uuid";
import "vue3-video-play/dist/style.css";
import { videoPlay } from "vue3-video-play";
import { ElLoading } from "element-plus";
import moment from "moment";

let proid = inject("proid").value;
let testsuiteid = proid.id;
let testsuitename = proid.name;
const activeName = ref("first");
const fullscreenLoading = ref(false);

const dialogMochawesome = reactive({
  visible: false,
  src: "",
  id: "",
});
const dialogVideo = reactive({
  visible: false,
  src: "",
  id: "",
});

const options = reactive({
  width: "100%", //播放器高度
  height: "100%", //播放器高度
  color: "#409eff", //主题色
  title: "", //视频名称
  webFullScreen: false, //网页全屏
  speed: true, //是否支持快进快退
  currentTime: 0, //跳转到固定播放时间(s)
  muted: false, //静音
  autoPlay: true, //自动播放
  loop: false, //循环播放
  mirror: false, //镜像画面
  control: true, //是否显示控制器
  ligthOff: false, //关灯模式
  volume: 0.3, //默认音量0-1
  src: "", //视频源
  speedRate: [1.0, 1.25, 1.5, 2.0], // 可选的播放速度
  controlBtns: [
    "quality", //视频质量切换按钮
    "speedRate", //速率切换按钮
    "volume", //音量
    "fullScreen", //全屏按钮
  ], //显示所有按钮,
});

const openMochawesome = (row) => {
  dialogMochawesome.id = row.id;
  dialogMochawesome.src =
    "/src/assets/cypress/results/" + row.id + "/mochawesome.html";
  dialogMochawesome.visible = true;
};
const openVideo = (row) => {
  dialogVideo.id = row.id;
  options.title = row.name;
  options.src = "/src/assets/cypress/videos/" + row.id + "/testsuite.cy.js.mp4";
  dialogVideo.visible = true;
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
let records = ref<TestRecord[]>([]);

const handleLoad = () => {
  records.value = [];
  axios
    .post("http://172.16.7.148:9200/testrecord/_doc/_search", {
      from: 0,
      size: 10,
      query: {
        term: {
          testsuite: testsuiteid,
        },
      },
      sort: {
        creationdate: {
          order: "desc",
        },
      },
    })
    .then((res) => {
      res.data.hits.hits.forEach((element) => {
        let step = element._source;
        records.value.push({
          id: step.id,
          name: step.name,
          testcase: step.testcase,
          tests: step.tests,
          passes: step.passes,
          pending: step.pending,
          failures: step.failures,
          duration: moment()
            .startOf("day")
            .add(step.duration, "ms")
            .format("HH:mm:ss"),
          passPercent: step.passPercent,
          report: step.report,
          record: step.record,
          executetime: step.executetime,
          executestat: step.executestat,
          creationdate: step.creationdate,
        });
      });
    });
};

const handleDelete = (row) => {
  axios
    .delete("http://172.16.7.148:9200/testrecord/_doc/" + row.id)
    .then((res) => {
      handleLoad();
    });
};

const handleExecute = (row) => {
  //fullscreenLoading.value = true;
  row.executestat = 1;
  const loading = ElLoading.service({
    lock: true,
    text: row.name + " Running",
    background: "rgba(0, 0, 0, 0.4)",
  });
  Kelp.execute(
    "yarn cypress run -s 'cypress/e2e/testsuite.cy.js' --config screenshotsFolder=src/assets/cypress/screenshots/" +
      row.id +
      ",videosFolder=src/assets/cypress/videos/" +
      row.id +
      " --reporter-options reportDir=src/assets/cypress/results/" +
      row.id +
      ",overwrite=true,html=true,json=true --env id=" +
      row.id
  ).then(
    (succ) => {
      updateTestrecord(row, loading, 2);
    },
    (fail) => {
      //如果 promise 的状态为 rejected，则执行这里的代码
      updateTestrecord(row, loading, 3);
      console.error(fail);
    }
  );
};

const updateTestrecord = (row, loading, executestat) => {
  axios
    .get("/src/assets/cypress/results/" + row.id + "/mochawesome.json")
    .then((res) => {
      const mochawesome = res.data;
      const currentDate = new Date();
      // 使用moment.js格式化日期
      const formattedDate = moment(currentDate).format("YYYY-MM-DD HH:mm:ss");
      console.log(mochawesome.stats.tests);
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
          "http://172.16.7.148:9200/testrecord/_doc/" + row.id + "/_update",
          update
        )
        .then(() => {
          setTimeout(function () {
            handleLoad();
            loading.close();
          }, 1500); // 定时
        });
    });
};

handleLoad();
</script>

<style scoped>
.content {
  border:0px #000 solid;
  position: relative;
  width: 100%;
  height: 100%;
}
:global(.el-tabs__content) {
  position: absolute;
  top: 50px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

:global(.el-tab-pane) {
  height: 100%;
}

:global(.el-table) {
  height: 100%;
}

:global(.el-table__body-wrapper){
   position: absolute;
  top: 40px;
  right: 0px;
  bottom: 0px;
  left: 0px;
}

::-webkit-scrollbar {
  width: 2px; /* 宽度为10px */
}

::-webkit-scrollbar-thumb {
  background-color: #ccc;
}


.opbuttons {
  position: absolute;
  top: 0px;
  right: 0px;
}

:global(.el-loading-parent--relative) {
  position: static !important;
}

</style>