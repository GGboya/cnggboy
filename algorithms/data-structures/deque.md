# 力扣和cf可以用

```go
type deque struct {
	l, r []any
}

func (d *deque) append(x any) {
	d.r = append(d.r, x)
}

func (d *deque) appendLeft(x any) {
	d.l = append(d.l, x)
}

func (d *deque) pop() any {
	if len(d.r) > 0 {
		x := d.r[len(d.r)-1]
		d.r = d.r[:len(d.r)-1]
		return x
	} else if len(d.l) > 0 {
		x := d.l[0]
		d.l = d.l[1:]
		return x
	}
	return nil

}

func (d *deque) popLeft() any {
	if len(d.l) > 0 {
		x := d.l[len(d.l)-1]
		d.l = d.l[:len(d.l)-1]
		return x
	} else if len(d.r) > 0 {
		x := d.r[0]
		d.r = d.r[1:]
		return x
	}
	return nil
}

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

func (d *deque) Len() int {
	return len(d.l) + len(d.r)
}

func NewDeque() *deque {
	return &deque{}
|~
  ~~
```




# 牛客用

```Go
type deque struct {
	l, r []interface{}
}

func (d *deque) append(x interface{}) {
	d.r = append(d.r, x)
}

func (d *deque) appendLeft(x interface{}) {
	d.l = append(d.l, x)
}

func (d *deque) pop() interface{} {
	if len(d.r) > 0 {
		x := d.r[len(d.r)-1]
		d.r = d.r[:len(d.r)-1]
		return x
	} else if len(d.l) > 0 {
		x := d.l[0]
		d.l = d.l[1:]
		return x
	}
	return nil

}

func (d *deque) popLeft() interface{} {
	if len(d.l) > 0 {
		x := d.l[len(d.l)-1]
		d.l = d.l[:len(d.l)-1]
		return x
	} else if len(d.r) > 0 {
		x := d.r[0]
		d.r = d.r[1:]
		return x
	}
	return nil
}

func (d *deque) Len() int {
	return len(d.l) + len(d.r)
}

func NewDeque() *deque {
	return &deque{}
}
```


