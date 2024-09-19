go提供了heap的接口，只需要实现对应的函数即可



```go
type pair struct{ x, y, dist int }

type hp []pair

func (h hp) Len() int              { return len(h) }
func (h hp) Less(i, j int) bool    { return h[i].dist < h[j].dist } // 这是最小堆
func (h hp) Swap(i, j int)         { h[i], h[j] = h[j], h[i] }
func (h *hp) Push(v interface{})   { *h = append(*h, v.(pair)) }
func (h *hp) Pop() (v interface{}) { a := *h; *h, v = a[:len(a)-1], a[len(a)-1]; return }
func (h *hp) push(v pair)         { heap.Push(h, v) }
func (h *hp) pop() pair           { return heap.Pop(h).(pair) }
func (h *hp) top() pair           { a := *h; return a[0] }

func Newheap() *hp {
  return &hp
}
```




注意我们最后封装了两个函数,push和pop。

不可以直接调用h.Pop()和h.Push()，这只是简单的在切片上进行push和pop而已。

要调用heap.Push(h, xxx)和heap.Pop(x)，才可以实现优先队列的功能

使用heap之前，有五个方法，需要用户来实现

- Len()

- Less()

- Swap()

- Push()

- Pop()

因为heap.Push(参数1， 参数2)中的第一个参数是一个Interface的接口类型，该接口需要实现上述的五个方法



