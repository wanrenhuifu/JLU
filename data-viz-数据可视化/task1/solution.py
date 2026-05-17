import cv2
import numpy as np
import os
import argparse
import logging
from typing import Optional

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

def determine_background_and_binarize(blurred: np.ndarray) -> np.ndarray:
    """
    通过 Otsu 阈值法计算二值化图像，并根据图像边缘自动判断前背景颜色。
    确保返回的二值图像中，目标物体为白色（255），背景为黑色（0）。

    Args:
        blurred (np.ndarray): 经过高斯模糊的灰度图像。

    Returns:
        np.ndarray: 处理后的二值化图像。
    """
    # calculate Otsu threshold
    ret, thresh = cv2.threshold(blurred, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Check borders to see if background is white or black
    borders = np.concatenate([thresh[0, :], thresh[-1, :], thresh[:, 0], thresh[:, -1]])
    
    # If most of the border is 255, then background is white (255), so cells are black (0).
    # findContours expects objects to be white (255) and background to be black (0).
    if np.mean(borders) > 127:
        # Invert so background is black (0) and cells are white (255)
        thresh = cv2.bitwise_not(thresh)
        
    return thresh

def process_image(img_path: str, output_path: str, min_area: float = 15.0) -> int:
    """
    处理输入图像，识别并计算细胞/颗粒的数量，同时将标注结果输出保存。

    Args:
        img_path (str): 输入图像的路径。
        output_path (str): 结果图像的保存路径。
        min_area (float): 过滤噪点的最小连通域面积阈值。

    Returns:
        int: 识别到的目标数量。若读取失败则返回 0。
    """
    logging.info(f"--- Processing {os.path.basename(img_path)} ---")
    if not os.path.exists(img_path):
        logging.error(f"Error: {img_path} not found.")
        return 0

    img_data = np.fromfile(img_path, dtype=np.uint8)
    image = cv2.imdecode(img_data, -1)
    if image is None:
        logging.error(f"Error: Could not read image at {img_path}.")
        return 0
    
    image_display = image.copy()
    
    # 1. 灰度化与高斯去噪
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 2. 二值化
    thresh = determine_background_and_binarize(blurred)
    
    # 3. 形态学去噪
    # 使用开运算(先腐蚀后膨胀)去除细小噪点，使用闭运算(先膨胀后腐蚀)填充孔洞
    kernel = np.ones((3, 3), np.uint8)
    opened = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)
    closed = cv2.morphologyEx(opened, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # 4. 轮廓检测
    contours, hierarchy = cv2.findContours(closed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # 5. 计数与标注
    count = 0
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if area > min_area:  # 过滤掉面积过小的噪点
            count += 1
            cv2.drawContours(image_display, [cnt], -1, (0, 0, 255), 2)
            M = cv2.moments(cnt)
            if M['m00'] != 0:
                cx = int(M['m10'] / M['m00'])
                cy = int(M['m01'] / M['m00'])
                cv2.putText(image_display, str(count), (cx, cy), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 0, 0), 1)
                
    _, ext = os.path.splitext(output_path)
    is_success, im_buf_arr = cv2.imencode(ext, image_display)
    if is_success:
        im_buf_arr.tofile(output_path)
        logging.info(f"Counted {count} cells. Saved result to {output_path}")
    else:
        logging.error(f"Failed to save result to {output_path}")
    return count

def main() -> None:
    parser = argparse.ArgumentParser(description="Image Cell Counter")
    parser.add_argument('--images', nargs='+', default=['fig01.jpg', 'fig02.jpg'], 
                        help='指定要处理的图像列表 (默认: fig01.jpg fig02.jpg)')
    parser.add_argument('--min-area', type=float, default=15.0, 
                        help='最小轮廓面积阈值，用于过滤噪点 (默认: 15.0)')
    parser.add_argument('--out-dir', type=str, default=None, 
                        help='指定输出结果保存的目录。如果不指定，则默认保存在原图同一目录。')
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    for img_name in args.images:
        img_path = os.path.join(base_dir, img_name) if not os.path.isabs(img_name) else img_name
        
        # 自动生成输出文件名
        filename, ext = os.path.splitext(os.path.basename(img_path))
        # 匹配原本的代码：fig01.jpg -> res_fig01.jpg
        output_name = f"res_{filename}{ext}"
        
        output_dir = args.out_dir if args.out_dir else (os.path.dirname(img_path) if os.path.isabs(img_name) else base_dir)
        if args.out_dir and not os.path.exists(args.out_dir):
            os.makedirs(args.out_dir, exist_ok=True)
            
        output_path = os.path.join(output_dir, output_name)
        
        process_image(img_path, output_path, min_area=args.min_area)

if __name__ == "__main__":
    main()
