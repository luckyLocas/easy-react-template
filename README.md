### 基于Typescript,Webpack 的开发脚手架

#### 使用方式

* 安装依赖 `npm install`
* 测试 `npm run test`
* 开发 `npm run dev`
* 打包 `npm run build`

#### 关于Model文件

`model` 文件夹中的文件类似于以前的`redux`，不同之处在于，原来`redux` 中的代码都是以全局`function` 组织的，现在都组织到一个统一的对象上。
`reducers`也由原来的一个函数中加`switch`的方式改为多个函数，根据函数名称自动匹配的方式。
函数中的 `default` 代表首次执行的函数。
`sagas` 中的函数名通过后缀区分每次执行还是单次执行，例如 `getDataEvery` 表示每次都执行，`getDataLatest` 表示只执行最新的

* __namespace__ 代表这个文件的命名空间，是它的唯一ID，需要全局唯一，推荐的命名方案是依据文件夹和文件名 `camelcase` 命名。如有 `demo/mix/list.js` ，得到 `demoMixList`
* __defaultState__ 是这个组件的默认状态，就是程序一开始时的状态数据。比如说你有一个 `table` ，那么它的初始数据很可能是一个数据源，也就是一个数组，一般来说都是空的。那么可以得到： `defaultState={ dataSource: [] }`
* __reducers__ 是处理业务逻辑的代码，它是一个对象，这个对象包含一系列函数，这些函数就对应页面的各种逻辑操作。比如说你要登录，你可以写个 `login:function(){logined=true}`；你要获取数据，你可以写个 `getData:function(){return []}`
* __sagas__ 跟 `reducers` 十分类似，不同之处在于它是专门处理异步逻辑，一般来说，saga 拦截到一个 `action`，随后发起异步操作（通常是跟服务器交互），异步操作结束后会触发两个 `reducer` 成功就触发 `xxxSuccess`。失败就触发 `xxxFailed`。这是极为简单的举例。
如果组件没有异步操作，可不导出 __sagas__

#### 发布

* 使用命令行进入项目根目录 运行 `npm run build`。运行如果报错考虑使用 `npm install` 安装缺少的依赖
* 将生成的 `dist` 目录整体复制到 `clbs` 中 `resources/lkyw`