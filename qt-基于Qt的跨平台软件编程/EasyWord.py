#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EasyWord - 简化版 Word 编辑器
基于 PyQt6 的跨平台文字处理软件

本程序使用 QMainWindow 作为主窗口框架，
实现了文字输入、格式设定、文字编辑等核心功能。
"""

import sys
import os

# ==================== PyQt6 模块导入 ====================
# QtWidgets 包含所有界面控件，如窗口、按钮、文本框等
from PyQt6.QtWidgets import (
    QApplication, QMainWindow, QTextEdit, QFileDialog, QMessageBox,
    QToolBar, QFontComboBox, QColorDialog, QLabel, QStatusBar,
    QSpinBox, QPushButton, QMenuBar, QMenu
)
# QtGui 包含图形相关的类，如字体、颜色、图标、快捷键等
from PyQt6.QtGui import (
    QAction, QFont, QColor, QTextCharFormat, QKeySequence
)
# QtCore 包含核心非 GUI 功能，如信号与槽、枚举值、尺寸等
from PyQt6.QtCore import Qt, QSize


class EasyWord(QMainWindow):
    """
    EasyWord 主窗口类，继承自 QMainWindow
    
    QMainWindow 是 Qt 提供的标准主窗口类，包含：
    - 菜单栏（MenuBar）
    - 工具栏（ToolBar）
    - 中央部件（CentralWidget）
    - 状态栏（StatusBar）
    - 停靠窗口（DockWidget）
    """

    def __init__(self):
        """构造函数，初始化窗口和界面"""
        super().__init__()  # 调用父类 QMainWindow 的构造函数
        
        self.current_file = None  # 记录当前打开的文件路径
        self.setWindowTitle("EasyWord - 未命名")  # 设置窗口标题
        self.setGeometry(100, 100, 1200, 800)  # 设置窗口位置和大小 (x, y, width, height)
        
        # ==================== 中央文本编辑区 ====================
        # QTextEdit 是 Qt 提供的富文本编辑控件
        # 它支持：纯文本/富文本输入、撤销重做、复制粘贴、字体格式等
        self.editor = QTextEdit()
        self.editor.setAcceptRichText(True)  # 允许接收富文本（HTML格式）
        
        # 信号与槽（Signal & Slot）是 Qt 的核心机制
        # 当编辑器中的字符格式改变时，自动触发 update_format_ui 方法更新工具栏状态
        self.editor.currentCharFormatChanged.connect(self.update_format_ui)
        # 当光标位置改变时，更新状态栏显示的行号和列号
        self.editor.cursorPositionChanged.connect(self.update_status_bar)
        
        # 将编辑器设置为中央部件，占据窗口的主要区域
        self.setCentralWidget(self.editor)
        
        # ==================== 初始化界面组件 ====================
        self.create_menu()      # 创建菜单栏
        self.create_toolbar()   # 创建工具栏
        self.create_statusbar() # 创建状态栏
        
        # 设置默认字体：宋体，12号
        default_font = QFont("宋体", 12)
        self.editor.setFont(default_font)
        
        # 文档是否已修改的标志，用于关闭时提示保存
        self.document_modified = False
        # 文本改变时设置修改标志并更新字数统计
        self.editor.textChanged.connect(self.on_text_changed)
        
    def on_text_changed(self):
        """
        文档修改状态处理
        当文本内容发生变化时，更新字数统计，并在标题栏前添加 * 标记
        """
        self.document_modified = True
        self.update_status_bar()  # 更新字数统计
        title = self.windowTitle()
        if not title.startswith("*"):
            self.setWindowTitle("*" + title)
    
    def mark_saved(self, filepath=None):
        """
        标记文档已保存
        
        参数:
            filepath: 保存的文件路径，为 None 表示新建文档
        """
        self.document_modified = False
        self.current_file = filepath
        if filepath:
            filename = os.path.basename(filepath)
            self.setWindowTitle(f"EasyWord - {filename}")
        else:
            self.setWindowTitle("EasyWord - 未命名")
    
    # ==================== 菜单栏创建 ====================
    def create_menu(self):
        """
        创建菜单栏
        
        QMainWindow 的 menuBar() 方法返回菜单栏对象，
        通过 addMenu() 添加一级菜单，通过 addAction() 添加菜单项。
        
        &F 这样的标记表示 Alt+F 快捷键，括号内的字母会显示下划线。
        """
        menubar = self.menuBar()
        
        # ---------- 文件菜单 ----------
        file_menu = menubar.addMenu("文件(&F)")
        
        # 新建：创建空白文档
        new_action = QAction("新建(&N)", self)
        # QKeySequence.StandardKey.New 对应系统标准快捷键 Ctrl+N
        new_action.setShortcut(QKeySequence.StandardKey.New)
        # triggered 信号在用户触发该动作时发射，连接到 new_document 槽函数
        new_action.triggered.connect(self.new_document)
        file_menu.addAction(new_action)
        
        # 打开：打开已有文件
        open_action = QAction("打开(&O)...", self)
        open_action.setShortcut(QKeySequence.StandardKey.Open)
        open_action.triggered.connect(self.open_document)
        file_menu.addAction(open_action)
        
        # 保存：保存当前文档
        save_action = QAction("保存(&S)", self)
        save_action.setShortcut(QKeySequence.StandardKey.Save)
        save_action.triggered.connect(self.save_document)
        file_menu.addAction(save_action)
        
        # 另存为：用新文件名保存
        save_as_action = QAction("另存为(&A)...", self)
        save_as_action.setShortcut(QKeySequence.StandardKey.SaveAs)
        save_as_action.triggered.connect(self.save_as_document)
        file_menu.addAction(save_as_action)
        
        # 添加分隔线
        file_menu.addSeparator()
        
        # 退出：关闭应用程序
        exit_action = QAction("退出(&X)", self)
        exit_action.setShortcut(QKeySequence.StandardKey.Quit)
        exit_action.triggered.connect(self.close)
        file_menu.addAction(exit_action)
        
        # ---------- 编辑菜单 ----------
        edit_menu = menubar.addMenu("编辑(&E)")
        
        # 撤销：撤销上一步操作
        undo_action = QAction("撤销(&U)", self)
        undo_action.setShortcut(QKeySequence.StandardKey.Undo)
        undo_action.triggered.connect(self.editor.undo)
        edit_menu.addAction(undo_action)
        
        # 重做：恢复被撤销的操作
        redo_action = QAction("重做(&R)", self)
        redo_action.setShortcut(QKeySequence.StandardKey.Redo)
        redo_action.triggered.connect(self.editor.redo)
        edit_menu.addAction(redo_action)
        
        edit_menu.addSeparator()
        
        # 剪切：剪切选中文本到剪贴板
        cut_action = QAction("剪切(&T)", self)
        cut_action.setShortcut(QKeySequence.StandardKey.Cut)
        cut_action.triggered.connect(self.editor.cut)
        edit_menu.addAction(cut_action)
        
        # 复制：复制选中文本到剪贴板
        copy_action = QAction("复制(&C)", self)
        copy_action.setShortcut(QKeySequence.StandardKey.Copy)
        copy_action.triggered.connect(self.editor.copy)
        edit_menu.addAction(copy_action)
        
        # 粘贴：从剪贴板粘贴文本
        paste_action = QAction("粘贴(&P)", self)
        paste_action.setShortcut(QKeySequence.StandardKey.Paste)
        paste_action.triggered.connect(self.editor.paste)
        edit_menu.addAction(paste_action)
        
        # 全选：选中所有文本
        select_all_action = QAction("全选(&A)", self)
        select_all_action.setShortcut(QKeySequence.StandardKey.SelectAll)
        select_all_action.triggered.connect(self.editor.selectAll)
        edit_menu.addAction(select_all_action)
        
        # ---------- 格式菜单 ----------
        format_menu = menubar.addMenu("格式(&O)")
        
        # 加粗：设置/取消粗体
        bold_action = QAction("加粗(&B)", self)
        bold_action.setShortcut(QKeySequence.StandardKey.Bold)
        bold_action.setCheckable(True)  # 设置为可勾选状态，显示当前是否加粗
        bold_action.triggered.connect(self.toggle_bold)
        format_menu.addAction(bold_action)
        self.bold_action = bold_action  # 保存引用，用于后续同步状态
        
        # 斜体：设置/取消斜体
        italic_action = QAction("斜体(&I)", self)
        italic_action.setShortcut(QKeySequence.StandardKey.Italic)
        italic_action.setCheckable(True)
        italic_action.triggered.connect(self.toggle_italic)
        format_menu.addAction(italic_action)
        self.italic_action = italic_action
        
        # 下划线：设置/取消下划线
        underline_action = QAction("下划线(&U)", self)
        underline_action.setShortcut(QKeySequence.StandardKey.Underline)
        underline_action.setCheckable(True)
        underline_action.triggered.connect(self.toggle_underline)
        format_menu.addAction(underline_action)
        self.underline_action = underline_action
        
        format_menu.addSeparator()
        
        # 字体颜色：弹出颜色选择对话框
        font_color_action = QAction("字体颜色...", self)
        font_color_action.triggered.connect(self.set_font_color)
        format_menu.addAction(font_color_action)
        
        # 高亮颜色：设置文字背景色
        bg_color_action = QAction("高亮颜色...", self)
        bg_color_action.triggered.connect(self.set_bg_color)
        format_menu.addAction(bg_color_action)
        
        # ---------- 帮助菜单 ----------
        help_menu = menubar.addMenu("帮助(&H)")
        about_action = QAction("关于(&A)", self)
        about_action.triggered.connect(self.show_about)
        help_menu.addAction(about_action)
    
    # ==================== 工具栏创建 ====================
    def create_toolbar(self):
        """
        创建工具栏
        
        工具栏将常用功能以按钮形式展示，方便用户快速操作。
        QToolBar 可以放置在窗口的顶部、底部、左侧或右侧。
        setMovable(False) 禁止用户拖动工具栏位置。
        """
        toolbar = QToolBar("格式工具栏")
        toolbar.setMovable(False)
        # 设置图标尺寸，减小默认占位
        toolbar.setIconSize(QSize(16, 16))
        self.addToolBar(toolbar)
        
        # ---------- 文件操作按钮 ----------
        new_btn = QPushButton("新建")
        new_btn.setToolTip("新建文档 (Ctrl+N)")
        new_btn.setFixedWidth(45)
        new_btn.clicked.connect(self.new_document)
        toolbar.addWidget(new_btn)
        
        open_btn = QPushButton("打开")
        open_btn.setToolTip("打开文档 (Ctrl+O)")
        open_btn.setFixedWidth(45)
        open_btn.clicked.connect(self.open_document)
        toolbar.addWidget(open_btn)
        
        save_btn = QPushButton("保存")
        save_btn.setToolTip("保存文档 (Ctrl+S)")
        save_btn.setFixedWidth(45)
        save_btn.clicked.connect(self.save_document)
        toolbar.addWidget(save_btn)
        
        toolbar.addSeparator()
        
        # ---------- 撤销/重做按钮 ----------
        undo_btn = QPushButton("撤销")
        undo_btn.setToolTip("撤销 (Ctrl+Z)")
        undo_btn.setFixedWidth(45)
        undo_btn.clicked.connect(self.editor.undo)
        toolbar.addWidget(undo_btn)
        
        redo_btn = QPushButton("重做")
        redo_btn.setToolTip("重做 (Ctrl+Y)")
        redo_btn.setFixedWidth(45)
        redo_btn.clicked.connect(self.editor.redo)
        toolbar.addWidget(redo_btn)
        
        toolbar.addSeparator()
        
        # ---------- 剪切/复制/粘贴按钮 ----------
        cut_btn = QPushButton("剪切")
        cut_btn.setToolTip("剪切 (Ctrl+X)")
        cut_btn.setFixedWidth(45)
        cut_btn.clicked.connect(self.editor.cut)
        toolbar.addWidget(cut_btn)
        
        copy_btn = QPushButton("复制")
        copy_btn.setToolTip("复制 (Ctrl+C)")
        copy_btn.setFixedWidth(45)
        copy_btn.clicked.connect(self.editor.copy)
        toolbar.addWidget(copy_btn)
        
        paste_btn = QPushButton("粘贴")
        paste_btn.setToolTip("粘贴 (Ctrl+V)")
        paste_btn.setFixedWidth(45)
        paste_btn.clicked.connect(self.editor.paste)
        toolbar.addWidget(paste_btn)
        
        toolbar.addSeparator()
        
        # ---------- 字体选择 ----------
        font_label = QLabel("字体")
        toolbar.addWidget(font_label)
        
        self.font_combo = QFontComboBox()
        self.font_combo.setMinimumWidth(90)
        self.font_combo.setMaximumWidth(110)
        self.font_combo.currentFontChanged.connect(self.set_font_family)
        toolbar.addWidget(self.font_combo)
        
        size_label = QLabel("字号")
        toolbar.addWidget(size_label)
        
        self.size_spin = QSpinBox()
        self.size_spin.setRange(6, 72)
        self.size_spin.setValue(12)
        self.size_spin.setFixedWidth(50)
        self.size_spin.valueChanged.connect(self.set_font_size)
        toolbar.addWidget(self.size_spin)
        
        toolbar.addSeparator()
        
        # ---------- 格式按钮（加粗/斜体/下划线）----------
        self.bold_btn = QPushButton("B")
        self.bold_btn.setToolTip("加粗 (Ctrl+B)")
        self.bold_btn.setCheckable(True)
        self.bold_btn.setFixedWidth(28)
        bold_font = QFont()
        bold_font.setBold(True)
        self.bold_btn.setFont(bold_font)
        self.bold_btn.clicked.connect(self.toggle_bold)
        toolbar.addWidget(self.bold_btn)
        
        self.italic_btn = QPushButton("I")
        self.italic_btn.setToolTip("斜体 (Ctrl+I)")
        self.italic_btn.setCheckable(True)
        self.italic_btn.setFixedWidth(28)
        italic_font = QFont()
        italic_font.setItalic(True)
        self.italic_btn.setFont(italic_font)
        self.italic_btn.clicked.connect(self.toggle_italic)
        toolbar.addWidget(self.italic_btn)
        
        self.underline_btn = QPushButton("U")
        self.underline_btn.setToolTip("下划线 (Ctrl+U)")
        self.underline_btn.setCheckable(True)
        self.underline_btn.setFixedWidth(28)
        underline_font = QFont()
        underline_font.setUnderline(True)
        self.underline_btn.setFont(underline_font)
        self.underline_btn.clicked.connect(self.toggle_underline)
        toolbar.addWidget(self.underline_btn)
        
        toolbar.addSeparator()
        
        # ---------- 颜色按钮 ----------
        color_btn = QPushButton("A")
        color_btn.setToolTip("字体颜色")
        color_btn.setFixedWidth(28)
        color_btn.clicked.connect(self.set_font_color)
        toolbar.addWidget(color_btn)
        
        bg_btn = QPushButton("高亮")
        bg_btn.setToolTip("高亮颜色")
        bg_btn.setFixedWidth(45)
        bg_btn.clicked.connect(self.set_bg_color)
        toolbar.addWidget(bg_btn)
        
        toolbar.addSeparator()
        
        # ---------- 对齐按钮 ----------
        align_left_btn = QPushButton("左")
        align_left_btn.setToolTip("左对齐")
        align_left_btn.setFixedWidth(32)
        align_left_btn.clicked.connect(lambda: self.set_alignment(Qt.AlignmentFlag.AlignLeft))
        toolbar.addWidget(align_left_btn)
        
        align_center_btn = QPushButton("中")
        align_center_btn.setToolTip("居中对齐")
        align_center_btn.setFixedWidth(32)
        align_center_btn.clicked.connect(lambda: self.set_alignment(Qt.AlignmentFlag.AlignCenter))
        toolbar.addWidget(align_center_btn)
        
        align_right_btn = QPushButton("右")
        align_right_btn.setToolTip("右对齐")
        align_right_btn.setFixedWidth(32)
        align_right_btn.clicked.connect(lambda: self.set_alignment(Qt.AlignmentFlag.AlignRight))
        toolbar.addWidget(align_right_btn)
        
        align_justify_btn = QPushButton("两")
        align_justify_btn.setToolTip("两端对齐")
        align_justify_btn.setFixedWidth(32)
        align_justify_btn.clicked.connect(lambda: self.set_alignment(Qt.AlignmentFlag.AlignJustify))
        toolbar.addWidget(align_justify_btn)
    
    # ==================== 状态栏创建 ====================
    def create_statusbar(self):
        """
        创建状态栏
        
        QStatusBar 位于窗口底部，用于显示提示信息和状态。
        addPermanentWidget 添加的部件会显示在状态栏右侧。
        """
        self.statusbar = QStatusBar()
        self.setStatusBar(self.statusbar)
        self.statusbar.showMessage("就绪")  # 默认显示"就绪"
        
        # 显示光标位置（行号, 列号）
        self.pos_label = QLabel("行 1, 列 1")
        self.statusbar.addPermanentWidget(self.pos_label)
        
        # 显示文档字数统计
        self.word_count_label = QLabel("字数: 0")
        self.statusbar.addPermanentWidget(self.word_count_label)
    
    def update_status_bar(self):
        """
        更新状态栏信息
        
        QTextCursor 表示文本光标，可以获取光标位置信息。
        block() 返回光标所在段落，blockNumber() 返回段落编号（从0开始）。
        columnNumber() 返回光标在段落中的列号（从0开始）。
        """
        cursor = self.editor.textCursor()
        block = cursor.block()
        line = block.blockNumber() + 1   # 转换为从1开始的行号
        col = cursor.columnNumber() + 1  # 转换为从1开始的列号
        self.pos_label.setText(f"行 {line}, 列 {col}")
        
        # 统计字数：去除空格和换行后计算字符数
        text = self.editor.toPlainText()
        word_count = len(text.replace(" ", "").replace("\n", ""))
        self.word_count_label.setText(f"字数: {word_count}")
    
    # ==================== 文件操作 ====================
    def new_document(self):
        """
        新建文档
        
        如果当前文档已修改，弹出对话框询问是否保存。
        QMessageBox.question 提供 Save(保存)、Discard(放弃)、Cancel(取消) 三个选项。
        """
        if self.document_modified:
            reply = QMessageBox.question(
                self, "保存更改",
                "文档已修改，是否保存？",
                QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel
            )
            if reply == QMessageBox.StandardButton.Save:
                if not self.save_document():
                    return  # 保存失败或取消，不执行新建
            elif reply == QMessageBox.StandardButton.Cancel:
                return  # 用户取消，不执行新建
        
        # 清空编辑器前先阻塞信号，避免 clear() 触发 textChanged 导致中间状态异常
        self.editor.blockSignals(True)
        self.editor.clear()
        self.editor.blockSignals(False)
        self.current_file = None
        self.mark_saved()
    
    def open_document(self):
        """
        打开文档
        
        QFileDialog.getOpenFileName 弹出文件选择对话框，
        返回用户选择的文件路径和过滤器。
        支持打开 HTML 和纯文本文件。
        """
        filepath, _ = QFileDialog.getOpenFileName(
            self, "打开文档", "",  # 父窗口, 对话框标题, 默认路径
            "HTML 文档 (*.html *.htm);;纯文本 (*.txt);;所有文件 (*.*)"  # 文件过滤器
        )
        if filepath:
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                # 加载内容前先阻塞信号，防止 setHtml/setPlainText 触发 textChanged
                # 导致文档被错误标记为"已修改"
                self.editor.blockSignals(True)
                try:
                    # 根据文件扩展名判断使用 HTML 还是纯文本加载
                    if filepath.endswith(('.html', '.htm')):
                        self.editor.setHtml(content)  # 以富文本方式加载
                    else:
                        self.editor.setPlainText(content)  # 以纯文本方式加载
                finally:
                    self.editor.blockSignals(False)
                self.mark_saved(filepath)
                self.statusbar.showMessage(f"已打开: {filepath}", 3000)  # 3000ms = 3秒
            except Exception as e:
                QMessageBox.critical(self, "错误", f"无法打开文件:\n{str(e)}")
    
    def save_document(self):
        """
        保存文档
        
        如果文档已有文件名（current_file 不为空），直接保存；
        否则调用另存为，让用户选择保存位置和文件名。
        """
        if self.current_file:
            return self.save_to_path(self.current_file)
        else:
            return self.save_as_document()
    
    def save_as_document(self):
        """
        另存为文档
        
        QFileDialog.getSaveFileName 弹出保存对话框，
        让用户选择保存路径和文件类型。
        """
        filepath, _ = QFileDialog.getSaveFileName(
            self, "保存文档", "",
            "HTML 文档 (*.html);;纯文本 (*.txt);;所有文件 (*.*)"
        )
        if filepath:
            return self.save_to_path(filepath)
        return False
    
    def save_to_path(self, filepath):
        """
        将文档内容保存到指定路径
        
        参数:
            filepath: 目标文件路径
            
        根据扩展名判断保存格式：
        - .txt 保存为纯文本
        - 其他保存为 HTML 富文本
        """
        try:
            if filepath.endswith('.txt'):
                content = self.editor.toPlainText()  # 提取纯文本内容
            else:
                content = self.editor.toHtml()  # 提取 HTML 富文本内容
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            self.mark_saved(filepath)
            self.statusbar.showMessage(f"已保存: {filepath}", 3000)
            return True
        except Exception as e:
            QMessageBox.critical(self, "错误", f"无法保存文件:\n{str(e)}")
            return False
    
    def closeEvent(self, event):
        """
        重写关闭事件
        
        当用户点击窗口关闭按钮时自动调用。
        如果文档有未保存的修改，弹出提示框询问是否保存。
        event.accept() 允许关闭，event.ignore() 阻止关闭。
        """
        if self.document_modified:
            reply = QMessageBox.question(
                self, "保存更改",
                "文档已修改，是否保存？",
                QMessageBox.StandardButton.Save | QMessageBox.StandardButton.Discard | QMessageBox.StandardButton.Cancel
            )
            if reply == QMessageBox.StandardButton.Save:
                if not self.save_document():
                    event.ignore()  # 保存失败，不关闭窗口
                    return
            elif reply == QMessageBox.StandardButton.Cancel:
                event.ignore()  # 用户取消，不关闭窗口
                return
        event.accept()  # 确认关闭窗口
    
    # ==================== 格式操作 ====================
    def set_font_family(self, font):
        """
        设置字体
        
        参数:
            font: QFont 对象，包含字体名称等信息
        """
        self.editor.setCurrentFont(font)
    
    def set_font_size(self, size):
        """
        设置字号
        
        参数:
            size: 整数，字号大小（磅）
        """
        self.editor.setFontPointSize(float(size))
    
    def toggle_bold(self):
        """
        切换加粗状态
        
        获取当前字符格式，判断是否已经加粗：
        - 如果已加粗，改为普通字重
        - 如果未加粗，改为粗体
        """
        fmt = self.editor.currentCharFormat()
        weight = QFont.Weight.Normal if fmt.fontWeight() == QFont.Weight.Bold else QFont.Weight.Bold
        self.editor.setFontWeight(weight)
        self.update_format_ui()
    
    def toggle_italic(self):
        """切换斜体状态"""
        self.editor.setFontItalic(not self.editor.currentCharFormat().fontItalic())
        self.update_format_ui()
    
    def toggle_underline(self):
        """切换下划线状态"""
        self.editor.setFontUnderline(not self.editor.currentCharFormat().fontUnderline())
        self.update_format_ui()
    
    def set_font_color(self):
        """
        设置字体颜色
        
        QColorDialog.getColor 弹出颜色选择对话框，
        用户选择颜色后，通过 setTextColor 应用到选中文本。
        """
        color = QColorDialog.getColor(self.editor.textColor(), self)
        if color.isValid():  # 确认用户选择了有效颜色（未点击取消）
            self.editor.setTextColor(color)
    
    def set_bg_color(self):
        """
        设置高亮（背景）颜色
        
        QTextCharFormat 用于描述字符的格式属性。
        mergeCurrentCharFormat 将新格式与当前格式合并，只修改背景色而不影响其他格式。
        """
        color = QColorDialog.getColor(Qt.GlobalColor.yellow, self)
        if color.isValid():
            fmt = QTextCharFormat()
            fmt.setBackground(color)  # 设置背景色
            self.editor.mergeCurrentCharFormat(fmt)
    
    def set_alignment(self, alignment):
        """
        设置段落对齐方式
        
        参数:
            alignment: Qt.AlignmentFlag 枚举值，如 AlignLeft, AlignCenter 等
        """
        self.editor.setAlignment(alignment)
    
    def update_format_ui(self):
        """
        更新格式工具栏的显示状态
        
        当光标移动或选中文本时，根据当前字符格式同步更新：
        - 加粗/斜体/下划线按钮的按下状态
        - 菜单项的勾选状态
        - 字体选择框的当前字体
        - 字号选择框的当前值
        
        这样可以确保工具栏始终反映光标所在位置的实际格式。
        """
        fmt = self.editor.currentCharFormat()
        
        # 同步按钮状态
        self.bold_btn.setChecked(fmt.fontWeight() == QFont.Weight.Bold)
        self.italic_btn.setChecked(fmt.fontItalic())
        self.underline_btn.setChecked(fmt.fontUnderline())
        
        # 同步菜单项状态
        self.bold_action.setChecked(fmt.fontWeight() == QFont.Weight.Bold)
        self.italic_action.setChecked(fmt.fontItalic())
        self.underline_action.setChecked(fmt.fontUnderline())
        
        # 同步字体和字号显示
        # 注意：更新控件前先 blockSignals，避免 setCurrentFont/setValue 触发信号
        # 导致 set_font_family/set_font_size 被调用，进而再次触发 currentCharFormatChanged
        # 形成循环调用。blockSignals 比 disconnect/connect 更安全可靠
        self.font_combo.blockSignals(True)
        self.size_spin.blockSignals(True)
        
        font = fmt.font()
        self.font_combo.setCurrentFont(font)
        self.size_spin.setValue(int(fmt.fontPointSize()) if fmt.fontPointSize() > 0 else 12)
        
        self.font_combo.blockSignals(False)
        self.size_spin.blockSignals(False)
    
    # ==================== 帮助 ====================
    def show_about(self):
        """显示关于对话框"""
        QMessageBox.about(
            self, "关于 EasyWord",
            "<h2>EasyWord 1.0</h2>"
            "<p>简化版 Word 编辑器</p>"
            "<p>基于 PyQt6 开发的跨平台文字处理软件</p>"
            "<p>功能包括：文字输入、格式设定（字体、字号、颜色、加粗、斜体、下划线）、"
            "文字编辑（复制、粘贴、撤销、重做）等。</p>"
        )


def main():
    """
    程序入口函数
    
    QApplication 是 Qt 应用程序的核心类，每个 Qt 程序必须有且只有一个。
    它负责管理应用程序的控制流和主要设置，处理事件循环。
    """
    app = QApplication(sys.argv)  # 创建应用实例，sys.argv 接收命令行参数
    app.setApplicationName("EasyWord")
    app.setApplicationVersion("1.0")
    
    # 设置应用样式为 Fusion，这是 Qt 提供的跨平台一致样式
    app.setStyle('Fusion')
    
    window = EasyWord()  # 创建主窗口实例
    window.show()        # 显示窗口
    
    # app.exec() 启动事件循环，等待用户交互
    # 事件循环会一直运行，直到用户关闭窗口，返回退出码
    sys.exit(app.exec())


# 当直接运行本文件时执行 main() 函数
# 当作为模块被导入时不执行
if __name__ == "__main__":
    main()
