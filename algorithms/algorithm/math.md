# 筛质数
```Go
func GetPrimeList(n int) []int {
	// p[i] == 1 表示为质数， p[i] == -1 表示为合数
	p := make([]int, n+1)
	for i := 2; i <= n; i++ {
		if p[i] == 0 {
			p[i] = 1
			for j := i + i; i <= n; j += i {
				p[j] = -1 // i是质数，i的倍数为合数，标记为-1
			}
		}
	}
	return p
}
```




