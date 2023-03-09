

class Dep {
    constructor() {
        this.subscribe = new Set()
    }
    depend() {
        if (onEffect) {
            this.subscribe.add(onEffect)
        }
    }

    notify() {
        this.subscribe.forEach(effect => {
            effect()
        })
    }
}

// let dep = new Dep()
let onEffect = null
function watchEffect(effect) {
    onEffect = effect
    // dep.depend()
    effect()
    onEffect = null
}

// 数据结构设计 为了是每个对象的每个属性进行依赖收集  数据结构为   comm = [ {}单个对象：nep Map() -> [某个属性的dep ：subscrib集合]] 
// WeakMap  键值对类型， 键可以为一个对象 ，弱引用。
// Map  // 键值对类型， 键位字符串的
let commDep = new WeakMap()
function getDep(target, key) {
    // 取出外层对象的 map数据
    let deps = commDep.get(target)
    // 如果不存在就创建
    if (!deps) {
        deps = new Map()
        commDep.set(target, deps)
    }

    // 取出对象中属性的dep类
    let dep = deps.get(key)
    if (!dep) {
        // 如果不存在就创建
        dep = new Dep()
        deps.set(key, dep)
    }

    return dep
}

// 数据劫持
function reactive(raw) {
    Object.keys(raw).forEach(key => {
        // const dep = new Dep
        // 获取dep进行依赖收集  dep.depend()
        // 调用 getDep获取对应属性的dep类
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

const user = reactive({
    name: 'zs',
    age: 18
})

const obj = reactive({
    id: 10
})

// watchEffect(function() {
//     console.log(user.name + 20)
// })

// watchEffect(function() {
//     console.log(user.age)
// })
// watchEffect(function() {
//     console.log(obj.id)
// })

// user.name = 'ls'