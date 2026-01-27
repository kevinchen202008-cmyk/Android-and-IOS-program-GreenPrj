# GreenPrj Android Platform

GreenPrj 个人记账应用 - Android平台

## 技术栈

- **语言**: Kotlin
- **架构**: Clean Architecture + MVVM
- **依赖注入**: Hilt (Dagger for Android)
- **数据库**: Room 2.8.4
- **UI框架**: Material Design Components
- **异步**: Kotlin Coroutines + Flow
- **构建工具**: Gradle

## 项目结构

```
app/
├── data/
│   ├── local/
│   │   ├── database/          # Room数据库
│   │   ├── entities/          # 数据库实体
│   │   └── dao/               # 数据访问对象
│   ├── repositories/          # Repository实现
│   └── models/               # 数据模型
├── domain/
│   ├── entities/              # 业务实体
│   ├── repositories/          # Repository接口
│   └── usecases/              # 业务用例
├── presentation/
│   ├── features/
│   │   ├── accounting/        # 记账功能
│   │   ├── statistics/        # 统计功能
│   │   └── budget/           # 预算功能
│   └── common/               # 共享UI组件
└── di/                        # 依赖注入模块
```

## 开发

```bash
# 使用Android Studio打开项目
# 或使用命令行构建
./gradlew build

# 运行应用
./gradlew installDebug
```

## 功能特性

- ✅ 项目初始化完成
- ✅ Clean Architecture结构
- ✅ Hilt依赖注入配置
- ✅ Room数据库基础设置
- ⏳ 数据库实体定义
- ⏳ 用户认证
- ⏳ 记账功能
- ⏳ 统计报表
- ⏳ 预算管理

## 最低要求

- **最低SDK**: API 21 (Android 5.0)
- **目标SDK**: API 34
- **编译SDK**: API 34
