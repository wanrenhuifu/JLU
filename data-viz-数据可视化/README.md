# 数据可视化

## 项目简介

本项目是吉林大学**数据可视化**课程的期末大作业，包含四个基于 OpenCV 的图像数据可视化任务，涵盖自适应阈值分割、形态学操作、霍夫圆/直线变换以及 K-Means 聚类等计算机视觉算法。

## 注意事项

- task3 中实际面积无法计算，老师用豆包生成的树叶图像（甚至水印都不去掉），无法准确计算面积。
- 每个 task 文件夹下的 taskX.md 是根据老师给出的两个 Word 文档中的要求整理的。

## 技术栈

- **语言**：Python
- **核心库**：OpenCV, NumPy

## 项目结构

```text
data-viz-数据可视化/
├── README.md               # 项目说明文档
├── run_all.py              # 一键运行全部任务的调度脚本
├── task1/                  # Task 1: 图像连通域分割与细胞计数
│   ├── solution.py
│   ├── fig01.jpg / fig02.jpg
│   └── task1.md
├── task2/                  # Task 2: 霍夫圆变换（寻找图像中的圆形图案）
│   ├── task2.py
│   ├── task2.md
│   └── fig03.png / fig04.jpg
├── task3/                  # Task 3: 不规则图形的实际面积与像素面积计算
│   ├── task3.py
│   ├── task3.md
│   └── fig05.png / fig06.png
└── task4/                  # Task 4: 基于霍夫直线与 K-Means 的车道线及灭点检测
    ├── task4.py
    ├── task4.md
    └── Fig07.png / Fig08.png
```

## 功能特性

| 任务 | 说明 |
|:---|:---|
| Task 1 | 图像连通域分割与细胞计数 |
| Task 2 | 霍夫圆变换，寻找图像中的圆形图案 |
| Task 3 | 不规则图形的实际面积与像素面积计算 |
| Task 4 | 基于霍夫直线与 K-Means 的车道线及灭点 (Vanishing Point) 检测 |

## 运行说明

### 安装依赖

```bash
pip install opencv-python numpy
```

### 一键运行（推荐）

```bash
python run_all.py
```

脚本会自动按顺序启动 `task1` 至 `task4`，并在根目录下创建 `outputs/` 文件夹，所有生成结果分类存放。

### 单独运行某个子任务

```bash
# 示例：运行 task1
cd task1
python solution.py --images fig01.jpg --min-area 15.0

# 或在根目录指定输出目录
python task1/solution.py --images task1/fig01.jpg --out-dir ./my_results
```

查看具体任务支持的参数，可运行 `python taskX.py --help`。

## 许可证

[MIT](../LICENSE)
