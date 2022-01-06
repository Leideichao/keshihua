import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import './assets/css/global.less'
import './assets/font/iconfont.css'
axios.defaults.baseURL='http://127.0.0.1:8888/api/'
Vue.prototype.$http=axios
//对服务的进行websocket的连接
import SocketService from './utils/socket_service'
SocketService.Instance.connect()
//其他的组件 this.$socket
Vue.prototype.$socket=SocketService.Instance

Vue.config.productionTip = false
// 将全局echarts对象挂载到Vue的原型对象上
Vue.prototype.$echarts = window.echarts
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
