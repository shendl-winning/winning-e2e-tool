<template>
  <div class="rightDefault"></div>
</template>
<script setup>
import axios from "axios";

  getTestCase().then((testcase) => {
    console.log(testcase.datas)
  });

  async function getTestCase() {
		const res = await axios.get(
			"http://172.16.7.148:9200/testcase/_doc/bf8d42bc-7541-44f2-99b8-558d7aabe0bf"
		)
		let testcaseWrap = JSON.parse(res.request.response);
		return testcaseWrap._source
	};



</script>
<style scoped>
.rightDefault {
  background: url(@/assets/image/rightDefault.png) center center no-repeat;
  position: relative;
  width: 100%;
  height: 100%;
}
</style>