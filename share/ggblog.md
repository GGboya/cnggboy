# 博客所用技术栈

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
