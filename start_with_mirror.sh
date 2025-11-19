#!/bin/bash
# 使用 HuggingFace 镜像启动应用

echo "========================================"
echo "   旅游计划生成器 - 正在启动..."
echo "   使用 HuggingFace 镜像加速下载"
echo "========================================"
echo ""

# 设置 HuggingFace 镜像
export HF_ENDPOINT=https://hf-mirror.com

echo "已设置 HuggingFace 镜像: $HF_ENDPOINT"
echo "启动后请在浏览器中访问: http://localhost:5001"
echo "按 Ctrl+C 可以停止程序"
echo ""
echo "========================================"
echo ""

python app.py

