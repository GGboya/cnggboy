# Go

# 方法调用

小明学go语法的时候，看到了下面这段代码

```go
type T struct{}

func (t T) M(n int) {
}

func main() {
	var t T
	t.M(1) // 通过类型T的变量实例调用方法M

	p := &T{}
	p.M(2) // 通过类型*T的变量实例调用方法M
}
```


这段代码中，方法 M 是类型 T 的方法，那为什么通过 *T 类型变量也可以调用 M 方法呢？



这是因为 Go 编译器在背后做了转换。也就是，Go 判断 p 的类型为 *T，与方法 M 的 receiver 参数类型 T 不一致，就会自动将p.M()转换为(*p).M()



无论是 T 类型实例，还是 *T 类型实例，都既可以调用 receiver 为 T 类型的方法，也可以调用 receiver 为 *T 类型的方法。这样，我们在为方法选择 receiver 参数的类型的时候，就不需要担心这个方法不能被与 receiver 参数类型不一致的类型实例调用了

```go
// typecheckmethod handles type-checking of a method call e.g. x.method(args).
func typecheckmethod(n *Node, top int) *Node {
    // Get the method set for the receiver type.
    mt := MethodType(n.Left.Type)

    // Check if the method exists in the method set.
    m := Lookdot(n.Left.Type, n.Right.Sym)
    if m == nil {
        // If not found, check if the method can be applied to a pointer receiver.
        if n.Left.Type.IsPtr() {
            baseType := n.Left.Type.Elem()
            m = Lookdot(baseType, n.Right.Sym)
            if m != nil {
                n.Left = Nod(OIND, n.Left, nil)
                n.Left = typecheck(n.Left, ctxExpr)
            }
        }
    }
    
    // If the method is still not found, throw an error.
    if m == nil {
        yyerror("type %v has no method %v", n.Left.Type, n.Right.Sym)
        return n
    }

    // Perform further type-checking and method call handling.
    n.Type = m.Type
    n.Op = OCALL
    n.Left = m
    n.List = typecheck(n.List, ctxExpr)
    return n
}
```


---



# 方法集合

### 案例一

小明学go的时候，看到下面这段代码

```go
type Interface interface {
	M1()
	M2()
}

type T struct{}

func (t T) M1()  {}
func (t *T) M2() {}

func main() {
	var t T
	var pt *T
	var i Interface
	i = pt
	i = t

}
```


小明发现代码还没执行，编译器就已经开始报错了。

错误信息：T 没有实现 Interface 类型方法列表中的 M2，因此类型 T 的实例 t 不能赋值给

Interface 变量。

可是，为什么呀？为什么 *T 类型的 pt 可以被正常赋值给 Interface 类型变量 i，而 T 类型的 t

就不行呢？如果说 T 类型是因为只实现了 M1 方法，未实现 M2 方法而不满足 Interface 类型

的要求，那么 *T 类型也只是实现了 M2 方法，并没有实现 M1 方法啊？

你知道为什么吗，帮帮小明



Go 语言规定，*T 类型的方法集合包含所有以 *T 为 receiver 参数类型的方法，以

及所有以 T 为 receiver 参数类型的方法。所以pt的方法集合中包含了M1和M2方法，因此pt实现了接口，而t的方法集合中只有M1，未实现接口。



方法集合的作用：

如果某类型 T 的方法集合与某接口类型的方法集合相同，或者类型 T 的方法集合是接口类型 I 方法集合的超集，那么我们就说这个类型 T 实现了接口 I。或者说，方法集合这个概念在 Go 语言中的主要用途，就是用来判断某个类型是否实现了某个接口。



### 案例二

小明最近学到了一个新知识

在Go语言中，当一个类型实现了`fmt.Stringer`接口，`fmt`包的相关函数（如`fmt.Println`、`fmt.Printf`等）会自动调用该类型的`String`方法来获取其字符串表示。`fmt.Stringer`接口定义如下：

```go
type Stringer interface {
    String() string
}
```


只要一个类型实现了这个接口，`fmt`包就会使用`String`方法的返回值来表示该类型的实例。具体来说，当你调用`fmt.Println(deque)`时，如果`deque`类型实现了`String`方法，`fmt`包会调用`deque.String()`来获取字符串表示，然后输出该字符串。



小明自己实现了一个双端队列，它想为这个队列添加一个方法，展示队列中所有的元素。

他的代码如下：

```go
func (d *deque) String() string {
	var elements []string
	for i := len(d.l) - 1; i >= 0; i-- {
		elements = append(elements, fmt.Sprintf("%v", d.l[i]))
	}
	for _, value := range d.r {
		elements = append(elements, fmt.Sprintf("%v", value))
	}
	return fmt.Sprintf("[%s]", strings.Join(elements, ", "))
}

func NewDeque() deque {
	return deque{}
}

func main() {
	q := NewDeque()
	q.append(3)
	q.append(4)
	q.append(5)
	q.appendLeft(1)
	fmt.Println(q)
}
```


奇怪了，输出怎么是`{[1] [3 4 5]}`，你能帮小明找找原因吗？



根据案例一的知识点，String方法的接收者是*deque，而q是deque{}类型，他的方法集合不包括`*deque`，因此没能实现Stringer接口，所以不会自动调用String方法作为自定义的输出。只需要修改为`q = &deque{}`就可以正常输出了。



