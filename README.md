# 温柔群的知识库
## 协作开发规范
### commit
同学们写完笔记，需要把自己的 commit 合并成一个
举例说明：
```bash
$ git log --oneline
4ee51d6 docs(user): update user/README.md
176ba5d docs(user): update user/README.md
5e829f8 docs(user): add README.md for user
f40929f feat(user): add delete user function
fc70a21 feat(user): add create user function
7157e9e docs(docs): append test line 'update3' to README.md
5a26aa2 docs(docs): append test line 'update2' to README.md
55892fa docs(docs): append test line 'update1' to README.md
89651d4 docs(doc): add README.md
```
可以看到我们提交了 5 个 `commit`。
但是 5 个 `commit` 太多了，我们想将这些 `commit` 合并后再提交到 远端 `dev` 分⽀。
接着，我们合并所有 `commit`  。在上⼀步中，我们知道 `fc70a21`是 本地 `dev` 分⽀的第⼀个 `commit ID`
其父 `commit ID` 是 `7157e9e`，我们需要将`7157e9e`之前的所有分支进行合并，这时我们可以执行：
```bash
$ git rebase -i 7157e9e
```
执行命令后，我们会进⼊到⼀个交互界⾯，在该界面中，我们可以将需要合并的 4 个 `commit`，都执行
`squash` 操作

或者也可以每次执行如下的操作
```bash
git add .  // 添加文件
git commit --amend // 修改最后一次commit的信息
```

### push
同学们的笔记放在 dev 分支进行写作
记录完自己的笔记，一定要进行`rebase`
```bash
git pull --rebase origin dev
```
然后再 `push` 即可
