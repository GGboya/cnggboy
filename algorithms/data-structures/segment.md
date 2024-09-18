# 基础线段树

单点修改，区间查询

单点修改：对nums[i]的值更新为val

区间查询：返回nums[l, r]之间的元素和

## 构造线段树-build

接收数组nums，根据nums构造出线段树SegmentTree

线段树上每一个结点是一个区间，根节点代表$[1,n]$的区间，叶子结点代表单点

构造线段树，实际上就是对每个线段树上的结点赋值，也就是求出线段树每个结点对应区间的元素和

build操作通过递归实现，先求出子节点的值，然后更新父节点的值，代码如下：

```Go
func (s *SegmentTree) build(o, l, r int) {
	if l == r {
		s.sum[o] = s.nums[l-1]
		return
	}

	mid := (l + r) >> 1
	s.build(o<<1, l, mid)
	s.build((o<<1)|1, mid+1, r)
	s.sum[o] = s.sum[o<<1] + s.sum[(o<<1)|1]
}
```




## 单点修改-update

线段树上的一个结点会有若干父节点，当修改了某一个结点的值，对应的父节点的值也需要修改。

由于需要修改的下标index是已知的，当index小于等于mid，就只需要去搜索左子树。反之亦然。

```Go
func (s *SegmentTree) update(o, l, r, idx, val int) {
	if l == r {
		s.sum[o] = val
        return 
	}
	mid := (l + r) >> 1
	if idx <= mid {
		s.update(o<<1, l, mid, idx, val)
	} else {
		s.update((o<<1)|1, mid+1, r, idx, val)
	}
	s.sum[o] = s.sum[o<<1] + s.sum[(o<<1)|1]
}
```




## 区间查询-query

线段树上的每个结点都存放了对应区间的元素和

假设我们需要查询的区间为$[L, R]$

对于结点node对应的区间$[l,r]$，该区间的中点为mid

查询的区间要么全部在mid左边，要么在右边，要么一部分在左边、一部分在右边

判断清楚所有的情况即可

```Go
func (s *SegmentTree) query(o, l, r, L, R int) int {
	if L <= l && R >= r {
		return s.sum[o]
	}
	mid := (l + r) >> 1

	if R <= mid {
		return s.query(o<<1, l, mid, L, R)
	}

	if L > mid {
		return s.query((o<<1)|1, mid+1, r, L, R)
	}

	return s.query(o<<1, l, mid, L, R) + s.query((o<<1)|1, mid+1, r, L, R)
}
```




## 优化参数-Update

避免用户使用函数的时候，考虑过多的参数。因此单独写一个Update函数，简单封装一下

注意，线段树的结点下标是从1开始的，用户使用的index下标从0开始

```Go
func (s *SegmentTree) Update(index int, val int) {
	s.update(1, 1, len(this.nums), index+1, val)
}
```




## 优化参数-SumRange

避免参数过多，对query函数进行简单封装

```Go
func (s *SegmentTree) SumRange(left int, right int) int {
	return s.query(1, 1, len(this.nums), left+1, right+1)
}
```




## 完整模板

```Go
package main

type SegmentTree struct {
	sum  []int // 下标从1开始
	nums []int // 下标从0开始
}

func (s *SegmentTree) build(o, l, r int) {
	if l == r {
		s.sum[o] = s.nums[l-1]
		return
	}

	mid := (l + r) >> 1
	s.build(o<<1, l, mid)
	s.build((o<<1)|1, mid+1, r)
	s.sum[o] = s.sum[o<<1] + s.sum[(o<<1)|1]
}

func (s *SegmentTree) update(o, l, r, idx, val int) {
	if l == r {
		s.sum[o] = val
        return
	}
	mid := (l + r) >> 1
	if idx <= mid {
		s.update(o<<1, l, mid, idx, val)
	} else {
		s.update((o<<1)|1, mid+1, r, idx, val)
	}
	s.sum[o] = s.sum[o<<1] + s.sum[(o<<1)|1]
}

func (s *SegmentTree) query(o, l, r, L, R int) int {
	if L <= l && R >= r {
		return s.sum[o]
	}
	mid := (l + r) >> 1

	if R <= mid {
		return s.query(o<<1, l, mid, L, R)
	}

	if L > mid {
		return s.query((o<<1)|1, mid+1, r, L, R)
	}

	return s.query(o<<1, l, mid, L, R) + s.query((o<<1)|1, mid+1, r, L, R)
}

func bit_length(x int) int {
	size := 0
	for x > 0 {
		x >>= 1
		size += 1
	}
	return size
}
func Constructor(nums []int) SegmentTree {
	tree := SegmentTree{
		sum:  make([]int, 2<<bit_length(len(nums))),
		nums: nums,
	}
	tree.build(1, 1, len(nums))
	return tree
}

func (s *SegmentTree) Update(index int, val int) {
	s.update(1, 1, len(s.nums), index+1, val)
}

func (s *SegmentTree) SumRange(left int, right int) int {
	return s.query(1, 1, len(s.nums), left+1, right+1)
}

/**
 * Your NumArray object will be instantiated and called as such:
 * obj := Constructor(nums);
 * obj.Update(index,val);
 * param_2 := obj.SumRange(left,right);
 */

```




