<template>
  <div class="com-page">
    <trend></trend>
  </div>
</template>

<script>
import Trend from "@/components/Trend";

export default {
  // trend 销量趋势
  name: "TrendPage",
  data(){
      return{}
  },
  methods:{

  },
  components: {
    trend:Trend,
  },
};
</script>

<style lang="less" scoped>
</style>