# `webpack-panorama`

> Utilities for using webpack with Valve's Panorama UI (for Dota 2 Custom Games).

查看[本教程] ( https://moddota.com/panorama/webpack )以获取使用说明。  
新添加了一个injectReactUmd这个选项会注入react与react-panorama进入  
gamui.CustomConfig的全局空间  
```javascript
          new PanoramaManifestPlugin({
            injectReactUmd:true,
            entries: [ ... ]
           }
```
在src根目录写申明文件   

```javascript
declare interface CustomUIConfig{
    React:typeof React,
    ReactPanorama:typeof ReactPanorama
}
```
更改tscconfig   
```javascript
   "types": ["@moddota/panorama-types","react","@demon673/react-panorama"],
```
引入文件
```
let ReactUMD = GameUI.CustomUIConfig().React;
let ReactPanoramaUMD = GameUI.CustomUIConfig().ReactPanorama;
```
可以做一个总导出文件夹 这样就不用每次引用了 
