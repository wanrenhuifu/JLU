import cv2
import numpy as np
import os
import argparse
import logging
from typing import List, Tuple, Optional

logging.basicConfig(level=logging.INFO, format='[%(levelname)s] %(message)s')

def detect_lines(img: np.ndarray) -> Tuple[List[Tuple[float, float, float, float, float]], List[Tuple[float, float, float, float, float]]]:
    """
    使用 Canny 和 Hough 变换检测车道线，并根据斜率分类为左右车道线。
    
    Args:
        img (np.ndarray): 原始输入图像。
        
    Returns:
        Tuple[List, List]: (left_lines, right_lines)，列表元素为 (slope, x1, y1, x2, y2)。
    """
    height, width = img.shape[:2]
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    edges = cv2.Canny(blur, 50, 150, apertureSize=3)
    
    # ROI mask (focusing on the lower portion of the image where road lines usually are)
    mask = np.zeros_like(edges)
    polygon = np.array([[
        (0, height),
        (width, height),
        (width, int(height * 0.4)),
        (0, int(height * 0.4))
    ]], np.int32)
    cv2.fillPoly(mask, polygon, 255)
    masked_edges = cv2.bitwise_and(edges, mask)
    
    lines = cv2.HoughLinesP(masked_edges, 1, np.pi/180, threshold=100, minLineLength=100, maxLineGap=50)
    if lines is None:
        logging.warning("No lines found with threshold=100. Trying with lower threshold=50.")
        lines = cv2.HoughLinesP(masked_edges, 1, np.pi/180, threshold=50, minLineLength=50, maxLineGap=20)
        
    left_lines = []
    right_lines = []
    
    if lines is None:
        return left_lines, right_lines

    for line in lines:
        x1, y1, x2, y2 = line[0]
        if x2 - x1 == 0:
            continue
        slope = (y2 - y1) / (x2 - x1)
        
        # Filter horizontal/vertical lines (0.3 ~ 16 degrees, 5.0 ~ 78 degrees)
        if abs(slope) < 0.3 or abs(slope) > 5.0:
            continue
            
        if slope < 0:
            left_lines.append((slope, x1, y1, x2, y2))
        else:
            right_lines.append((slope, x1, y1, x2, y2))
            
    return left_lines, right_lines

def calculate_intersections(left_lines: List, right_lines: List, width: int, height: int) -> np.ndarray:
    """
    计算所有左侧线段和右侧线段的交点集合。
    
    Args:
        left_lines (List): 左车道线集合。
        right_lines (List): 右车道线集合。
        width (int): 图像宽度，用于过滤交点。
        height (int): 图像高度，用于过滤交点。
        
    Returns:
        np.ndarray: Nx2 的交点数组。
    """
    intersections = []
    for l1 in left_lines:
        for l2 in right_lines:
            m1, x1_l, y1_l, _, _ = l1
            m2, x1_r, y1_r, _, _ = l2
            
            c1 = y1_l - m1 * x1_l
            c2 = y1_r - m2 * x1_r
            
            if abs(m1 - m2) > 0.05:
                x = (c2 - c1) / (m1 - m2)
                y = m1 * x + c1
                
                if 0 <= x <= width and 0 <= y <= height:
                    intersections.append([x, y])
                    
    return np.array(intersections, dtype=np.float32)

def cluster_vanishing_point(intersections: np.ndarray) -> Optional[Tuple[int, int]]:
    """
    使用 K-Means 对交点进行聚类，找到最密集的区域作为灭点。
    
    Args:
        intersections (np.ndarray): 候选交点数组。
        
    Returns:
        Optional[Tuple[int, int]]: 灭点的 (x, y) 坐标，如果没有交点返回 None。
    """
    if len(intersections) == 0:
        return None
        
    if len(intersections) >= 3:
        criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 10, 1.0)
        ret, label, center = cv2.kmeans(intersections, min(3, len(intersections)), None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
        counts = np.bincount(label.flatten())
        best_cluster_idx = np.argmax(counts)
        return (int(center[best_cluster_idx][0]), int(center[best_cluster_idx][1]))
    else:
        median_x = np.median(intersections[:, 0])
        median_y = np.median(intersections[:, 1])
        return (int(median_x), int(median_y))

def process_image(image_path: str, output_path: str) -> None:
    """
    处理输入图像，检测车道线和灭点并输出结果图像。
    
    Args:
        image_path (str): 图像输入路径。
        output_path (str): 图像输出路径。
    """
    if not os.path.exists(image_path):
        logging.error(f"Image not found: {image_path}")
        return

    # 支持中文路径的读取
    img_data = np.fromfile(image_path, dtype=np.uint8)
    img = cv2.imdecode(img_data, -1)
    if img is None:
        logging.error(f"Could not load image {image_path}")
        return
        
    height, width = img.shape[:2]
    
    left_lines, right_lines = detect_lines(img)
    if not left_lines and not right_lines:
        logging.warning(f"No lines found for {image_path}.")
        return

    intersections = calculate_intersections(left_lines, right_lines, width, height)
    vanishing_point = cluster_vanishing_point(intersections)
    
    if vanishing_point is None:
        logging.warning(f"No valid intersections found for {image_path}")
        return
        
    # Draw annotations
    result_img = img.copy()
    
    for m1, x1_l, y1_l, x2_l, y2_l in left_lines:
        cv2.line(result_img, (int(x1_l), int(y1_l)), vanishing_point, (0, 255, 0), 2)
        
    for m2, x1_r, y1_r, x2_r, y2_r in right_lines:
        cv2.line(result_img, (int(x1_r), int(y1_r)), vanishing_point, (0, 255, 0), 2)
        
    cv2.circle(result_img, vanishing_point, 15, (0, 0, 255), -1)
    
    # 支持中文路径的保存
    is_success, im_buf_arr = cv2.imencode(".png", result_img)
    if is_success:
        im_buf_arr.tofile(output_path)
        logging.info(f"Vanishing point for {os.path.basename(image_path)}: {vanishing_point}")
        logging.info(f"Saved result to {output_path}")
    else:
        logging.error(f"Failed to save result to {output_path}")

def main() -> None:
    parser = argparse.ArgumentParser(description="Vanishing Point Detector")
    parser.add_argument('--images', nargs='+', default=['Fig07.png', 'Fig08.png'], 
                        help='指定输入图像路径列表')
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
        
        process_image(img_path, output_path)

if __name__ == "__main__":
    main()
