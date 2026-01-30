# 模拟器启动加速（优先级 3）

以下为本地手动配置，用于加速模拟器启动与运行。

---

## A. 使用快照功能（Snapshot）

1. 打开 **Device Manager**（Android Studio 右侧或 Tools → Device Manager）。
2. 右键点击目标模拟器 → **Edit**。
3. 在 **Emulated Performance** 区域：
   - **Graphics**：选择 **Hardware - GLES 2.0**
   - **Boot option**：选择 **Quick boot**
   - 勾选 **Enable snapshot for faster startup**
4. 点击 **Finish** 保存。

---

## B. 优化模拟器配置文件（可选）

编辑对应 AVD 的 `config.ini`，路径示例：

- Windows: `C:\Users\<你的用户名>\.android\avd\<AVD名称>.avd\config.ini`
- 例如: `C:\Users\kevin\.android\avd\Medium_Phone_API_36.1.avd\config.ini`

可添加或修改：

```ini
hw.ramSize=2048
hw.gpu.enabled=yes
hw.gpu.mode=host
disk.dataPartition.size=4096M
fastboot.chosenSnapshotFile=
fastboot.forceChosenSnapshotBoot=no
fastboot.forceColdBoot=no
fastboot.forceFastBoot=yes
```

保存后重启模拟器使配置生效。
