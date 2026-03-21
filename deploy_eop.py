import os
import subprocess
import sys

# 设置环境变量
os.environ['EDGEONE_PAGES_PROJECT_NAME'] = 'dlt-analysis'

# 打印环境变量以确认
print(f"环境变量已设置: {os.environ.get('EDGEONE_PAGES_PROJECT_NAME')}")

# 准备部署参数
params = {
    "builtFolderPath": "d:/daletgou/dlt4/deploy",
    "workspacePath": "d:/daletgou/dlt4",
    "projectType": "static"
}

print("准备部署到EdgeOne Pages...")
print(f"参数: {params}")