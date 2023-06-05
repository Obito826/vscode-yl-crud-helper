# Welcome to your VS Code Extension

## 环境🏠

* node 版本 >16
* 推荐使用 [nvm](https://zhuanlan.zhihu.com/p/550264306) 管理多版本 node

## 安装依赖🔨

* npm i

## 启动🏃

* 按 F5 进入调试状态（如果报错启动调试失败，请彻底关闭所有 VSCode 窗口重试，再不行就卸载 VSCode 重装）。
* 顺利的话，此时会打开一个拓展窗口，在新窗口里打开用于调试 VSCode 插件的项目。例如本插件项目，在调试项目窗口的 `<template><div> 这里输入标签关键字<yl </div></template>` 就会成功的提示出我们在 `src/attributes.ts` 和 `src/tags.ts` 中配置的一些提示信息。

## 调试🐞
* 当你修改了本插件代码，并且想在新窗口的调试项目中获得更新时，请在新窗口按 `Ctrl+R or Cmd+R on Mac` 去重载调试项目。
* 调试过程中，console.log 在插件项目中不太奏效，我们可以通过点击 VSCode 侧边栏的 `运行和调试` 按钮，然后在需要 Debug 的代码行数左边点击 `暗红色小圆点` 激活本行代码的编辑器调试功能，并且在左边的断点窗口看到对应的提示，此时我们切换到调试项目，按下重载按钮，就可以进行我们的断点调试了。


## 探索 API✨

* 打开文件 `node_modules/@types/vscode/index.d.ts`，里面有详细的 API 说明。或者你也可以阅览[本篇文档](https://bookstack.cn/read/VS-Code-Extension-Doc-ZH)去获得一个更加详细和的开发流程和代码示例。

## 发布✌️

* [请参阅本章](https://www.bookstack.cn/read/VS-Code-Extension-Doc-ZH/docs-extension-authoring-publish-extension.md)


## 本项目期待和感谢您的贡献🍰