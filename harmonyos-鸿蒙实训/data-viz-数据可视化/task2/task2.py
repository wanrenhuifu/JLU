import cv2
import numpy as np
import os
import argparse
import logging
from typing import Optional, Tuple

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

def search_for_best_circle(blurred: np.ndarray, w: int, h: int, param2_start: int = 150) -> Optional[Tuple[int, int, int]]:
    """
    通过递减 param2 寻找霍夫圆检测中最佳的圆心和半径。
    
    Args:
        blurred (np.ndarray): 高斯模糊后的灰度图。
        w (int): 图像宽度。
        h (int): 图像高度。
        param2_start (int): 霍夫圆检测的起始 param2 阈值。
        
    Returns:
        Optional[Tuple[int, int, int]]: 返回最佳圆的 (x, y, r)，未找到返回 None。
    """
    best_circle = None
    for p2 in range(param2_start, 20, -5):
        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, dp=1.2, 
                                   minDist=min(w, h)//4, 
                                   param1=50, param2=p2, 
                                   minRadius=min(w, h)//10, maxRadius=min(w, h)//2)
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            # Prefer the circle with highest votes (circles[0])
            for (x, y, r) in circles:
                if 0 <= x - r and x + r <= w and 0 <= y - r and y + r <= h:
                    best_circle = (x, y, r)
                    break # Found the strongest valid circle in this param2
            if best_circle is not None:
                logging.info(f"Found best circle at param2={p2}: Center ({best_circle[0]}, {best_circle[1]}), Radius {best_circle[2]}")
                break
    
    # If entirely no valid circle, just take any strongest
    if best_circle is None:
        circles = cv2.HoughCircles(blurred, cv2.HOUGH_GRADIENT, dp=1.2, 
                                   minDist=min(w, h)//4, 
                                   param1=50, param2=50, 
                                   minRadius=min(w, h)//10, maxRadius=0)
        if circles is not None:
            circles = np.round(circles[0, :]).astype("int")
            best_circle = tuple(circles[0])
            logging.info(f"Found fallback circle: Center ({best_circle[0]}, {best_circle[1]}), Radius {best_circle[2]}")

    return best_circle

def process_image(image_path: str, output_path: str, param2_start: int = 150) -> None:
    """
    处理输入图像，寻找圆形并标注输出。
    
    Args:
        image_path (str): 输入图像路径。
        output_path (str): 输出图像路径。
        param2_start (int): 寻找圆的起始阈值参数。
    """
    if not os.path.exists(image_path):
        logging.error(f"Image not found: {image_path}")
        return

    img_data = np.fromfile(image_path, dtype=np.uint8)
    img = cv2.imdecode(img_data, -1)
    if img is None:
        logging.error(f"Could not read image: {image_path}")
        return

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 2)
    output = img.copy()

    h, w = img.shape[:2]
    best_circle = search_for_best_circle(blurred, w, h, param2_start)

    if best_circle is not None:
        x, y, r = best_circle
        cv2.circle(output, (x, y), r, (0, 255, 0), max(2, w//400))
        cv2.circle(output, (x, y), max(4, w//200), (0, 0, 255), -1)
        text = f"({x}, {y})"
        cv2.putText(output, text, (x - 40, y - 40), cv2.FONT_HERSHEY_SIMPLEX, 
                    max(0.6, w/800.0), (0, 0, 255), max(2, int(w/500.0)))
        logging.info(f"[{os.path.basename(image_path)}] FINAL Center: {text}, Radius: {r}")
    else:
        logging.warning(f"[{os.path.basename(image_path)}] NO CIRCLES FOUND AT ALL.")

    _, ext = os.path.splitext(output_path)
    is_success, im_buf_arr = cv2.imencode(ext, output)
    if is_success:
        im_buf_arr.tofile(output_path)
        logging.info(f"Saved result to {output_path}")
    else:
        logging.error(f"Failed to save result to {output_path}")

def main() -> None:
    parser = argparse.ArgumentParser(description="Hough Circle Detector")
    parser.add_argument('--images', nargs='+', default=['fig03.png', 'fig04.jpg'], 
                        help='指定输入图像路径列表')
    parser.add_argument('--param2', type=int, default=150, 
                        help='霍夫圆检测起始 param2 参数 (默认: 150)')
    parser.add_argument('--out-dir', type=str, default=None, 
                        help='指定输出结果保存的目录。如果不指定，则默认保存在原图同一目录。')
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))

    for img_name in args.images:
        img_path = os.path.join(base_dir, img_name) if not os.path.isabs(img_name) else img_name
        
        filename, ext = os.path.splitext(os.path.basename(img_path))
        output_name = f"{filename}_result{ext}"
        
        output_dir = args.out_dir if args.out_dir else (os.path.dirname(img_path) if os.path.isabs(img_name) else base_dir)
        if args.out_dir and not os.path.exists(args.out_dir):
            os.makedirs(args.out_dir, exist_ok=True)
            
        output_path = os.path.join(output_dir, output_name)
        
        # 兼容原有代码：对于 fig04，原本使用 param2=100
        p2 = 100 if 'fig04' in img_name and args.param2 == 150 else args.param2
        
        process_image(img_path, output_path, param2_start=p2)

if __name__ == "__main__":
    main()
