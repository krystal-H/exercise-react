# 开放平台5.0版本

## 项目开发
   国际惯例，先写这个···
```js
    // 安装依赖
    npm run install
    // 启动项目
    npm run dev
```

## 项目打包/发布

### 打包

此工程为源码目录，项目发布时，打包生成文件

然后拷贝到发布目录 (http://200.200.200.40/svn/repositories/front/trunk/open-clife-4.0 ) ，*提交更新*。

```js
    // dll目录下无文件，或者修改了dll配置后
    npm run dll
    // 打包
    npm run pro
```

### 发布

开发环境： 在jenkins 的开发环境工程（ http://200.200.200.58:8080/jenkins/view/front-test/job/wCloud-v4-test/）中构建项目即可；注意在提交更新后，稍*等一两分钟再构建*，立即构建大概率还是用的旧代码。
测试环境： 需要由测试人员提单，然后运维更新。需要向测试人员提供*工程名*和*更新说明*
开发环境： 同上由测试人员提单更新

## mock数据

目前使用的是 `mocker-api` 插件进行数据模拟。 文档 ： https://github.com/jaywcjlove/mocker-api

```js
    // mock模式启动项目
    npm run dev:mock
```

mock数据在 `src/mock` 下, `index.js`文件中加入需要模拟的接口，接口数据较多时，请放入`data`目录中，按照模块创建子目录。

可以准备一份较全的接口数据，在开发环境崩溃时，你会觉得很有用···

## 公共资源记录

此部分用于记录公共的方法和组件，避免重复开发

### 数据请求
    
数据请求使用`@src/api/request.js`，是在`axios`的基础上根据项目特点进行了简单的封装，提供了一些便利配置
所有请求的路径在`@src/api/path.js`中进行管理

### 组件

#### MyIcon 自定义图标组件
此控件是对`antd/Icon`组件的补充，在Icon控件图标库没有合适的情况下使用
自定义图标库路径为：https://www.iconfont.cn/manage/index?manage_type=myprojects&projectId=1356493

### NoSourceWarn 无资源提示组件
此控件用于数据为空时的提示，比如列表/表格数据为空时

## 开发建议

此部分需要持续补充···








