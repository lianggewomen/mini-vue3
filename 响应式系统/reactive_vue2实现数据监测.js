// 依赖收集 dep类
class Dep {
    constructor() {
        this.subscribe = new Set()
    }
    depend() {
        if (activeEffect) {
            this.subscribe.add(activeEffect)
        }
    }
    notify() {
        this.subscribe.forEach(effect => {
            effect()
        })
    }
}

// 通过watchEffect实现自动收集依赖
let activeEffect = null
function watchEffect(effect) {
    activeEffect = effect
    effect()
    // dep.depend()
    activeEffect = null
}

// 组织数据结构
// 为每个数据创建一个map数据结构     map数据集合:[ obj对象数据集合: [ obj.count属性依赖集合: new dep[]] ]
// weakMap  的key可以是一个一个对象  弱类型引用
let targetMap = new WeakMap()   
function getDep(target, key) {
    // 根据对象的target取出对应的map对象
    let depMap = targetMap.get(target)
    if (!depMap) {
        depMap = new Map()
        targetMap.set(target, depMap)
    }
    // 根据key取出对应的map对象
    let dep = depMap.get(key)
    if (!dep) {
        dep = new Dep()
        depMap.set(key, dep)
    }

    return dep
}
// 数据劫持
function reactive(raw) {
    Object.keys(raw).forEach(key => {
        const dep = getDep(raw, key)
        let value = raw[key]
        Object.defineProperty(raw, key, {
            get() {
                dep.depend()
                return value
            },
            set(newVal) {
                if (value !== newVal) {
                    value = newVal
                    dep.notify()
                }
            }
        })
    })
    return raw
}


// 测试代码

// 事件触发
const val = reactive({
    count: 20
})

const user = reactive({
    name: 'zs',
    age: 18
})
watchEffect(function add() {
    console.log(val.count + 20)
})

// 事件触发
watchEffect(function dotyCount() {
    console.log(val.count * val.count)
})

watchEffect(function() {
    console.log(user.name , user.age)
})

// 换种思路， 使用自动注册   
// dep.addDep(add)
// dep.addDep(dotyCount)

// val.count = 30

// dep.notify()

// val.count = 30
user.age = 20