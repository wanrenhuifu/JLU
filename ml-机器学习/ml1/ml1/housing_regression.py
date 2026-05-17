import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.linear_model import Ridge, Lasso
import random
import matplotlib
# 设置中文字体支持
matplotlib.rcParams['font.sans-serif'] = ['SimHei']  # 用黑体显示中文
matplotlib.rcParams['axes.unicode_minus'] = False  # 正常显示负号

# 加载数据
def load_data(file_path):
    data = pd.read_csv(file_path)
    X = data.iloc[:, :-1].values  # 特征
    y = data.iloc[:, -1].values.reshape(-1, 1)  # 目标变量
    return X, y

# 数据归一化
def normalize_data(X):
    X_norm = np.zeros_like(X, dtype=float)
    mean = np.mean(X, axis=0)
    std = np.std(X, axis=0)
    
    # 避免除以零
    std[std == 0] = 1
    
    X_norm = (X - mean) / std
    return X_norm, mean, std

# 添加偏置项
def add_bias(X):
    return np.hstack((np.ones((X.shape[0], 1)), X))

# 线性回归模型 - 批处理梯度下降(BGD)
class LinearRegressionBGD:
    def __init__(self, learning_rate=0.01, max_iterations=1000, tol=1e-6):
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.tol = tol
        self.weights = None
        self.cost_history = []
        
    def fit(self, X, y):
        # 添加偏置项
        X_with_bias = add_bias(X)
        n_samples, n_features = X_with_bias.shape
        
        # 初始化权重
        self.weights = np.zeros((n_features, 1))
        
        # 梯度下降
        for i in range(self.max_iterations):
            # 预测值
            y_pred = X_with_bias.dot(self.weights)
            
            # 计算误差
            error = y_pred - y
            
            # 计算梯度
            gradient = (1/n_samples) * X_with_bias.T.dot(error)
            
            # 更新权重
            old_weights = self.weights.copy()
            self.weights = self.weights - self.learning_rate * gradient
            
            # 计算损失
            cost = (1/(2*n_samples)) * np.sum(np.square(error))
            self.cost_history.append(cost)
            
            # 检查收敛
            if np.sum(np.abs(self.weights - old_weights)) < self.tol:
                break
                
        return self
    
    def predict(self, X):
        X_with_bias = add_bias(X)
        return X_with_bias.dot(self.weights)

# 线性回归模型 - 随机梯度下降(SGD)
class LinearRegressionSGD:
    def __init__(self, learning_rate=0.01, max_iterations=1000, tol=1e-6):
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.tol = tol
        self.weights = None
        self.cost_history = []
        
    def fit(self, X, y):
        # 添加偏置项
        X_with_bias = add_bias(X)
        n_samples, n_features = X_with_bias.shape
        
        # 初始化权重
        self.weights = np.zeros((n_features, 1))
        
        # 创建数据索引
        indices = list(range(n_samples))
        
        # 梯度下降
        for i in range(self.max_iterations):
            # 打乱数据顺序
            random.shuffle(indices)
            X_shuffled = X_with_bias[indices]
            y_shuffled = y[indices]
            
            old_weights = self.weights.copy()
            
            # 对每个样本进行更新
            for j in range(n_samples):
                # 获取单个样本
                xi = X_shuffled[j:j+1]
                yi = y_shuffled[j:j+1]
                
                # 预测值
                y_pred = xi.dot(self.weights)
                
                # 计算误差
                error = y_pred - yi
                
                # 计算梯度
                gradient = xi.T.dot(error)
                
                # 更新权重
                self.weights = self.weights - self.learning_rate * gradient
            
            # 计算整体损失
            y_pred_all = X_with_bias.dot(self.weights)
            error_all = y_pred_all - y
            cost = (1/(2*n_samples)) * np.sum(np.square(error_all))
            self.cost_history.append(cost)
            
            # 检查收敛
            if np.sum(np.abs(self.weights - old_weights)) < self.tol:
                break
                
        return self
    
    def predict(self, X):
        X_with_bias = add_bias(X)
        return X_with_bias.dot(self.weights)

# 评估模型
def evaluate_model(y_true, y_pred, model_name):
    mse = mean_squared_error(y_true, y_pred)
    r2 = r2_score(y_true, y_pred)
    print(f"{model_name} - MSE: {mse:.4f}, R²: {r2:.4f}")
    return mse, r2

