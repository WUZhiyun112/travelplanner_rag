from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import os
from dotenv import load_dotenv
from openai import OpenAI

# 加载环境变量
load_dotenv()

app = Flask(__name__)
CORS(app)

# 初始化DeepSeek客户端（兼容OpenAI SDK）
client = OpenAI(
    api_key=os.getenv('DEEPSEEK_API_KEY', 'sk-3c45d569fc5c443db9496a122cb8a7d9'),
    base_url="https://api.deepseek.com"
)

@app.route('/')
def index():
    """返回主页面"""
    return render_template('index.html')

@app.route('/api/generate-plan', methods=['POST'])
def generate_plan():
    """生成旅游计划的API端点"""
    try:
        data = request.json
        print(f"收到请求: {data}")  # 调试日志
        
        days = data.get('days', '')
        destination = data.get('destination', '')
        budget = data.get('budget', '')
        preferences = data.get('preferences', '')
        
        # 验证必填字段
        if not days or not destination:
            return jsonify({
                'success': False,
                'error': '请填写旅游天数和目的地'
            }), 400
        
        # 构建提示词
        prompt = f"""请为我制定一个详细的{days}天旅游计划，目的地是{destination}。

"""
        if budget:
            prompt += f"预算：{budget}\n\n"
        if preferences:
            prompt += f"兴趣偏好：{preferences}\n\n"
        
        prompt += """请按照以下格式提供详细的旅游计划：

## 旅游计划概览
- 目的地：[目的地名称]
- 旅游天数：[天数]
- 推荐季节：[最佳旅游时间]

## 每日详细行程

### 第1天：[日期/主题]
**上午：**
- [具体活动和时间]
- [景点名称和地址]

**下午：**
- [具体活动和时间]
- [景点名称和地址]

**晚上：**
- [具体活动和时间]
- [餐厅推荐]

**住宿推荐：**
- [酒店/民宿名称和价格范围]

**交通建议：**
- [交通方式和路线]

### 第2天：[日期/主题]
[按照相同格式继续...]

## 实用信息
- **当地交通：** [交通方式建议]
- **美食推荐：** [特色美食和餐厅]
- **注意事项：** [重要提示]
- **预算估算：** [每日/总预算建议]

请确保计划合理、详细，包含具体的景点、餐厅和活动建议。"""

        # 调用DeepSeek API
        print("正在调用DeepSeek API...")  # 调试日志
        try:
            response = client.chat.completions.create(
                model="deepseek-chat",
                messages=[
                    {
                        "role": "system",
                        "content": "你是一位专业的旅游规划师，擅长制定详细、实用的旅游计划。你的回答应该结构清晰、信息准确、建议合理。"
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000,
                timeout=60  # 设置60秒超时
            )
            
            plan = response.choices[0].message.content
            print("API调用成功，返回计划")  # 调试日志
            
            return jsonify({
                'success': True,
                'plan': plan
            })
        except Exception as api_error:
            print(f"API调用错误: {str(api_error)}")  # 调试日志
            raise api_error
        
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"错误详情: {error_detail}")  # 调试日志
        return jsonify({
            'success': False,
            'error': f'生成计划时出错：{str(e)}'
        }), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

