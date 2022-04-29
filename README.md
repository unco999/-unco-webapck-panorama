# `webpack-panorama`

> Utilities for using webpack with Valve's Panorama UI (for Dota 2 Custom Games).
> 2022/4/30 更新 => 增加useMemo的申明 解决了特殊组件渲染问题 

查看[本教程] ( https://moddota.com/panorama/webpack )以获取使用说明。  
新添加了一个injectReactUmd这个选项会注入react与react-panorama进入  
注意=>现在gameui.config的全局会自动注入每个xml的假全局变量
也就是说  usestate useeffect等函数直接调用就行  不用引入任何申明
直接使用就可以了
  
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