# 绘制学习曲线
def plot_learning_curves(models_history, model_names, title):
    plt.figure(figsize=(10, 6), dpi=100)
    
    # 使用更精致的颜色方案
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
    
    for i, history in enumerate(models_history):
        # 设置线条样式和粗细
        linewidth = 2 if i == 0 else 1.5
        linestyle = '-' if i < 2 else '--'
        color = colors[i % len(colors)]
        
        plt.plot(history, label=model_names[i], linewidth=linewidth, 
                 linestyle=linestyle, color=color, alpha=0.8)
    
    # 设置标题样式
    plt.title(title, fontsize=16, fontweight='bold', pad=20)
    
    # 设置坐标轴标签样式
    plt.xlabel('Iterations', fontsize=12, labelpad=10)
    plt.ylabel('Cost', fontsize=12, labelpad=10)
    
    # 优化图例位置和样式
    plt.legend(fontsize=10, loc='best', frameon=True, framealpha=0.9, shadow=True)
    
    # 优化网格线
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # 优化布局
    plt.tight_layout(pad=3.0)
    
    # 保存高质量图片
    plt.savefig(f"{title.replace(' ', '_')}.png", dpi=300, bbox_inches='tight')
    plt.show()

# 绘制预测结果对比
def plot_predictions(y_true, y_preds, model_names, title):
    plt.figure(figsize=(12, 6), dpi=100)
    
    # 排序以便更好地可视化
    sorted_indices = np.argsort(y_true.flatten())
    y_true_sorted = y_true[sorted_indices]
    
    # 设置真实值线条样式
    plt.plot(y_true_sorted, 'b-', label='True Values', linewidth=2.5, alpha=0.9)
    
    # 使用更精致的颜色方案
    colors = ['#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
    linestyles = ['--', '-.', ':', (0, (5, 5)), (0, (3, 5, 1, 5))]
    
    for i, y_pred in enumerate(y_preds):
        y_pred_sorted = y_pred[sorted_indices]
        color = colors[i % len(colors)]
        linestyle = linestyles[i % len(linestyles)]
        
        plt.plot(y_pred_sorted, linestyle=linestyle, label=f'{model_names[i]} Predictions',
                 linewidth=1.8, color=color, alpha=0.8)
    
    # 设置标题样式
    plt.title(title, fontsize=16, fontweight='bold', pad=20)
    
    # 设置坐标轴标签样式
    plt.xlabel('Samples', fontsize=12, labelpad=10)
    plt.ylabel('House Price', fontsize=12, labelpad=10)
    
    # 优化图例位置和样式
    plt.legend(fontsize=10, loc='best', frameon=True, framealpha=0.9, shadow=True)
    
    # 优化网格线
    plt.grid(True, linestyle='--', alpha=0.7)
    
    # 优化布局
    plt.tight_layout(pad=3.0)
    
    # 保存高质量图片
    plt.savefig(f"{title.replace(' ', '_')}.png", dpi=300, bbox_inches='tight')
    plt.show()

# 绘制系数对比
def plot_coefficients(models, feature_names, title):
    plt.figure(figsize=(14, 8), dpi=100)
    
    # 获取所有模型的系数
    coeffs = []
    for model in models:
        if hasattr(model, 'weights'):
            # 自定义模型，跳过偏置项
            coeffs.append(model.weights[1:].flatten())
        else:
            # sklearn模型
            coeffs.append(model.coef_.flatten())
    
    # 使用更精致的颜色方案
    colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd']
    
    # 调整条形宽度
    n_models = len(models)
    width = 0.8 / n_models
    x = np.arange(len(feature_names))
    
    # 绘制条形图并添加数据标签
    for i, (coef, model_name) in enumerate(zip(coeffs, model_names)):
        bars = plt.bar(x + i*width - width*(n_models-1)/2, coef, width,
                      label=model_name, color=colors[i % len(colors)], alpha=0.8)
        
        # 为每个条形添加数值标签
        for bar in bars:
            height = bar.get_height()
            if abs(height) > 0.05:  # 只对显著的系数添加标签
                plt.text(bar.get_x() + bar.get_width()/2., height,
                        '{:.2f}'.format(height),
                        ha='center', va='bottom' if height > 0 else 'top',
                        fontsize=8, rotation=90)
    
    # 添加水平零线
    plt.axhline(y=0, color='gray', linestyle='-', linewidth=1)
    
    # 设置标题样式
    plt.title(title, fontsize=16, fontweight='bold', pad=20)
    
    # 设置坐标轴标签样式
    plt.xlabel('Features', fontsize=12, labelpad=10)
    plt.ylabel('Coefficient Value', fontsize=12, labelpad=10)
    
    # 优化特征名称显示
    plt.xticks(x, feature_names, rotation=45, ha='right', fontsize=10)
    
    # 优化图例位置和样式
    plt.legend(fontsize=10, loc='best', frameon=True, framealpha=0.9, shadow=True)
    
    # 优化y轴网格线
    plt.grid(True, axis='y', linestyle='--', alpha=0.7)
    
    # 优化布局
    plt.tight_layout(pad=3.0)
    
    # 保存高质量图片
    plt.savefig(f"{title.replace(' ', '_')}.png", dpi=300, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    # 加载数据
    X, y = load_data('boston.csv')
    
    # 获取特征名称
    feature_names = pd.read_csv('boston.csv').columns[:-1].tolist()
    
    # 划分训练集和测试集
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 归一化数据
    X_train_norm, mean, std = normalize_data(X_train)
    X_test_norm = (X_test - mean) / std
    
    print("=== 实验1: 原始数据 vs 归一化数据 ===")
    
    # 使用原始数据的BGD
    print("\n使用原始数据:")
    bgd_raw = LinearRegressionBGD(learning_rate=0.000001, max_iterations=1000)
    bgd_raw.fit(X_train, y_train)
    y_pred_bgd_raw = bgd_raw.predict(X_test)
    evaluate_model(y_test, y_pred_bgd_raw, "BGD (原始数据)")
    
    # 使用归一化数据的BGD
    print("\n使用归一化数据:")
    bgd_norm = LinearRegressionBGD(learning_rate=0.01, max_iterations=1000)
    bgd_norm.fit(X_train_norm, y_train)
    y_pred_bgd_norm = bgd_norm.predict(X_test_norm)
    evaluate_model(y_test, y_pred_bgd_norm, "BGD (归一化数据)")
    
    # 绘制学习曲线对比
    plot_learning_curves(
        [bgd_raw.cost_history, bgd_norm.cost_history],
        ["BGD (原始数据)", "BGD (归一化数据)"],
        "原始数据 vs 归一化数据的学习曲线"
    )
    
    # 绘制预测结果对比
    plot_predictions(
        y_test,
        [y_pred_bgd_raw, y_pred_bgd_norm],
        ["BGD (原始数据)", "BGD (归一化数据)"],
        "原始数据 vs 归一化数据的预测结果"
    )
    
    print("\n=== 实验2: BGD vs SGD ===")
    
    # 使用归一化数据的BGD
    bgd = LinearRegressionBGD(learning_rate=0.01, max_iterations=1000)
    bgd.fit(X_train_norm, y_train)
    y_pred_bgd = bgd.predict(X_test_norm)
    evaluate_model(y_test, y_pred_bgd, "BGD")
    
    # 使用归一化数据的SGD
    sgd = LinearRegressionSGD(learning_rate=0.001, max_iterations=50)
    sgd.fit(X_train_norm, y_train)
    y_pred_sgd = sgd.predict(X_test_norm)
    evaluate_model(y_test, y_pred_sgd, "SGD")
    
    # 绘制学习曲线对比
    plot_learning_curves(
        [bgd.cost_history, sgd.cost_history],
        ["BGD", "SGD"],
        "BGD vs SGD 学习曲线"
    )
    
    # 绘制预测结果对比
    plot_predictions(
        y_test,
        [y_pred_bgd, y_pred_sgd],
        ["BGD", "SGD"],
        "BGD vs SGD 预测结果"
    )
    
    print("\n=== 实验3: 线性回归 vs 岭回归 vs LASSO回归 ===")
    
    # 使用归一化数据的SGD线性回归
    sgd_linear = LinearRegressionSGD(learning_rate=0.001, max_iterations=50)
    sgd_linear.fit(X_train_norm, y_train)
    y_pred_sgd_linear = sgd_linear.predict(X_test_norm)
    evaluate_model(y_test, y_pred_sgd_linear, "线性回归 (SGD)")
    
    # 岭回归
    ridge = Ridge(alpha=1.0)
    ridge.fit(X_train_norm, y_train)
    y_pred_ridge = ridge.predict(X_test_norm)
    evaluate_model(y_test, y_pred_ridge, "岭回归")
    
    # LASSO回归
    lasso = Lasso(alpha=0.1)
    lasso.fit(X_train_norm, y_train)
    y_pred_lasso = lasso.predict(X_test_norm)
    evaluate_model(y_test, y_pred_lasso, "LASSO回归")
    
    # 绘制预测结果对比
    plot_predictions(
        y_test,
        [y_pred_sgd_linear, y_pred_ridge, y_pred_lasso],
        ["线性回归 (SGD)", "岭回归", "LASSO回归"],
        "线性回归 vs 岭回归 vs LASSO回归 预测结果"
    )
    
    # 绘制系数对比
    model_names = ["线性回归 (SGD)", "岭回归", "LASSO回归"]
    models = [sgd_linear, ridge, lasso]
    plot_coefficients(models, feature_names, "线性回归 vs 岭回归 vs LASSO回归 系数对比")
    
    print("\n所有实验完成，结果已保存为图片。")