<!-- 热销商品图表 -->
<template>
  <div class="com-container">
    <div class="com-chart" ref="hot_ref"></div>
    <span class="iconfont arr_left" @click="toLeft" :style="comStyle">&#xe6ef;</span>
    <span class="iconfont arr_right" @click="toRight" :style="comStyle">&#xe6ed;</span>
    <span class="cat_name">{{catName}}</span>
  </div>
</template>
<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      currentIndex: 0,
      titleFontSize: 0
    };
  },
  created(){
    this.$socket.registerCallBack('hotData',this.getData)
  },
  computed: {
    catName() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.currentIndex].name;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px"
      };
    }
  },
  mounted() {
    this.initChart();
    // this.getData();
     this.$socket.send({
      action:'getData',
      socketType:'hotData',
      chartName:'hotproduct',
      value:''
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unregisterCallback('hotData')

  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.hot_ref, "chalk");
      const initOption = {
        title: {
          text: "▎ 热销商品销售金额占比统计",
          left: 20,
          top: 20
        },
        legend: {
          top: "15%",
          icon: "circle"
        },
        tooltip: {
          show: true,
          formatter: arg => {
            console.log(arg);
            const thirdCategory = arg.data.children;
            //计算所有三级分类的数值总和
            let total = 0;
            thirdCategory.forEach(item => {
              total += item.value;
            });
            let retStr = "";
            thirdCategory.forEach(item => {
              retStr += `
                    ${item.name}:${parseInt((item.value / total) * 100) + "%"}
                    </br>
                    `;
            });
            return retStr;
          }
        },

        series: [
          {
            type: "pie",
            label: {
              // 隐藏文字
              show: false
            },
            labelLine: {
              // 隐藏线
              show: false
            },
            emphasis: {
              label: {
                // 高亮显示文字
                show: true
              }
            }
          }
        ]
      };
      this.chartInstance.setOption(initOption);
    },
     getData(ret) {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get("hotproduct");
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 处理图表需要的数据
      //饼图数据
      const seriesData = this.allData[this.currentIndex].children.map(item => {
        return {
          value: item.value,
          name: item.name,
          children: item.children
        };
      });
      //图例数据
      const legendData = this.allData[this.currentIndex].children.map(item => {
        return item.name;
      });
      const dataOption = {
        legend: {
          data: legendData
        },
        series: [
          {
            data: seriesData
          }
        ]
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.hot_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: this.titleFontSize
          }
        },
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          itemGap: this.titleFontSize / 2,
          textStyle: {
            fontSize: this.titleFontSize / 2
          }
        },
        series: [
          {
            radius: this.titleFontSize * 4.5,
            center: ["50%", "60%"]
          }
        ]
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    toLeft() {
      this.currentIndex--;
      if (this.currentIndex < 0) {
        this.currentIndex = this.allData.length - 1;
      }
      this.updateChart();
    },
    toRight() {
      this.currentIndex++;
      if (this.currentIndex > this.allData.length - 1) {
        this.currentIndex = 0;
      }
      this.updateChart();
    }
  }
};
</script>
<style lang='less' scoped>
.arr_left {
  position: absolute;
  left: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.arr_right {
  position: absolute;
  right: 10%;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  color: white;
}
.cat_name {
  position: absolute;
  left: 80%;
  bottom: 20px;
  font-weight: bold;
  color: white;
}
</style>