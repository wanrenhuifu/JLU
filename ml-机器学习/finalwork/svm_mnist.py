import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn import datasets
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
import time
import os

# 设置matplotlib支持中文
plt.rcParams['font.sans-serif'] = ['SimHei']  # 使用黑体
plt.rcParams['axes.unicode_minus'] = False  # 解决负号显示问题

# 创建结果目录
os.makedirs('results', exist_ok=True)

# 1. 加载MNIST数据集
def load_data():
    print("正在加载MNIST数据集...")
    mnist = datasets.fetch_openml('mnist_784', version=1, parser='auto')
    X, y = mnist.data, mnist.target
    y = y.astype(int)
    print(f"数据集加载完成！形状：X={X.shape}, y={y.shape}")
    
    # 可视化数据集样本
    visualize_dataset_samples(X, y)
    
    return X, y

def visualize_dataset_samples(X, y, n_samples=10):
    """
    可视化MNIST数据集样本
    """
    print("\n可视化数据集样本...")
    fig, axes = plt.subplots(2, 5, figsize=(12, 6))
    axes = axes.ravel()
    
    # 将DataFrame转换为numpy数组
    X_np = X.values if hasattr(X, 'values') else X
    y_np = y.values if hasattr(y, 'values') else y
    
    # 随机选择n_samples个样本
    indices = np.random.choice(range(len(X_np)), n_samples, replace=False)
    
    for i, idx in enumerate(indices):
        img = X_np[idx].reshape(28, 28)
        axes[i].imshow(img, cmap='gray')
        axes[i].set_title(f"数字: {y_np[idx]}")
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.savefig('results/mnist_samples.png', dpi=300, bbox_inches='tight')
    print("数据集样本图像已保存为 results/mnist_samples.png")

# 2. 数据预处理
def preprocess_data(X, y, test_size=0.2, random_state=42):
    print("\n正在进行数据预处理...")
    
    # 可视化类别分布
    visualize_class_distribution(y)
    
    # 数据标准化
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    print("数据标准化完成")
    
    # 使用PCA进行降维
    pca = PCA(n_components=0.95, random_state=random_state)
    X_pca = pca.fit_transform(X_scaled)
    print(f"PCA降维完成，保留了{X_pca.shape[1]}个特征")
    
    # 可视化PCA降维效果
    visualize_pca_effect(pca)
    
    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(
        X_pca, y, test_size=test_size, random_state=random_state, stratify=y
    )
    print(f"数据划分完成：训练集{X_train.shape}, 测试集{X_test.shape}")
    
    return X_train, X_test, y_train, y_test, scaler, pca

def visualize_class_distribution(y):
    """
    可视化数据集类别分布
    """
    print("\n可视化类别分布...")
    # 将DataFrame转换为numpy数组
    y_np = y.values if hasattr(y, 'values') else y
    
    # 统计各类别样本数量
    class_counts = np.bincount(y_np)
    
    # 绘制类别分布直方图
    plt.figure(figsize=(10, 6))
    plt.bar(range(10), class_counts, color='skyblue')
    plt.xlabel('数字类别')
    plt.ylabel('样本数量')
    plt.title('MNIST数据集类别分布')
    plt.xticks(range(10))
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # 在柱状图上添加数值标签
    for i, count in enumerate(class_counts):
        plt.text(i, count + 100, str(count), ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig('results/class_distribution.png', dpi=300, bbox_inches='tight')
    print("类别分布图已保存为 results/class_distribution.png")

def visualize_pca_effect(pca):
    """
    可视化PCA降维效果
    """
    print("\n可视化PCA降维效果...")
    
    # 绘制累积方差贡献率曲线
    plt.figure(figsize=(10, 6))
    plt.plot(range(1, len(pca.explained_variance_ratio_) + 1), 
             np.cumsum(pca.explained_variance_ratio_), 
             marker='o', linestyle='-', color='b')
    plt.axhline(y=0.95, color='r', linestyle='--', label='95%方差保留')
    plt.xlabel('主成分数量')
    plt.ylabel('累积方差贡献率')
    plt.title('PCA累积方差贡献率曲线')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.7)
    
    plt.tight_layout()
    plt.savefig('results/pca_variance_ratio.png', dpi=300, bbox_inches='tight')
    print("PCA方差贡献率曲线已保存为 results/pca_variance_ratio.png")

