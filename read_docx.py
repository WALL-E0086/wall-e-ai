from docx import Document
import os

def read_docx(file_path):
    try:
        # 打开Word文档
        doc = Document(file_path)
        
        # 读取所有段落
        print("文档内容：")
        print("-" * 50)
        for para in doc.paragraphs:
            if para.text.strip():  # 只打印非空段落
                print(para.text)
        
        print("-" * 50)
        
    except Exception as e:
        print(f"读取文档时出错：{str(e)}")

if __name__ == "__main__":
    # 文档路径
    docx_path = "项目1/人生故事工作流.docx"
    
    # 检查文件是否存在
    if os.path.exists(docx_path):
        read_docx(docx_path)
    else:
        print(f"文件不存在：{docx_path}") 