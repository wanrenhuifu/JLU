# 吉林大学机器学习课程作业

这是吉林大学软件工程专业大三上学期机器学习课程的作业，包含两个日常作业和一个期末大作业。

## 项目结构

```
├── finalwork/       # 期末大作业：基于支持向量机的手写数字识别
├── ml1/             # 日常作业1：房价预测模型
└── ml2/             # 日常作业2：垃圾邮件分类
```

## 项目说明

### 1. finalwork：基于支持向量机的手写数字识别

**项目描述**：使用支持向量机（SVM）算法对手写数字进行识别，使用MNIST数据集。

**文件说明**：
- `svm_mnist.py`：主程序，实现SVM模型的训练和测试
- `mnist_svm_results.png`：实验结果可视化
- `基于支持向量机的手写数字识别.md`：实验报告
- `results/`：存放实验结果的目录

### 2. ml1：房价预测模型

**项目描述**：使用线性回归、岭回归和LASSO回归算法对波士顿房价数据集进行预测，并比较不同算法的性能。

**文件说明**：
- `housing_regression.py`：主程序，实现三种回归算法的训练和测试
- `boston.csv`：波士顿房价数据集
- `boston.txt`：数据集说明
- `BGD_vs_SGD_学习曲线.png`：批量梯度下降与随机梯度下降的学习曲线对比
- `BGD_vs_SGD_预测结果.png`：批量梯度下降与随机梯度下降的预测结果对比
- `原始数据_vs_归一化数据的学习曲线.png`：原始数据与归一化数据的学习曲线对比
- `原始数据_vs_归一化数据的预测结果.png`：原始数据与归一化数据的预测结果对比
- `线性回归_vs_岭回归_vs_LASSO回归_系数对比.png`：三种回归算法的系数对比
- `线性回归_vs_岭回归_vs_LASSO回归_预测结果.png`：三种回归算法的预测结果对比
- `房价预测模型分析报告.md`：实验报告

### 3. ml2：垃圾邮件分类

**项目描述**：使用机器学习算法（包括逻辑回归和深度学习方法）对垃圾邮件进行分类。

**文件说明**：
- `logistic_regression_spam_classification.py`：逻辑回归实现的垃圾邮件分类
- `spam_classification_ML.py`：多种机器学习算法实现的垃圾邮件分类
- `download_nltk_data.py`：下载NLTK数据的脚本
- `requirements.txt`：项目依赖
- `data/`：存放数据集的目录
- `DL/`：深度学习方法实现的目录
- `confusion_matrix_逻辑回归.png`：逻辑回归的混淆矩阵
- `roc_curve_逻辑回归.png`：逻辑回归的ROC曲线
- `实验报告.docx`：实验报告
- `实验报告模板.md`：实验报告模板
- `作业要求与原始网址.TXT`：作业要求和原始参考网址

## 环境要求

- Python 3.7+  
- 主要依赖库：
  - numpy  
  - pandas  
  - matplotlib  
  - scikit-learn  
  - nltk  
  - tensorflow/keras（用于深度学习部分）

## 运行说明

### 安装依赖

```bash
pip install -r ml2/Spam_Email_Classificaton-master/requirements.txt
```

### 运行项目

1. **房价预测模型**：
   ```bash
   cd ml1/ml1
   python housing_regression.py
   ```

2. **垃圾邮件分类**：
   ```bash
   cd ml2/Spam_Email_Classificaton-master
   python logistic_regression_spam_classification.py
   # 或
   python spam_classification_ML.py
   ```

3. **手写数字识别**：
   ```bash
   cd finalwork
   python svm_mnist.py
   ```

   ## 许可证

[MIT](./LICENSE)
