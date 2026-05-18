# 机器学习课程作业

## 项目简介

本项目是吉林大学软件工程专业大三上学期机器学习课程的作业，包含两个日常作业和一个期末大作业。

## 注意事项

- 本项目仅用于学习和教学目的，不涉及任何商业用途。


## 技术栈

- **语言**：Python 3.7+
- **主要依赖库**：
  - NumPy
  - Pandas
  - Matplotlib
  - scikit-learn
  - NLTK
  - TensorFlow / Keras（用于深度学习部分）

## 项目结构

```text
.
├── finalwork/       # 期末大作业：基于支持向量机的手写数字识别
├── ml1/             # 日常作业1：房价预测模型
└── ml2/             # 日常作业2：垃圾邮件分类
```

## 功能特性

| 模块 | 说明 |
|:---|:---|
| finalwork | 基于支持向量机（SVM）的手写数字识别，使用 MNIST 数据集 |
| ml1 | 线性回归、岭回归和 LASSO 回归对波士顿房价数据集进行预测与比较 |
| ml2 | 逻辑回归和深度学习方法实现垃圾邮件分类 |

## 运行说明

### 安装依赖

```bash
pip install -r ml2/Spam_Email_Classificaton-master/requirements.txt
```

### 运行各子项目

**房价预测模型**
```bash
cd ml1/ml1
python housing_regression.py
```

**垃圾邮件分类**
```bash
cd ml2/Spam_Email_Classificaton-master
python logistic_regression_spam_classification.py
# 或
python spam_classification_ML.py
```

**手写数字识别**
```bash
cd finalwork
python svm_mnist.py
```

## 许可证

[MIT](../LICENSE)
