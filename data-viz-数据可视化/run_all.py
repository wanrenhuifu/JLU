import os
import subprocess
import sys

def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    outputs_dir = os.path.join(root_dir, 'outputs')
    
    tasks = [
        {
            "name": "Task 1 (Cell Counting)",
            "script": "solution.py",
            "out_dir": os.path.join(outputs_dir, "task1"),
            "cwd": os.path.join(root_dir, "task1")
        },
        {
            "name": "Task 2 (Hough Circle Detection)",
            "script": "task2.py",
            "out_dir": os.path.join(outputs_dir, "task2"),
            "cwd": os.path.join(root_dir, "task2")
        },
        {
            "name": "Task 3 (Area Calculation)",
            "script": "task3.py",
            "out_dir": os.path.join(outputs_dir, "task3"),
            "cwd": os.path.join(root_dir, "task3")
        },
        {
            "name": "Task 4 (Vanishing Point Detection)",
            "script": "task4.py",
            "out_dir": os.path.join(outputs_dir, "task4"),
            "cwd": os.path.join(root_dir, "task4")
        }
    ]
    
    print("=" * 50)
    print(">>> 开始执行数据可视化整合项目")
    print(f"--- 结果统一输出目录: {outputs_dir}")
    print("=" * 50)
    
    for task in tasks:
        print(f"\n---> 正在执行: {task['name']}...")
        os.makedirs(task["out_dir"], exist_ok=True)
        
        cmd = [
            sys.executable, 
            task["script"],
            "--out-dir", task["out_dir"]
        ]
        
        try:
            result = subprocess.run(cmd, cwd=task["cwd"], capture_output=True, text=True, check=True)
            print("[+] 执行成功!")
            if result.stdout.strip():
                for line in result.stdout.strip().split('\n'):
                    print(f"   {line}")
            if result.stderr.strip():
                for line in result.stderr.strip().split('\n'):
                    print(f"   {line}")
        except subprocess.CalledProcessError as e:
            print("[-] 执行失败!")
            print(f"--- 错误日志 ---\n{e.stderr}")
            print("----------------")
            
    print("\n" + "=" * 50)
    print("=== 所有任务执行完毕！")
    print(f"请前往 {outputs_dir} 查看最终生成的可视化结果。")
    print("=" * 50)

if __name__ == "__main__":
    main()
