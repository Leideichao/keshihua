const path=require('path')
const fileUtils=require('../utils/file_utils')
const WebSocket = require('ws')
//创建websocket服务器对象，绑定的端口号为9998
const wss = new WebSocket.Server({
    port: 9998
})
//服务器开启监听
module.exports.listen=()=>{
    //对客户端事件监听
    wss.on("connection", client => {
        console.log("有客户端连接...")
        //对客户端的连接对象进行message时间监听
        //msg：客户端发给服务器的数据
        client.on("message", async msg => {
            console.log("客户端发送数据过来了"+msg)
            let payload=JSON.parse(msg)
            const action=payload.action
            if(action==='getData'){
                let filepath='../data/'+payload.chartName+'.json'
                filepath=path.join(__dirname,filepath)
                const ret=await fileUtils.getFileJsonData(filepath)
                //需要在服务器获取到 数据的基础上，增加一个data字段
                //data对应的值，就是某个json文件的内容
                payload.data=ret
                client.send(JSON.stringify(payload))
            }else{
                //原封不动的将所接受到的数据转发到每一个处于连接状态的客户端
                //wss.clients   所有客户端连接
                wss.clients.forEach(client=>{
                    client.send(msg)
                })
            }
            // 发送数据给客户端
            // client.send('hello socket')
        })
    })
}
