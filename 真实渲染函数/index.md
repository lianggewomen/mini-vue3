const h = (type, props, children) =>{
    return {
        type, 
        props,
        children
    }
}


const mount = (vNode, target) => {

    // 处理vdom 的标签类型创建el元素

    if(vNode.type) {
        var element = vNode.el = document.createElement(vNode.type)
    }

    // 处理props属性
    const props = vNode.props || {}
    const keys = Object.keys(props)
    if (keys.length > 0) {
        keys.forEach(item => {
            if (item.startsWith('on')) {
                element.addEventListener(item.slice(2).toLowerCase(), vNode.props[item])
            } else {
                element.setAttribute(item, vNode.props[item])
            }
        })
    }

    // 处理children
    if (vNode.children) {
        if (typeof vNode.children === 'string') {
            element.textContent = vNode.children
        } else {
            if (Array.isArray(vNode.children)) {
                vNode.children.forEach(item => {
                    mount(item, element)
                })
            }
        }
    }


    // 完成挂载
    target.appendChild(element)
}


// 实现patch 方法 进行diff算法

const patch = (n1, n2) => {
    // console.log(node1.type)
    // console.log(node2.type)

    // 新旧节点对比，首先判断是标签类型是否一致，不一致则直接暴力删除

    if (n1.type !== n2.type) {
        // 获取当前vnode的父节点，我们在mount中通过指针的方式，为每个元素保存了el属性，可以通过el.parentElementh获取父节点
        const n1ParentElement = n1.el.parentElement
        // 通过父节点的removeChild(传入要删除的子节点 也就是n1的el属性)
        n1ParentElement.removeChild(n1.el)
        // 最后通过mount重新渲染新的vnode，挂载节点就是n1的parent节点也就是app
        mount(n2, n1ParentElement)
    } else {
        // 取出el属性，并给n2设置el属性，方便下次通过patch方法更新dom
        const el = n2.el = n1.el

        // 处理完type类型，接下来处理props属性

        const oldProps = n1.props || {}
        const newProps = n2.props || {}

        // props处理，首先要把新节点的属性都添加上
        for (var item in newProps) {
            const oldValue = n1.props[item]
            const newVal = n2.props[item]
            // 判断当值不相等的时候进行添加
            if (newVal !== oldValue) {
                if (item.startsWith('on')) {
                    el.addEventListener(item.slice(2).toLowerCase(), newVal)
                } else {
                    el.setAttribute(item, newVal)
                }
            }
        }

        // props属性删除去掉的属性
        for (var item in oldProps) {
            // 判断新的props中是否存在就的属性， 不存在做删除操作。
            if (!(item in newProps)) {
                if (item.startsWith('on')) {
                    el.removeEventListener(item.slice(2).toLowerCase(), oldProps[item])
                } else {
                    el.removeAttribute(item)
                }
            }
        }

        // 处理children
        const oldChildren = n1.children || []
        const newChildren = n2.children || []

        // 判断newChildren的类型
        if (typeof newChildren === 'string') {
            if (typeof oldChildren === 'string') {
                if (oldChildren !== newChildren) {
                    el.textContent = newChildren
                } else {
                    el.innerHTML = newVal
                }
            }
        } else {   // 上边if判断了newchildren是一个字符串，下边必定是数组

            if (typeof oldChildren === 'string') {
                el.innerHTML = ''
                newChildren.forEach(item => {
                    mount(item, el)
                })
            } else  {  // 反之两者都是数组时

                // 源码diff算法 取两者的公共长度进行遍历， 添加删除元素
                commLength = Math.min(oldChildren.length, newChildren.length)

                // 相同节点操作
                for (let i = 0 ;  i< commLength ; i ++) {
                    patch(oldChildren[i], newChildren[i])
                }
                // 情况一  ：当新数组大于旧的数组的时候
                if (oldChildren.length < newChildren.length) {
                    newChildren.slice(oldChildren.length).forEach(item => {
                        mount(item, el)
                    })
                }

                // 情况二

                if (oldChildren.length > newChildren.length) {
                    oldChildren.slice(newChildren.length).forEach(item => {
                        el.removeChild(item.el)
                    })
                }
            }

        }
    }
}