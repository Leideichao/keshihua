<!-- 这个组件是对应于路由规则中 /seller 这条路径的
在这个组件中,需要展示Seller.vue这个组件
Seller.vue才是真正显示图表的组件
-->
<template>
  <div class="com-container">
    <div class="com-chart" ref="seller_ref"></div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chartInstance: null, // echarts实例对象
      allData: [], // 服务器获取的所有数据
      currentPage: 1, //当前页数
      totalPage: 0, //总页数，需要进行计算，每五个为一页
      timeId: null //定时器标识
    };
  },
  created(){
    this.$socket.registerCallBack('sellerData',this.getData)

  },
  mounted() {
    // 由于初始化echarts实例对象需要使用到dom元素,因此必须要放到mounted中, 而不是created
    this.initChart();
    // this.getData();
    this.$socket.send({
      action:'getData',
      socketType:'sellerData',
      chartName:'seller',
      value:''
    })
    window.addEventListener("resize", this.screenAdapter);
    //页面加载完成的时候  主动进行屏幕适配
    this.screenAdapter()
  },
  destroyed() {
    clearInterval(this.timeId);
    // 在组件销毁的时候, 需要将监听器取消掉
    window.removeEventListener("resize", this.screenAdapter);
    this.$socket.unregisterCallback('sellerData')

  },
  methods: {
    initChart() {
      this.chartInstance = this.$echarts.init(this.$refs.seller_ref, "chalk"); // 初始化echarts实例对象
      //对图表初始化配置的控制
      const initOption = {
        title: {
          text: "▎ 商家销量排行",
          left: 20,
          top: 20,
        },
        grid: {
          top: "20%",
          left: "3%",
          right: "6%",
          bottom: "3%",
          containLabel: true //距离是否包含坐标轴上的文字
        },
        xAxis: {
          type: "value"
        },
        yAxis: {
          type: "category"
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "line",
            z: 0,
            lineStyle: {
              color: "#2D3443"
            }
          }
        },
        series: [
          {
            type: "bar",
            label: {
              show: true,
              position: "right",
              textStyle: {
                color: "white"
              }
            },
            itemStyle: {
              //指明颜色渐变方向
              //指明不同百分比之下颜色的值
              color: new this.$echarts.graphic.LinearGradient(0, 0, 1, 0, [
                //初始
                {
                  offset: 0,
                  color: "#5052EE"
                },
                //结束
                {
                  offset: 1,
                  color: "#AB6EE5"
                }
              ])
            }
          }
        ]
      };
      this.chartInstance.setOption(initOption);
      // 对图表对象进行鼠标事件的监听
      this.chartInstance.on("mouseover", () => {
        clearInterval(this.timeId);
      });
      this.chartInstance.on("mouseout", () => {
        this.startInterval();
      });
    },

     getData(res) {
      // const { data: res } = await this.$http.get("seller"); // 获取数据
      this.allData = res;
      // const res=await this.$http.get("seller");
      // console.log(res)
      // 对allData进行从大到小的排序
      this.allData.sort((a, b) => {
        return a.value - b.value; //从小到大排序
      });
      //计算总页数
      this.totalPage =
        this.allData.length % 5 === 0
          ? this.allData.length / 5
          : this.allData.length / 5 + 1;
      this.updateChart();
      this.startInterval(); //开启动画效果
    },
    updateChart() {
      const start = (this.currentPage - 1) * 5;
      const end = this.currentPage * 5;
      const showData = this.allData.slice(start, end);
      // 处理数据并且更新界面图表
      const sellerNames = showData.map(item => {
        return item.name;
      });
      const sellerValues = showData.map(item => {
        return item.value;
      });
      const dataOption = {
        yAxis: {
          data: sellerNames
        },
        series: [
          {
            data: sellerValues
          }
        ]
      };
      this.chartInstance.setOption(dataOption);
    },
    startInterval() {
      if (this.timeId) {
        clearInterval(this.timeId);
      }
      this.timeId = setInterval(() => {
        this.currentPage++;
        if (this.currentPage > this.totalPage) {
          this.currentPage = 1;
        }
        this.updateChart();
      }, 3000);
    },
    screenAdapter() {
      // console.log(this.$refs.seller_ref.offsetWidth)
      const titleFontSize = (this.$refs.seller_ref.offsetWidth / 100) * 3.6;
      const adapterOption = {
        title: {
          textStyle: {
            fontSize: titleFontSize
          }
        },
        tooltip: {
          axisPointer: {
            lineStyle: {
              width: titleFontSize
            }
          }
        },
        series: [
          {
            barWidth: titleFontSize,
            itemStyle: {
              barBorderRadius: [0, titleFontSize / 2, titleFontSize / 2, 0]
            }
          }
        ]
      };
      this.chartInstance.setOption(adapterOption)
//手动调用图表对象的resize才能产生效果
      this.chartInstance.resize()
    }
  },

  components: {}
};
</script>
<style lang='less' scoped>
</style>