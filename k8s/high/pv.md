# pv
## 思考题
1. HostPath 类型的 PV 要求节点上必须有相应的目录，如果这个目录不存在（比如忘记创建了）会怎么样呢？

会自动创建的

2. 你对使用 PV/PVC/StorageClass 这三个对象来分配存储的流程有什么看法？它们的抽象是好还是坏？

## 什么是 PersistentVolume
Pod 里的容器是由镜像产生的，而镜像文件本身是只读的，进程要读写磁盘只能用一个临时的存储空间，一旦 Pod 销毁，临时存储也就会立即回收释放，数据也就丢失了。为了保证即使 Pod 销毁后重建数据依然存在，我们就需要找出一个解决方案，让 Pod 用上真正的“虚拟盘”。怎么办呢？

其实，Kubernetes 的 Volume 对数据存储已经给出了一个很好的抽象，它只是定义了有这么一个“存储卷”，而这个“存储卷”是什么类型、有多大容量、怎么存储，我们都可以自由发挥。Pod 不需要关心那些专业、复杂的细节，只要设置好 volumeMounts，就可以把 Volume 加载进容器里使用。

所以，Kubernetes 就顺着 Volume 的概念，延伸出了 PersistentVolume 对象，它专门用来表示持久存储设备，但隐藏了存储的底层实现，我们只需要知道它能安全可靠地保管数据就可以了（由于 PersistentVolume 这个词很长，一般都把它简称为 PV）。

那么，集群里的 PV 都从哪里来呢？

`作为存储的抽象，PV 实际上就是一些存储设备、文件系统`，比如 Ceph、GlusterFS、NFS，甚至是本地磁盘，管理它们已经超出了 Kubernetes 的能力范围，所以，一般会由系统管理员单独维护，然后再在 Kubernetes 里创建对应的 PV。要注意的是，PV 属于集群的系统资源，是和 Node 平级的一种对象，Pod 对它没有管理权，只有使用权。
## 什么是 PersistentVolumeClaim/StorageClass
现在有了 PV，我们是不是可以直接在 Pod 里挂载使用了呢？还不行。因为不同存储设备的差异实在是太大了：有的速度快，有的速度慢；有的可以共享读写，有的只能独占读写；有的容量小，只有几百 MB，有的容量大到 TB、PB 级别……

这么多种存储设备，只用一个 PV 对象来管理还是有点太勉强了，不符合“单一职责”的原则，让 Pod 直接去选择 PV 也很不灵活。于是 Kubernetes 就又增加了两个新对象`PersistentVolumeClaim` 和 `StorageClass`，用的还是“中间层”的思想，把存储卷的分配管理过程再次细化。

我们看这两个新对象。PersistentVolumeClaim，简称 PVC，从名字上看比较好理解，就是用来向 Kubernetes 申请存储资源的。PVC 是给 Pod 使用的对象，它相当于是 Pod 的代理，代表 Pod 向系统申请 PV。一旦资源申请成功，Kubernetes 就会把 PV 和 PVC 关联在一起，这个动作叫做“绑定”（bind）。

但是，系统里的存储资源非常多，如果要 PVC 去直接遍历查找合适的 PV 也很麻烦，所以就要用到 StorageClass。StorageClass 的作用有点像第 21 讲里的 IngressClass，它抽象了特定类型的存储系统（比如 Ceph、NFS），在 PVC 和 PV 之间充当“协调人”的角色，帮助 PVC 找到合适的 PV。也就是说它可以简化 Pod 挂载“虚拟盘”的过程，让 Pod 看不到 PV 的实现细节。

## 用 yaml 描述 pv
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: host-10m-pv

spec:
  storageClassName: host-test
  accessModes:
  - ReadWriteOnce
  capacity:
    storage: 10Mi
  hostPath:
    path: /tmp/host-10m-pv/
```
PV 对象的文件头部分很简单，还是 API 对象的“老一套”，我就不再详细解释了，重点看它的 spec 部分，每个字段都很重要，描述了存储的详细信息。

`storageClassName`就是刚才说过的，对存储类型的抽象 StorageClass。这个 PV 是我们手动管理的，名字可以任意起，这里我写的是 host-test，你也可以把它改成 manual、hand-work 之类的词汇。

`accessModes`定义了存储设备的访问模式，简单来说就是虚拟盘的读写权限，和 Linux 的文件访问模式差不多，目前 Kubernetes 里有 3 种：ReadWriteOnce：存储卷可读可写，但只能被一个节点上的 Pod 挂载。ReadOnlyMany：存储卷只读不可写，可以被任意节点上的 Pod 多次挂载。ReadWriteMany：存储卷可读可写，也可以被任意节点上的 Pod 多次挂载。你要注意，这 3 种访问模式限制的对象是节点而不是 Pod，因为存储是系统级别的概念，不属于 Pod 里的进程。显然，本地目录只能是在本机使用，所以这个 PV 使用了 ReadWriteOnce。

第三个字段`capacity`就很好理解了，表示存储设备的容量，这里我设置为 10MB。再次提醒你注意，Kubernetes 里定义存储容量使用的是国际标准，我们日常习惯使用的 KB/MB/GB 的基数是 1024，要写成 Ki/Mi/Gi，一定要小心不要写错了，否则单位不一致实际容量就会对不上。

最后一个字段`hostPath`最简单，它指定了存储卷的本地路径，也就是我们在节点上创建的目录。用这些字段把 PV 的类型、访问模式、容量、存储位置都描述清楚，一个存储设备就创建好了。

## 用 yaml 描述 pvc
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: host-5m-pvc

spec:
  storageClassName: host-test
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Mi
```
PVC 的内容与 PV 很像，但它不表示实际的存储，而是一个“申请”或者“声明”，spec 里的字段描述的是对存储的“期望状态”。

所以 PVC 里的 storageClassName、accessModes 和 PV 是一样的，但不会有字段 capacity，而是要用 resources.request 表示希望要有多大的容量。

这样，Kubernetes 就会根据 PVC 里的描述，去找能够匹配 StorageClass 和容量的 PV，然后把 PV 和 PVC“绑定”在一起，实现存储的分配

## 如何给 pod 挂载 pvc
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: host-pvc-pod

spec:
  volumes:
  - name: host-pvc-vol
    persistentVolumeClaim:
      claimName: host-5m-pvc

  containers:
    - name: ngx-pvc-pod
      image: nginx:alpine
      ports:
      - containerPort: 80
      volumeMounts:
      - name: host-pvc-vol
        mountPath: /tmp
```
先要在 spec.volumes 定义存储卷，然后在 containers.volumeMounts 挂载进容器。