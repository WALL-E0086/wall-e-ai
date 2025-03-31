from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
from docx import Document
import json
from zhipu_endpoints import zhipu_bp

app = Flask(__name__, static_folder='.')
CORS(app)  # 允许跨域请求

# 注册智谱API Blueprint
app.register_blueprint(zhipu_bp)

# 提供静态文件
@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def static_files(path):
    return send_from_directory('.', path)

# 处理文档上传
@app.route('/api/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({'error': '没有文件部分'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': '没有选择文件'}), 400
    
    # 检查文件扩展名
    if file and allowed_file(file.filename):
        try:
            # 创建临时文件
            with tempfile.NamedTemporaryFile(delete=False) as temp:
                file.save(temp.name)
                
                # 处理文件内容
                content = process_file(temp.name, file.filename)
                
                # 删除临时文件
                os.unlink(temp.name)
                
                return jsonify({'content': content})
                
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': '不支持的文件类型'}), 400

# 添加健康检查接口
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok", 
        "message": "服务正常运行"
    })

# 检查允许的文件类型
def allowed_file(filename):
    allowed_extensions = {'txt', 'pdf', 'doc', 'docx'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_extensions

# 处理不同类型的文件
def process_file(file_path, filename):
    ext = filename.rsplit('.', 1)[1].lower()
    
    if ext == 'txt':
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    elif ext == 'docx':
        return read_docx(file_path)
    
    elif ext == 'doc':
        return "目前不支持旧版Word文档(.doc)格式，请转换为.docx格式后再上传。"
    
    elif ext == 'pdf':
        return "目前不支持PDF文件解析，请将内容转换为Word或文本格式后再上传。"
    
    return "不支持的文件类型"

# 读取Word文档内容
def read_docx(file_path):
    try:
        doc = Document(file_path)
        full_text = []
        
        for para in doc.paragraphs:
            if para.text.strip():  # 只处理非空段落
                full_text.append(para.text)
        
        return '\n'.join(full_text)
    except Exception as e:
        raise Exception(f"读取Word文档时出错：{str(e)}")

if __name__ == '__main__':
    # 从环境变量获取API密钥
    api_key = os.getenv("ZHIPU_API_KEY")
    if not api_key:
        print("警告：未设置ZHIPU_API_KEY环境变量，智谱API功能将不可用")
    
    # 添加代理检测
    http_proxy = os.getenv("HTTP_PROXY")
    if http_proxy:
        print(f"注意：检测到HTTP代理设置: {http_proxy}")
    
    # 允许从所有IP访问，包括局域网和国外节点
    print("服务器启动在: http://localhost:5000 和 http://127.0.0.1:5000")
    print("您也可以通过本机IP地址访问，例如局域网内其他设备")
    # 启动应用，允许所有主机访问
    app.run(debug=True, host='0.0.0.0') 