# 3. 训练SVM模型
def train_svm(X_train, y_train, kernel='rbf', C=1.0, gamma='scale', random_state=42):
    print(f"\n正在训练SVM模型，参数：kernel={kernel}, C={C}, gamma={gamma}")
    start_time = time.time()
    
    svm = SVC(kernel=kernel, C=C, gamma=gamma, random_state=random_state)
    svm.fit(X_train, y_train)
    
    end_time = time.time()
    training_time = end_time - start_time
    print(f"模型训练完成，耗时：{training_time:.2f}秒")
    
    return svm, training_time

# 4. 模型评估
def evaluate_model(svm, X_test, y_test):
    print("\n正在评估模型...")
    start_time = time.time()
    
    y_pred = svm.predict(X_test)
    
    end_time = time.time()
    prediction_time = end_time - start_time
    
    accuracy = accuracy_score(y_test, y_pred)
    print(f"模型准确率：{accuracy:.4f}")
    print(f"预测耗时：{prediction_time:.2f}秒")
    
    # 打印分类报告
    print("\n分类报告：")
    print(classification_report(y_test, y_pred))
    
    # 生成混淆矩阵
    cm = confusion_matrix(y_test, y_pred)
    print("混淆矩阵：")
    print(cm)
    
    return accuracy, y_pred, cm

