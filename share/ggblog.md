# 博客搭建
## 技术栈
1. **GitBook**:
   - 用于生成和维护静态网站的工具。你使用了 `gitbook build` 来生成静态文件和 `gitbook serve` 来提供本地服务器支持。

2. **Nginx**:
   - 一个流行的高性能 web 服务器和反向代理服务器，用于部署和服务 GitBook 生成的静态文件。

3. **inotifywait**:
   - 监控文件系统事件的工具，使用 `inotifywait` 监控 Markdown 文件的变化，并在文件变化时自动执行 GitBook 构建。

4. **Systemd**:
   - 一个系统和服务管理器，用于管理和运行后台服务。你配置了 `gitbook-watch.service` 来后台运行脚本，自动检测文件变化并重建 GitBook。

5. **权限管理**:
   - 管理文件和目录的权限，确保 `gitbook` 和 `inotifywait` 具有适当的权限进行操作。

6. **Bash 脚本**:
   - 编写了 Bash 脚本来自动化文件监控和 GitBook 构建的流程。

7. **文件系统操作**:
   - 使用 `find` 命令和 `xargs` 处理和监控文件变化。


## 搭建过程
### 1. 设置 Nginx 反向代理
为了让 GitBook 更方便地通过域名访问，可以通过 Nginx 设置反向代理，将外部请求转发到 GitBook 的 321 端口。

#### 配置 Nginx
编辑 `/etc/nginx/sites-available/gitbook` 文件：

```bash
sudo vim /etc/nginx/sites-available/gitbook
```

添加以下内容，将 GitBook 端口反向代理到 80 端口（或者你想使用的端口）：

```nginx
server {
    listen 80;
    server_name your_domain;

    location / {
        proxy_pass http://localhost:4000;  # 将根路径的请求转发到本地的应用
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /github-webhook/ {
        proxy_pass http://localhost:8081;  # 将 /github-webhook/ 的请求转发到 Flask 应用
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 可以在这里添加其他 location 块
}
```

#### 启用 Nginx 配置
启用配置并重新启动 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/gitbook /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

既然你已经通过 `gitbook serve &` 在后台运行 GitBook，并且它默认在 4000 端口运行，接下来可以做一些优化，让它更好地与 GitHub 关联，并且长期稳定运行。

### 2. 使用 `systemd` 管理 GitBook 服务
为了确保 GitBook 在服务器重启后依然能够自动启动，你可以创建一个 `systemd` 服务来管理 GitBook。

#### 创建 `gitbook.service` 文件
在 `/etc/systemd/system/` 目录下创建一个 `gitbook.service` 文件：

```bash
sudo vim /etc/systemd/system/gitbook.service
```

文件内容如下：

```ini
[Unit]
Description=GitBook Service
After=network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/gitbook serve /path/to/your/gitbook --port 321
WorkingDirectory=/path/to/your/gitbook
Restart=always
User=youruser
Group=yourgroup

[Install]
WantedBy=multi-user.target
```

将 `/path/to/your/gitbook` 替换为 GitBook 项目路径，将 `youruser` 替换为你的服务器用户，`yourgroup` 替换为用户组。

#### 启动并启用服务
创建好服务文件后，运行以下命令启动并启用 GitBook 服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start gitbook
sudo systemctl enable gitbook
```

这将确保 GitBook 在服务器启动时自动运行，并且在任何情况下崩溃后会自动重启。

你可以通过 `systemd` 来管理这个监听和自动重新编译的脚本。具体步骤如下：

### 3. github-webhook
当然可以，以下是我们关于 GitHub Webhook 和 Flask 应用的整合过程的整理：

#### 创建 GitHub Webhook

- 在 GitHub 仓库中设置 webhook，指向你的服务器地址（如 `http://www.cnggboy.com/github-webhook/`）。
- 设置触发事件为 `pull_request`，确保每当 PR 被合并时发送 POST 请求。

#### 编写 Flask 应用

- 创建一个 Flask 应用，处理来自 GitHub 的 POST 请求。

```python
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/github-webhook/', methods=['POST'])
def github_webhook():
    if request.method == 'POST':
        event_type = request.headers.get('X-GitHub-Event')

        if event_type == 'pull_request':
            payload = request.json
            if payload.get('action') == 'closed' and payload.get('merged'):
                subprocess.run(['git', '-C', '/home/ubuntu/projects/ggcoding', 'pull'])
                subprocess.run(['sudo', 'systemctl', 'restart', 'gitbook'])
                return jsonify({'status': 'success', 'action': 'pull_request merged'}), 200
            else:
                return jsonify({'status': 'ignored', 'action': payload.get('action')}), 200
        else:
            return jsonify({'status': 'ignored', 'event': event_type}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8081)
```

#### 配置 Nginx 代理

- 在 Nginx 配置中，将请求转发到 Flask 应用：

```nginx
server {
    listen 80;
    server_name www.cnggboy.com;

    location /github-webhook/ {
        proxy_pass http://localhost:8081/github-webhook/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### 启动 Flask 应用

- 如果使用 `systemctl` 管理 Flask 应用，确保服务已启动并正常运行：

```bash
sudo systemctl start your_service_name
```

#### 测试 Webhook

- 使用 `curl` 命令模拟 GitHub 发来的 webhook 请求：

```bash
curl -X POST http://localhost:8081/github-webhook/ -H "Content-Type: application/json" -d '{"action": "closed", "pull_request": {"merged": true}}'
```

- 确保 Flask 应用能够正确响应请求并执行相应操作（如 `git pull` 和重启 GitBook）。

至此，我们已经将 GitHub Webhook 与 Flask 应用进行了整合，并成功实现了自动更新和重启 GitBook 的功能。