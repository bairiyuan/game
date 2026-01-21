# game-module-windows
## 环境准备
确保本地安装了node.js，推荐node大版本为22

## 初始化
```
# 安装相关依赖
npm install
```

## 运行
```
# 切换到项目根目录
./game-module-windows

# 更改字符编码避免乱码
chcp 65001 

# 启动项目
npm run dev
```
## 开发注意事项
### 美术资源
游戏内部静态美术资源要统一命名完成并设置路径；代码内引用路径为：@assets/app/img/png/game/{游戏名}/{资源名}.png
动态资源（如音效、动画等）存放路径为：resources/dlcs/{游戏名}

### 主体游戏开发
1. 不需要编写游戏规则、分数的相关弹窗，这些在主框架里都已经搭好了
2. 主体游戏代码放在：src/app/games/{游戏名}/{游戏名}.vue，如果有相关逻辑，也放在同级目录下
3. src/components/GameStatus.vue下的gameList需要补充新的游戏信息
4. src/views/game/GameView.vue下需要补充新的游戏信息的相关信息，可以全局搜索“Parkour”，仿照示例添加相关代码

### 其他注意事项
1. 避免创建未引用的变量
2. 保证本程序运行时不会报错

