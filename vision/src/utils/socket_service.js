export default class SocketService {
  /**
* 单例
*/
  static instance = null
  static get Instance() {
      if (!this.instance) {
          this.instance = new SocketService()
      }
      return this.instance
  }

  // 实例属性
  ws = null
  // 业务类型和回调函数的对于关系  存储回调函数
  callBackMapping = {}
  //标识是否连接成功
  connected=false
  //记录重试的次数
  sendRetryCount=0
  //重新连接尝试的次数
  connectRetryCount=0
  // 初始化连接websocket
  connect() {
      if (!window.WebSocket) {
          return console.log('您的浏览器不支持 WebSocket!')
      }
      this.ws = new WebSocket('ws://localhost:9998')

      // 监听连接成功
      this.ws.onopen = () => {
          console.log('WebSocket 连接成功')
          this.connected=true
          this.connectRetryCount=0
      }
      // 1.服务器连接不成功 2.服务器关闭了连接
      this.ws.onclose = e => {
          console.log('服务器关闭了连接')
          this.connected=false
          this.connectRetryCount++
          setTimeout(()=>{
              this.connect()
          },this.connectRetryCount*500)
      }
      // 监听接收消息
      this.ws.onmessage = msg => {
          console.log('WebSocket 接收到数据')
          //真正服务端发过来的原始数据在msg中的data字段
          // console.log(msg.data)
          const recvData = JSON.parse(msg.data) // 取出服务端传递的数据
          const socketType = recvData.socketType // 取出业务类型,要根据业务类型, 得到回调函数
          // 先判断有没有回调函数
          if (this.callBackMapping[socketType]) {
              const action=recvData.action
              if (action === 'getData') {
                  const realData = JSON.parse(recvData.data) // 得到该图表的数据
                  this.callBackMapping[socketType].call(this,realData)
              }else if(action==='fullScreen'){
                  // this.callBackMapping[socketType].call(this,recvData)
              }else if(action==='themeChange'){

              }
          }

      }

  }
  //回调函数注册
  registerCallBack(socketType, callBack) {
      // 往 callBackMap中存放回调函数
      this.callBackMapping[socketType] = callBack
  }
  //取消一个回调函数
  unRegisterCallBack(socketType) {
      this.callBackMapping[socketType] = null
  }
  // 发送数据的方法
  send(data){
      //判断此时是否连接成功
      if(this.connected){
          this.sendRetryCount=0
          this.ws.send(JSON.stringify(data))
      }else{
          this.sendRetryCount++
          setTimeout(()=>{
              this.send(data)
          },this.sendRetryCount*500)
      }
  }
}