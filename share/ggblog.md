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
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:321;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
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

### 3. 监听 .md 文件的变更
确保你已经有了用于监听 Markdown 文件变化并自动重新编译 GitBook 的 Bash 脚本（如你提供的脚本）。你可以将它保存在 `/home/ubuntu/projects/watch-and-build.sh` 中。

```bash
#!/bin/bash

WATCH_DIR="your-gitbook-path"

# 监控 Markdown 文件的变化，包括子目录中的文件
inotifywait -m -r -e modify,create,delete --format '%w%f' "${WATCH_DIR}" |
while read -r file; do
    # 如果变化的文件是 Markdown 文件
    if [[ "$file" == *.md ]]; then
        echo "Markdown file changed: $file, restarting GitBook service..."
        sudo systemctl restart gitbook
    fi
done

```

#### 创建 systemd 服务文件

创建一个新的 `systemd` 服务文件，比如 `/etc/systemd/system/gitbook-watch.service`，用于管理这个脚本。

```bash
sudo vim /etc/systemd/system/gitbook-watch.service
```

在文件中添加以下内容：

```ini
[Unit]
Description=Watch and Build GitBook
After=network.target

[Service]
ExecStart=/bin/bash /home/ubuntu/projects/watch-and-build.sh
Restart=always
User=ubuntu
Group=ubuntu

[Install]
WantedBy=multi-user.target
```

- `ExecStart`：指向你的脚本路径。
- `Restart=always`：确保脚本在崩溃或意外停止时会自动重启。
- `User` 和 `Group`：设置为运行服务的用户和用户组。

#### 启动并启用服务

接下来，运行以下命令来启动和启用服务：

```bash
sudo systemctl daemon-reload
sudo systemctl start gitbook-watch.service
sudo systemctl enable gitbook-watch.service
```

这将启动 `gitbook-watch` 服务，并在系统启动时自动启动该服务。

至此，一个简单的博客就搭建完毕了，后续将 github 关联起来即可。