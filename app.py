from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
from docx import Document
import json

app = Flask(__name__, static_folder='.')
CORS(app)  # 允许跨域请求

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
    app.run(debug=True) 