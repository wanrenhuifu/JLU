import cv2
import numpy as np
import os
import argparse
import logging
from typing import Optional

# 配置日志日志格式
logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

class AreaCalculator:
    """不规则形状面积计算器"""
    
    def __init__(self, scale_factor: float = 1.0):
        self.scale_factor = scale_factor

    def process_image(self, image_path: str, output_path: str) -> None:
        """处理单张图像并保存结果"""
        if not os.path.exists(image_path):
            logging.error(f"Image not found: {image_path}")
            return

        img_data = np.fromfile(image_path, dtype=np.uint8)
        img = cv2.imdecode(img_data, -1)
        if img is None:
            logging.error(f"Could not read image: {image_path}")
            return

        try:
            # 1 & 2. 灰度化与二值化分割
            thresh = self._preprocess(img)

            # 3. 形态学去噪和填充
            morph_img = self._morphology_operations(thresh)

            # 4. 轮廓提取
            max_contour = self._extract_largest_contour(morph_img)
            if max_contour is None:
                logging.warning(f"No valid contour found in {image_path}")
                return

            # 5 & 6. 像素面积与真实面积计算
            pixel_area = cv2.contourArea(max_contour)
            actual_area = pixel_area * self.scale_factor

            # 7 & 8. 在原图上填充轮廓、标注数值并保存图像
            self._visualize_and_save(img, max_contour, pixel_area, actual_area, output_path)

            # 9. 输出日志信息
            logging.info(f"--- Results for {os.path.basename(image_path)} ---")
            logging.info(f"Pixel Area : {pixel_area:.1f}")
            logging.info(f"Actual Area: {actual_area:.1f} (scale={self.scale_factor})")
            logging.info(f"Saved to   : {output_path}\n")

        except Exception as e:
            logging.error(f"Failed to process {image_path}: {e}")

    def _preprocess(self, img: np.ndarray) -> np.ndarray:
        """图像预处理：灰度化 + 降噪 + Otsu自适应二值化"""
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        # 使用 Otsu 自适应寻找阈值求解最佳二值化
        _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        
        # 智能背景反转校验（检查图像四个角背景，防止前背景倒置）
        corners = [int(thresh[0, 0]), int(thresh[0, -1]), 
                   int(thresh[-1, 0]), int(thresh[-1, -1])]
        if sum(corners) > 255 * 2: 
            thresh = cv2.bitwise_not(thresh)
            
        return thresh

    def _morphology_operations(self, thresh: np.ndarray) -> np.ndarray:
        """形态学操作：闭运算填补孔洞，开运算消除外侧噪点"""
        kernel = np.ones((7, 7), np.uint8)
        closing = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=5)
        opening = cv2.morphologyEx(closing, cv2.MORPH_OPEN, kernel, iterations=3)
        return opening

    def _extract_largest_contour(self, morph_img: np.ndarray) -> Optional[np.ndarray]:
        """提取图像中的最大外部轮廓"""
        contours, _ = cv2.findContours(morph_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return None
        return max(contours, key=cv2.contourArea)

    def _visualize_and_save(self, img: np.ndarray, contour: np.ndarray, 
                            pixel_area: float, actual_area: float, output_path: str) -> None:
        """渲染绘制并输出展示"""
        result_img = img.copy()
        overlay = result_img.copy()

        # 填充主轮廓并半透明混合叠加
        cv2.drawContours(overlay, [contour], -1, (0, 0, 255), thickness=cv2.FILLED)
        cv2.addWeighted(overlay, 0.4, result_img, 0.6, 0, result_img)
        
        # 描绘轮廓红边
        cv2.drawContours(result_img, [contour], -1, (0, 0, 255), 3)

        # 使用图像矩获取文字锚点（图形中心）
        M = cv2.moments(contour)
        if M["m00"] != 0:
            cX = int(M["m10"] / M["m00"])
            cY = int(M["m01"] / M["m00"])
        else:
            cX, cY = result_img.shape[1] // 2, result_img.shape[0] // 2
        
        # 响应式字体缩放
        h, w = result_img.shape[:2]
        font_scale = max(0.8, min(h, w) / 1000.0)
        thickness = max(2, int(font_scale * 2))

        # 文字排版
        text1 = f"Pixel Area: {pixel_area:.1f}"
        text2 = f"Actual Area: {actual_area:.1f}"
        
        (w1, h1), _ = cv2.getTextSize(text1, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        (w2, _), _ = cv2.getTextSize(text2, cv2.FONT_HERSHEY_SIMPLEX, font_scale, thickness)
        
        # 绘制具有居中效果的文字
        cv2.putText(result_img, text1, (cX - w1 // 2, cY), 
                    cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), thickness)
        cv2.putText(result_img, text2, (cX - w2 // 2, cY + h1 + 10), 
                    cv2.FONT_HERSHEY_SIMPLEX, font_scale, (0, 255, 0), thickness)

        _, ext = os.path.splitext(output_path)
        is_success, im_buf_arr = cv2.imencode(ext, result_img)
        if is_success:
            im_buf_arr.tofile(output_path)
        else:
            logging.error(f"Failed to save result to {output_path}")

def main():
    # 增加 argparse 解决参数灵活性问题
    parser = argparse.ArgumentParser(description="Irregular Shape Area Calculator")
    parser.add_argument('--scale', type=float, default=1.0, help='比例尺换算倍数 (缺省值: 1.0)')
    parser.add_argument('--images', nargs='+', default=['fig05.png', 'fig06.png'], help='指定输入图像路径列表')
    parser.add_argument('--out-dir', type=str, default=None, 
                        help='指定输出结果保存的目录。如果不指定，则默认保存在原图同一目录。')
    args = parser.parse_args()

    # 实例化类与执行
    base_dir = os.path.dirname(os.path.abspath(__file__))
    calculator = AreaCalculator(scale_factor=args.scale)
    
    for img_name in args.images:
        img_path = os.path.join(base_dir, img_name) if not os.path.isabs(img_name) else img_name
        
        filename, ext = os.path.splitext(os.path.basename(img_path))
        output_name = f"{filename}_result{ext}"
        
        output_dir = args.out_dir if args.out_dir else (os.path.dirname(img_path) if os.path.isabs(img_name) else base_dir)
        if args.out_dir and not os.path.exists(args.out_dir):
            os.makedirs(args.out_dir, exist_ok=True)
            
        out_path = os.path.join(output_dir, output_name)
        
        calculator.process_image(img_path, out_path)

if __name__ == "__main__":
    main()