def visualize_evaluation_results(y_test, y_pred, cm):
    """
    可视化模型评估结果
    """
    print("\n可视化评估结果...")
    
    # 1. 可视化混淆矩阵
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=range(10), yticklabels=range(10))
    plt.xlabel('预测标签')
    plt.ylabel('真实标签')
    plt.title('SVM模型混淆矩阵')
    plt.tight_layout()
    plt.savefig('results/confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("混淆矩阵图已保存为 results/confusion_matrix.png")
    
    # 2. 可视化各类别准确率
    class_acc = np.diag(cm) / cm.sum(axis=1)
    plt.figure(figsize=(10, 6))
    bars = plt.bar(range(10), class_acc, color='lightgreen')
    plt.xlabel('数字类别')
    plt.ylabel('准确率')
    plt.title('各类别准确率对比')
    plt.xticks(range(10))
    plt.ylim(0, 1.1)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # 在柱状图上添加数值标签
    for i, bar in enumerate(bars):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{height:.3f}', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig('results/class_accuracy.png', dpi=300, bbox_inches='tight')
    print("各类别准确率对比图已保存为 results/class_accuracy.png")
    
    # 3. 可视化预测错误样本
    visualize_wrong_predictions(X_test_original, y_test, y_pred, n_samples=10)

# 5. 可视化结果
def visualize_results(X, y, y_pred, indices=range(10)):
    print("\n可视化部分结果...")
    fig, axes = plt.subplots(2, 5, figsize=(12, 6))
    axes = axes.ravel()
    
    # 将DataFrame转换为numpy数组
    X_np = X.values if hasattr(X, 'values') else X
    y_np = y.values if hasattr(y, 'values') else y
    
    for i, idx in enumerate(indices[:10]):
        # 恢复原始图像形状
        img = X_np[idx].reshape(28, 28)
        axes[i].imshow(img, cmap='gray')
        axes[i].set_title(f"真实: {y_np[idx]}\n预测: {y_pred[idx]}")
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.savefig('results/mnist_svm_results.png', dpi=300, bbox_inches='tight')
    print("结果图像已保存为 results/mnist_svm_results.png")

def visualize_wrong_predictions(X, y_test, y_pred, n_samples=10):
    """
    可视化预测错误的样本
    """
    print("\n可视化预测错误样本...")
    
    # 将DataFrame转换为numpy数组
    X_np = X.values if hasattr(X, 'values') else X
    y_test_np = y_test.values if hasattr(y_test, 'values') else y_test
    y_pred_np = y_pred
    
    # 找出预测错误的样本索引
    wrong_indices = np.where(y_test_np != y_pred_np)[0]
    
    if len(wrong_indices) == 0:
        print("没有预测错误的样本！")
        return
    
    # 随机选择n_samples个错误样本
    selected_indices = np.random.choice(wrong_indices, min(n_samples, len(wrong_indices)), replace=False)
    
    # 可视化错误样本
    fig, axes = plt.subplots(2, 5, figsize=(12, 6))
    axes = axes.ravel()
    
    for i, idx in enumerate(selected_indices):
        img = X_np[idx].reshape(28, 28)
        axes[i].imshow(img, cmap='gray')
        axes[i].set_title(f"真实: {y_test_np[idx]}\n预测: {y_pred_np[idx]}", color='red')
        axes[i].axis('off')
    
    plt.tight_layout()
    plt.savefig('results/wrong_predictions.png', dpi=300, bbox_inches='tight')
    print("预测错误样本图已保存为 results/wrong_predictions.png")

# 6. 主函数
def main():
    print("=" * 60)
    print("基于支持向量机的MNIST手写数字识别")
    print("=" * 60)
    
    # 加载数据
    X, y = load_data()
    
    # 划分原始数据为训练集和测试集，用于可视化
    X_train_original, X_test_original, y_train_original, y_test_original = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # 数据预处理
    X_train, X_test, y_train, y_test, scaler, pca = preprocess_data(X, y)
    
    # 训练模型
    svm, training_time = train_svm(X_train, y_train)
    
    # 模型评估
    accuracy, y_pred, cm = evaluate_model(svm, X_test, y_test)
    
    # 可视化评估结果（包括错误样本）
    visualize_evaluation_results_with_original_data(y_test, y_pred, cm, X_test_original)
    
    # 可视化部分测试结果
    visualize_results(X_test_original, y_test_original, y_pred)
    
    print("\n" + "=" * 60)
    print(f"项目完成！最终准确率：{accuracy:.4f}")
    print("=" * 60)
    
    return accuracy, training_time

def visualize_evaluation_results_with_original_data(y_test, y_pred, cm, X_test_original):
    """
    使用原始数据可视化评估结果
    """
    print("\n使用原始数据可视化评估结果...")
    
    # 1. 可视化混淆矩阵
    plt.figure(figsize=(12, 10))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                xticklabels=range(10), yticklabels=range(10))
    plt.xlabel('预测标签')
    plt.ylabel('真实标签')
    plt.title('SVM模型混淆矩阵')
    plt.tight_layout()
    plt.savefig('results/confusion_matrix.png', dpi=300, bbox_inches='tight')
    print("混淆矩阵图已保存为 results/confusion_matrix.png")
    
    # 2. 可视化各类别准确率
    class_acc = np.diag(cm) / cm.sum(axis=1)
    plt.figure(figsize=(10, 6))
    bars = plt.bar(range(10), class_acc, color='lightgreen')
    plt.xlabel('数字类别')
    plt.ylabel('准确率')
    plt.title('各类别准确率对比')
    plt.xticks(range(10))
    plt.ylim(0, 1.1)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    # 在柱状图上添加数值标签
    for i, bar in enumerate(bars):
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height + 0.01,
                f'{height:.3f}', ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig('results/class_accuracy.png', dpi=300, bbox_inches='tight')
    print("各类别准确率对比图已保存为 results/class_accuracy.png")
    
    # 3. 可视化预测错误样本
    visualize_wrong_predictions(X_test_original, y_test, y_pred, n_samples=10)

if __name__ == "__main__":
    main()
