# `webpack-panorama`

> Utilities for using webpack with Valve's Panorama UI (for Dota 2 Custom Games).
> 2022/4/30 更新 => 增加useMemo的申明 解决了特殊组件渲染问题 
> 增加了usetore 全局状态管理hook
> 增加了send方法传入参数  send(key,value,update)
> 修复serve.GetNodeByFlag

新增加一个error hook  在这里可以自定义报错回调
GameUI.CustomUIConfig().error = (error:any) =>{
    $.Msg(error)
}

查看[本教程] ( https://moddota.com/panorama/webpack )以获取使用说明。  
新添加了一个injectReactUmd这个选项会注入react与react-panorama进入  
注意=>现在gameui.config的全局会自动注入每个xml的假全局变量
也就是说  usestate useeffect等函数直接调用就行  不用引入任何申明
直接使用就可以了

增加了新的全局UMD捆绑
shortid.generate():string  返回一个UUID

为了等待中心store初始化完毕
建议异步渲染
$.Schedule(0,()=>render(any,$.GetContextPanel())


这是test2组件
```javascript 
    export const Test2 = () =>{
    /**
     * Node 节点    anineshake 防抖函数    send 节点间通信  serve 总中心
     * windowsR 全局窗口注册坐标     trigger 收到信息时 该值会变换一次 就是一个触发器
     */
    const {Node,aineshake,send,serve,windowsR,trigger}  =  useStore({name:"test1",context:"weapon",flags:["unco"]})
    const [state,setstate] = useState(0)

    useEffect(()=>{
        //还没创建出来就不做初始化
        if(!Node) return
        //初始化容器 设置整个表
        Node.SetContainer({name:"AXE","attack":100})
        //设置单个值
        Node.SetValue("attack",123)
        //只对表中的number做add操作 可以为负数 若值不在就创造新值
        Node.inc({"attack":1})
        //在该节点上注册open事件触发器
        Node.FuncR("open",()=>{
            setstate(value=>value+1)
        })
    },[Node]) //检测Node是否创建成功


    const click = () =>{
        $.Msg("判断防抖函数是否到期")
        if(!aineshake()) return
    }
    
    return <Panel {...windowsR} onactivate={click}></Panel>

}

```

这是test1组件
```javascript 
   export const Test1 = () =>{
    //和test1一样  这个context都是处于weapon  trigger是个触发器  当节点被update就会被触发
    const {Node,trigger,send} = useStore({name:'test2',context:"weapon"})

    useEffect(()=>{
        // 当节点改变 我们打印getcontainer
        $.Msg(Node?.GetContainer())


        send("test1","open") //我们可以往test1发送信号
    },[trigger])

    //当trigger被触发  这里的值也会被刷新  
    return <Label text={Node?.GetContainer()?.name}></Label>

}


```


有必要的全局申明

```javascript 
interface StoreContextDeclarations{
    weapon:{
        name:string
        attack:number
    }
    ability:{
        name:string
    }
    Test1:string,
    Test2:string,
}

interface uncoFlags{
    unco:any
}

interface NodeName{
    test1:string
    test2:string
}

}


```
  
webpack.config.js设置
```javascript
    output: {
        path: path.resolve(__dirname, 'layout/custom_game/'),
        publicPath: 'file://{resources}/layout/custom_game/',
    },
``` 
```javascript
          new PanoramaManifestPlugin({
            injectReactUmd:true, //加入注入
            entries: [ ... ]
           }
```
现在申明文件是自动导入了 在src有一个global的全局申明

```javascript
declare global{
      const React:typeof React
      const ReactPanorama:typeof ReactPanorama
      const useNetTableKey:typeof ReactPanorama.useNetTableKey
      const render:typeof ReactPanorama.render
      const useGameEvent:typeof ReactPanorama.useGameEvent
      const useNetTableValues:typeof ReactPanorama.useNetTableValues
      const useRegisterForUnhandledEvent:typeof ReactPanorama.useRegisterForUnhandledEvent
      const memo:typeof React.memo
      const useCallback:typeof React.useCallback
      const useContext:typeof React.useContext
      const useDebugValue:typeof React.useDebugValue
      const useEffect:typeof React.useEffect
      const useLayoutEffect:typeof React.useLayoutEffect
      const useReducer:typeof React.useReducer
      const useRef:typeof React.useRef
      const useState:typeof React.useState
  }
```
webpack.config.js
```javascript
   module: {
        rules: [
            {
                test: /\.xml$/,
                loader: 'unco-webpack-panorama/lib/layout-loader',
            },
            {
                test: /\.[jt]sx?$/,
                issuer: /\.xml$/,
                loader: 'unco-webpack-panorama/lib/entry-loader',
            },
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                options: { transpileOnly: true },
            },
            {
                test: /\.(css|s[ac]ss)$/,
                issuer: /\.xml$/,
                loader: 'file-loader',
                options: { name: '[path][name].css', esModule: false },
            },
            {
                test: /\.s[ac]ss$/,
                loader: 'sass-loader',
                options: {
                    implementation: require('node-sass'),
                    sassOptions: {
                        outputStyle: 'expanded',
                    },
                },
            },
        ],
    },
```


