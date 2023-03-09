const obj = {count: 2}


function a() {
    return obj.count *2
} 

a()

// 每次依赖的数据更新都需要手动触发方法计算新的结果
obj.count ++ 
a()