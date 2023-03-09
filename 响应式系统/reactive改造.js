const val = {
    count: 20
}



// 事件触发
function add() {
    console.log(val.count += 20)
}

// 事件触发
function dotyCount() {
    console.log(val.count * val.count)
}


// 依赖收集

class Dep {
    constructor() {
        this.subscribe = new Set()
    }

    addDep(effect) {
        this.subscribe.add(effect)
    }

    notify() {
        this.subscribe.forEach(effect => {
            effect()
        })
    }
}

const dep = new Dep()


dep.addDep(add)
dep.addDep(dotyCount)

dep.notify()