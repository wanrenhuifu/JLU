# 数据可视化整合项目 (Data Visualization Project)

这是一个包含四个基于 OpenCV 处理的图像数据可视化任务的综合工程项目。各个子任务涵盖了不同的计算机视觉算法，如自适应阈值分割、形态学操作、霍夫圆/直线变换以及 K-Means 聚类等。

## 环境要求

本项目采用 Python 编写，主要的依赖包如下：
- `opencv-python`
- `numpy`

### 安装依赖

打开终端并进入项目根目录，运行：
```bash
pip install -r requirements.txt
```

## 项目结构

```text
.
├── README.md               # 项目说明文档
├── requirements.txt        # Python 依赖清单
├── run_all.py              # 一键运行全部任务的调度脚本
├── task1/                  # Task 1: 图像连通域分割与细胞计数
│   ├── solution.py
│   ├── fig01.jpg / fig02.jpg
│   └── task1.md
├── task2/                  # Task 2: 霍夫圆变换（寻找图像中的圆形图案）
│   ├── task2.py
│   └── fig03.png / fig04.jpg
├── task3/                  # Task 3: 不规则图形的实际面积与像素面积计算
│   ├── task3.py
│   └── fig05.png / fig06.png
└── task4/                  # Task 4: 基于霍夫直线与 K-Means 的车道线及灭点(Vanishing Point)检测
    ├── task4.py
    └── Fig07.png / Fig08.png
```

## 如何运行

本项目既支持单个任务独立调试，也支持一键运行所有任务并将结果收集整理。

### 方式一：一键自动化执行（推荐）

在项目根目录下直接运行：
```bash
python run_all.py
```
调度脚本会自动按顺序启动 `task1` 至 `task4`，并且自动在根目录下创建 `outputs/` 文件夹。所有的生成结果图片都会被分类存放到 `outputs/task1`、`outputs/task2` 等子目录中，保证工作区的纯净整洁。

### 方式二：单独运行某个子任务

每个子任务的脚本都保留了强大的独立运行能力，并且全部接入了命令行参数解析 (`argparse`)。您可以进入对应目录或在根目录执行：

```bash
# 进入 task1 目录运行
cd task1
python solution.py --images fig01.jpg --min-area 15.0

# 或在根目录将结果指定输出到自定义目录
python task1/solution.py --images task1/fig01.jpg --out-dir ./my_results
```
查看具体任务支持的参数，可以运行 `python taskX.py --help`。

   ## 许可证

[MIT](./LICENSE)
