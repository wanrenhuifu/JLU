# -*- coding: utf-8 -*-
# 逻辑回归垃圾邮件分类任务实现
import numpy as np
import pandas as pd
import string
import re
import matplotlib
# 设置Matplotlib为非交互式后端，避免需要用户交互关闭窗口
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from nltk.corpus import stopwords
from nltk.stem.porter import PorterStemmer
from sklearn.feature_extraction.text import CountVectorizer, TfidfTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_curve, auc, confusion_matrix
from sklearn.model_selection import train_test_split
import seaborn as sns

# 设置中文字体，确保绘图时中文正常显示
plt.rcParams['font.sans-serif'] = ['SimHei']
plt.rcParams['axes.unicode_minus'] = False

# 数据预处理函数
def text_processing(text):
    # 转为小写
    text = text.lower()
    # 移除URL
    text = re.compile(r'https?://\S+|www\.\S+').sub(r'', text)
    # 移除标点符号
    PUNCT_TO_REMOVE = string.punctuation
    text = text.translate(str.maketrans('', '', PUNCT_TO_REMOVE))
    # 移除停用词
    STOPWORDS = set(stopwords.words("english"))
    text = " ".join([word for word in str(text).split() if word not in STOPWORDS])
    # 词干提取
    stemmer = PorterStemmer()
    text = " ".join([stemmer.stem(word) for word in text.split()])
    return text

# 绘制ROC曲线函数
def plot_roc_curve(y_true, y_score, model_name):
    # 计算ROC曲线点
    fpr, tpr, _ = roc_curve(y_true, y_score)
    # 计算AUC值
    roc_auc = auc(fpr, tpr)
    
    # 绘制ROC曲线
    plt.figure()
    plt.plot(fpr, tpr, color='darkorange', lw=2, 
             label='ROC曲线 (面积 = %0.2f)' % roc_auc)
    plt.plot([0, 1], [0, 1], color='navy', lw=2, linestyle='--')
    plt.xlim([0.0, 1.0])
    plt.ylim([0.0, 1.05])
    plt.xlabel('假阳性率 (FPR)')
    plt.ylabel('真阳性率 (TPR)')
    plt.title(f'{model_name} 的ROC曲线')
    plt.legend(loc="lower right")
    plt.grid(True)
    plt.savefig(f'roc_curve_{model_name}.png')  # 保存ROC曲线图像
    plt.close()  # 关闭图像，释放资源
    
    print(f"{model_name} 的AUC值: {roc_auc:.4f}")
    return roc_auc

# 绘制混淆矩阵函数
def plot_confusion_matrix(y_true, y_pred, model_name):
    cm = confusion_matrix(y_true, y_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=['非垃圾邮件', '垃圾邮件'],
                yticklabels=['非垃圾邮件', '垃圾邮件'])
    plt.xlabel('预测标签')
    plt.ylabel('真实标签')
    plt.title(f'{model_name} 的混淆矩阵')
    plt.savefig(f'confusion_matrix_{model_name}.png')  # 保存混淆矩阵图像
    plt.close()  # 关闭图像，释放资源

# 主函数
def main():
    print("开始垃圾邮件分类任务...")
    
    # 1. 读取数据
    print("读取数据集...")
    train_data = pd.read_csv("data/train.csv", usecols=[1, 2], encoding='utf-8')
    
    # 2. 数据预处理
    print("数据预处理...")
    train_data['Email'] = train_data['Email'].apply(text_processing)
    
    # 3. 划分训练集和验证集
    print("划分训练集和验证集...")
    X_train, X_test, y_train, y_test = train_test_split(
        train_data['Email'], train_data['Label'].map({'ham': 0, 'spam': 1}), 
        test_size=0.2, random_state=42
    )
    
    # 4. 特征提取 - 词袋模型 + TF-IDF
    print("特征提取...")
    vectorizer = CountVectorizer()
    X_train_counts = vectorizer.fit_transform(X_train)
    X_test_counts = vectorizer.transform(X_test)
    
    transformer = TfidfTransformer()
    X_train_tfidf = transformer.fit_transform(X_train_counts)
    X_test_tfidf = transformer.transform(X_test_counts)
    
    # 5. 逻辑回归模型训练
    print("训练逻辑回归模型...")
    lr_model = LogisticRegression(max_iter=150, penalty='l2', solver='lbfgs', random_state=0)
    lr_model.fit(X_train_tfidf, y_train)
    
    # 6. 模型评估
    print("评估模型性能...")
    accuracy = lr_model.score(X_test_tfidf, y_test)
    print(f"模型准确率: {accuracy:.4f}")
    
    # 获取预测概率用于绘制ROC曲线
    y_pred_proba = lr_model.predict_proba(X_test_tfidf)[:, 1]
    # 获取预测标签用于混淆矩阵
    y_pred = lr_model.predict(X_test_tfidf)
    
    # 7. 绘制ROC曲线
    print("绘制ROC曲线...")
    roc_auc = plot_roc_curve(y_test, y_pred_proba, "逻辑回归")
    
    # 8. 绘制混淆矩阵
    print("绘制混淆矩阵...")
    plot_confusion_matrix(y_test, y_pred, "逻辑回归")
    
    # 9. 输出结论
    print("\n结论总结:")
    print(f"1. 本实验使用逻辑回归算法实现了垃圾邮件分类任务")
    print(f"2. 模型在测试集上的准确率为: {accuracy:.4f}")
    print(f"3. ROC曲线下面积(AUC)为: {roc_auc:.4f}")
    print("4. 从ROC曲线可以看出，模型具有良好的区分能力")
    print("5. 通过混淆矩阵可以分析模型在不同类别上的表现")
    print("6. ROC曲线和混淆矩阵图像已保存到当前目录")

if __name__ == "__main__":
    main()