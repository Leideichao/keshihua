<!-- 商家分布图表 -->
<template>
  <div class="com-container" @dblclick="revertMap">
    <div class="com-chart" ref="map_ref"></div>
  </div>
</template>

<script>
import axios from "axios";
import { getProvinceMapInfo } from "@/utils/map_utils";
export default {
  data() {
    return {
      chartInstance: null,
      allData: null,
      mapData: {}
    };
  },
  created(){
    this.$socket.registerCallBack('mapData',this.getData)
  },
  mounted() {
    this.initChart();
    // this.getData();
    this.$socket.send({
      action:'getData',
      socketType:'mapData',
      chartName:'map',
      value:''
    })
    window.addEventListener("resize", this.screenAdapter);
    this.screenAdapter();
  },
  destroyed() {
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unregisterCallback('mapData')

  },
  methods: {
    async initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.map_ref, "chalk");
      const ret = await axios.get(
        "http://localhost:8999/static/map/china.json"
      );
      //   console.log(ret)
      this.$echarts.registerMap("china", ret.data);
      const initOption = {
        title: {
          text: "▎ 商家分布",
          left: 20,
          top: 20
        },
        geo: {
          type: "map",
          map: "china",
          top: "5%",
          bottom: "5%",
          itemStyle: {
            areaColor: "#3F50AA",
            borderColor: "#333"
          }
        },
        legend: {
          left: "5%",
          bottom: "5%",
          orient: "vertical"
        }
      };
      this.chartInstance.setOption(initOption);
      this.chartInstance.on("click", async arg => {
        // console.log(arg)
        const provinceInfo = getProvinceMapInfo(arg.name);
        console.log(provinceInfo);
        //需要获取各个省份地图矢量数据
        //判断当前点击的这个省份地图矢量数据在mapData中是否存在
        if (!this.mapData[provinceInfo.key]) {
          const ret = await axios.get(
            "http://localhost:8999" + provinceInfo.path
          );
          console.log(ret);
          this.mapData[provinceInfo.key] = ret.data;
          this.$echarts.registerMap(provinceInfo.key, ret.data);
        }

        const changeOption = {
          geo: {
            map: provinceInfo.key
          }
        };
        this.chartInstance.setOption(changeOption);
      });
    },
     getData(ret) {
      // 获取服务器的数据, 对this.allData进行赋值之后, 调用updateChart方法更新图表
      // const { data: ret } = await this.$http.get("map");
      this.allData = ret;
      //   console.log(ret)
      this.updateChart();
    },
    updateChart() {
      // 处理图表需要的数据
      //图例数据
      const legendData = this.allData.map(item => {
        return item.name;
      });
      //散点数据
      const serierArr = this.allData.map(item => {
        return {
          type: "effectScatter",
          rippleEffect: {
            scale: 5,
            brushType: "stroke"
          },
          //如果想在地图中添加散点数据需要加入以下代码
          coordinateSystem: "geo",
          name: item.name,
          data: item.children
        };
      });
      const dataOption = {
        legend: {
          data: legendData
        },
        series: serierArr
      };
      this.chartInstance.setOption(dataOption);
    },
    screenAdapter() {
      const titleFontSize = (this.$refs.map_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        legend: {
          itemWidth: titleFontSize / 2,
          itemHeight: titleFontSize / 2,
          itemGap: titleFontSize / 2,
          textStyle: {
            fontSize: titleFontSize / 2
          }
        }
      };
      this.chartInstance.setOption(adapterOption);
      this.chartInstance.resize();
    },
    //回到中国地图
    revertMap() {
      const revertOption = {
        geo: {
          map: "china"
        }
      };
      this.chartInstance.setOption(revertOption);
    }
  }
};
</script>
<style lang='less' scoped>
</style>