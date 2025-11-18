document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('travelForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = document.querySelector('.btn-text');
    const btnLoader = document.querySelector('.btn-loader');
    const resultContainer = document.getElementById('resultContainer');
    const errorContainer = document.getElementById('errorContainer');
    const planContent = document.getElementById('planContent');
    const copyBtn = document.getElementById('copyBtn');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // 隐藏之前的结果和错误
        resultContainer.style.display = 'none';
        errorContainer.style.display = 'none';
        
        // 获取表单数据
        const formData = {
            days: document.getElementById('days').value,
            destination: document.getElementById('destination').value,
            budget: document.getElementById('budget').value,
            preferences: document.getElementById('preferences').value
        };
        
        // 显示加载状态
        generateBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        
        try {
            // 设置超时（60秒）
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000);
            
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                // 显示结果
                planContent.textContent = data.plan;
                resultContainer.style.display = 'block';
                
                // 将markdown格式转换为HTML（简单处理）
                planContent.innerHTML = formatPlan(data.plan);
                
                // 滚动到结果区域
                resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                // 显示错误
                showError(data.error || '生成计划时出错，请稍后重试');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.name === 'AbortError') {
                showError('请求超时，请稍后重试。如果问题持续，请检查网络连接或API配置。');
            } else {
                showError('网络错误，请检查您的连接或API配置。错误详情：' + error.message);
            }
        } finally {
            // 恢复按钮状态
            generateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoader.style.display = 'none';
        }
    });

    // 复制功能
    copyBtn.addEventListener('click', function() {
        const text = planContent.textContent || planContent.innerText;
        navigator.clipboard.writeText(text).then(function() {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '已复制！';
            copyBtn.style.background = '#28a745';
            setTimeout(function() {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#6c757d';
            }, 2000);
        }).catch(function(err) {
            console.error('复制失败:', err);
            alert('复制失败，请手动选择文本复制');
        });
    });

    function showError(message) {
        errorContainer.style.display = 'block';
        errorContainer.querySelector('.error-message').textContent = message;
        errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function formatPlan(text) {
        // 简单的markdown到HTML转换
        let html = text;
        
        // 标题
        html = html.replace(/^## (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^### (.*$)/gim, '<h4>$1</h4>');
        
        // 粗体
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 列表项
        html = html.replace(/^\- (.*$)/gim, '<li>$1</li>');
        
        // 将连续的列表项包装在ul标签中
        html = html.replace(/(<li>.*<\/li>\n?)+/g, function(match) {
            return '<ul>' + match.replace(/\n/g, '') + '</ul>';
        });
        
        // 换行
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        
        return html;
    }
});

