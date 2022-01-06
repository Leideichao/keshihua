<!-- 销量趋势图表 -->
<template>
  <div class="com-container"> 
    <div class="title" :style="comStyle">
      <span>{{"丨"+showTitle}}</span>
      <span class="iconfont title-icon" @click="showChoice=!showChoice" :style="comStyle">&#xe6eb;</span>
      <div class="select-con" v-show="showChoice" :style="marginStyle">
        <div
          class="select-item"
          v-for="item in selectTypes"
          :key="item.key"
          @click="handSelect(item.key)"
        >{{item.text}}</div>
      </div>
    </div>
    <div class="com-chart" ref="trend_ref">111</div>
  </div>
</template>
<script>
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      showChoice: false, //是否显示可选项
      choiceType: "map", //显示的数据类型
      titleFontSize: 0
    };
  },
  created() {
    //在组件创建完成之后 进行回调函数注册
    this.$socket.registerCallBack('trendData',this.getData)
  },
  mounted() {
    this.initChart();
    // this.getData();
    //发送数据给服务器 告诉服务器需要数据
    this.$socket.send({
      action:'getData',
      socketType:'trendData',
      chartName:'trend',
      value:''
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    //组件销毁的时候   进行回调函数取消
    this.$socket.unregisterCallback('trendData')
  },
  computed: {
    selectTypes() {
      if (!this.allData) {
        return [];
      } else {
        return this.allData.type.filter(item => {
          return item.key !== this.choiceType;
        });
      }
    },
    showTitle() {
      if (!this.allData) {
        return "";
      } else {
        return this.allData[this.choiceType].title;
      }
    },
    comStyle() {
      return {
        fontSize: this.titleFontSize + "px"
        // color: getThemeValue(this.theme).titleColor
      }
    },
    marginStyle(){
        return{
           marginLeft:this.titleFontSize+"px"
        }
    }
  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.trend_ref, "chalk");
      const initOption = {
        grid: {
          top: "35%",
          left: "3%",
          right: "4%",
          bottom: "1%",
          containLabel: true
        },
        tooltip: {
          trigger: "axis"
        },
        legend: {
          top: "15%",
          icon: "circle",
          left: 20
        },
        xAxis: {
          type: "category",
          boundaryGap: false
        },
        yAxis: {
          type: "value"
        }
      };

      this.chartInstance.setOption(initOption);
    },
    getData(ret) {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get("trend");
      this.allData = ret;
      console.log(this.allData);
      this.updateChart();
    },
    updateChart() {
      // 半透明的颜色值
      const colorArr1 = [
        "rgba(11, 168, 44, 0.5)",
        "rgba(44, 110, 255, 0.5)",
        "rgba(22, 242, 217, 0.5)",
        "rgba(254, 33, 30, 0.5)",
        "rgba(250, 105, 0, 0.5)"
      ];
      // 全透明的颜色值
      const colorArr2 = [
        "rgba(11, 168, 44, 0)",
        "rgba(44, 110, 255, 0)",
        "rgba(22, 242, 217, 0)",
        "rgba(254, 33, 30, 0)",
        "rgba(250, 105, 0, 0)"
      ];

      // x轴的数据
      const timeArrs = this.allData.common.month;
      // y轴的数据, 暂时先取出map这个节点的数据
      // map代表地区销量趋势
      // seller代表商家销量趋势
      // commodity代表商品销量趋势
      const valueArrs = this.allData[this.choiceType].data;
      // 图表数据, 一个图表中显示5条折线图
      const seriesArr = valueArrs.map((item, index) => {
        return {
          type: "line", // 折线图
          name: item.name,
          data: item.data,
          stack: this.choiceType,
          areaStyle: {
            color: new this.$echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: colorArr1[index]
              },
              {
                offset: 1,
                color: colorArr2[index]
              }
            ])
          }
        };
      });
      const legendArr = valueArrs.map(item => {
        return item.name;
      });
      // 处理图表需要的数据
      const dataOption = {
        xAxis: {
          data: timeArrs
        },
        legend: {
          data: legendArr
        },
        series: seriesArr
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      this.titleFontSize = (this.$refs.trend_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        legend: {
          itemWidth: this.titleFontSize,
          itemHeight: this.titleFontSize,
          // 间距
          itemGap: this.titleFontSize,
          textStyle: {
            fontSize: this.titleFontSize / 1.3
          }
        }
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    handSelect(currentType) {
      this.choiceType = currentType;
      this.updateChart();
      this.showChoice = false;
    }
  }
};
</script>
<style lang='less' scoped>
.title {
  position: absolute;
  left: 50px;
  top: 20px;
  color: white;
  z-index: 1;

  .title-icon {
    margin-left: 10px;
    cursor: pointer;
  }
  .select-con{
      background-color: #222733
  }
}
</style>
