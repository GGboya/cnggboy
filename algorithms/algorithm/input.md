```go
package main

import (
	"bufio"
	. "fmt"
	"os"
)

func solve() {
  
}

var in = bufio.NewReader(os.Stdin)
var out = bufio.NewWriter(os.Stdout)

func main() {
	defer out.Flush()
	var T int
	for Fscan(in, &T); T > 0; T-- {
		solve()
	}
}

```




模板说明，当遇到处理大量的输入数据或者输出数据的时候，用模板会快很多



**缓冲输入（`bufio.NewReader`）**：

- `bufio.NewReader` 包装了 `os.Stdin` 创建一个缓冲读取器。这意味着程序一次性从标准输入读取更大块的数据，从而减少读取操作的次数。

- `Fscan` 函数从这个缓冲读取器中读取数据，这比每次直接从 `os.Stdin` 读取要快得多。

**缓冲输出（`bufio.NewWriter`）**：

- `bufio.NewWriter` 包装了 `os.Stdout` 创建一个缓冲写入器。这意味着程序一次性向标准输出写入更大块的数据，从而减少写入操作的次数。

- `Fprintln` 函数向这个缓冲写入器中写数据，这比每次直接向 `os.Stdout` 写要快得多。

- `defer out.Flush()` 确保在程序终止前将所有缓冲的数据刷新到标准输出。

**减少系统调用**：

- 系统调用（如从标准输入读取或向标准输出写入）是相对较慢的操作。通过使用缓冲，程序减少了这些调用的次数，从而提高了整体性能。