## 值域离散化

当值域存在复数，或者值域特别大，但是数组长度又比较小的时候，需要使用离散化的技巧。

对数组进行哈希，排序。此时每个数组的下标就和元素值进行了映射，从而达到离散化的效果。



## 线段树二分

查询某个区间中满足条件的最小元素

以查询前maxRow行中，观众数不超过m-k，并且下标最小的行为例，学习线段树二分的写法

用线段树维护每个区间上的观众数的最小值

- 当前区间的最小值 > m-k，表示不存在可以容纳k个观众的行，直接返回0

- 当前区间只有一个元素，l = r，表示找到了最小的下标

- 左子树对应的最小值 ≤ m-k，表示左子树存在可以容纳k个观众的行，递归左子树

- 左子树不存在这样的行，递归右子树（递归的前提是maxRow在mid的右边）

- 无法递归，直接返回0

具体代码如下

```Go
func (t *BookMyShow) Index(o, l, r, val, R int) int {
	// 返回区间[1, R]中小于等于val的最靠左的位置，不存在返回0
	if t.min[o] > val {
		// 整个区间的元素都大于val
		return 0
	}

	if l == r {
		return l
	}

	mid := (l + r) >> 1

	if t.min[o<<1] <= val {
		return t.Index(o<<1, l, mid, val, R)
	}

	if mid < R {
		return t.Index((o<<1)|1, mid+1, r, val, R)
	}

	return 0
}
```




## 动态开点线段树

当值域过大，无法直接开辟等量的数组时，一般采用离散化。但是如果事先不知道数据，离散化将变得困难。此时使用动态开点的方法。

以2426这道题举例，值域包含负数，需要离散化或者使用动态开点

此时的query和add操作，需要进行修改

使用的时候再开辟空间，而不是事先就开辟好空间。因此add的代码为

```Go
func (s *SegmentTree) add(l, r, idx, val int) {
	if l == r {
		s.sum += val
		return
	}
	mid := (l + r) >> 1
	if s.left == nil {
		s.left = &SegmentTree{}
	}
	if s.right == nil {
		s.right = &SegmentTree{}
	}

	if idx <= mid {
		s.left.add(l, mid, idx, val)
	} else {
		s.right.add(mid+1, r, idx, val)
	}

	s.sum = s.left.sum + s.right.sum
}
```


区别在于如果需要继续递归，此时再开辟对应的子节点。



查询的代码如下

```Go
func (s *SegmentTree) query(l, r, L, R int) int {
	if L <= l && r <= R {
		return s.sum
	}
	mid := (l + r) >> 1
	sum := 0
	if L <= mid && s.left != nil {
		sum += s.left.query(l, mid, L, R)
	}
	if R > mid && s.right != nil {
		sum += s.right.query(mid+1, r, L, R)
	}
	return sum
}
```


区别在于每次查询的时候，需要判断该节点是否存在左孩子和右孩子。只有存在，才可以继续递归





## 具体应用

- 查询区间和

- 查询区间最值

- 查询区间大于x的元素个数

- 查询某个区间中满足条件的最小元素

## 习题：

[307. 区域和检索 - 数组可修改](https://leetcode.cn/problems/range-sum-query-mutable/) - 基础线段树

[2426. 满足不等式的数对数目](https://leetcode.cn/problems/number-of-pairs-satisfying-inequality/) - 基础线段树 + 离散化 + 公式变形 || 也可用动态开点的方式求解

[2286. 以组为单位订音乐会的门票](https://leetcode.cn/problems/booking-concert-tickets-in-groups/) - 基础线段树 + 线段树二分

[2276. 统计区间中的整数数目](https://leetcode.cn/problems/count-integers-in-intervals/) - 基础线段树 + 动态开点







