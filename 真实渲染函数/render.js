const h = (type, props, children) =>{
    return {
        type, 
        props,
        children
    }
}


const mount = (vNode, target) => {
    let element
    // 处理vdom 的标签类型创建el元素
    if(vNode.type) {
        element = vNode.el = document.createElement(vNode.type)
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
    const el = n2.el = n1.el
    // 首先进行虚拟dom类型判断
    if (n1.type !== n2.type) {
        // 如果不相等直接暴力删除,获取到当前虚拟dom的父元素
        const oldParent = n1.el.parentElement
        // 删除旧的子元素
        oldParent.removeChild(n1.el)
        // 新的虚拟dom调用mount重新挂载
        mount(n2, oldParent)

    } else {   // 新旧dom节点类型相同  ，判断props属性
        
        const oldProps = n1.props || {}
        const newProps = n2.props || {}

        // 先把新的属性全部设置到el元素中
        for(let key in newProps) {
            // 判断新旧属性的值是否相等。不相等在进行赋值操作
            const oldVal = oldProps[key]
            const newVal = newProps[key]
            if (oldVal !== newVal) {
                
                // 判断事件
                if (key.startsWith('on')) {
                    console.log('---')
                    el.addEventListener(key.slice(2).toLowerCase(), newVal)
                } else {
                    el.setAttribute(key, newVal)
                }
            }
        }

        // 把旧的props属性去掉

        for(let key in oldProps ) {
            if (key.startsWith('on')) {
                const value = oldProps[key]
                el.removeEventListener(key.slice(2).toLowerCase(), value)
            }
            if (!(key in  newProps)) {
                el.removeAttribute(key)
            }
        }

        // 处理children
        // 假设一 新的children是个字符串时
        const oldChildren = n1.children || []
        const newChildren = n2.children || []

        if (typeof newChildren === 'string') {
            if (typeof oldChildren === 'string') {
                // 当他们不相等是时候才进行赋值
                if (newChildren !== oldChildren) {
                    el.textContent = newChildren
                }
            } else {
                el.innerHtml = newChildren
            }
        } else { 
            // 判断newChildren为数组情况且 oldChildren为字符串
            if (typeof oldChildren.children === 'string') {
                el.innerHtml = ''
                newChildren.forEach(item => {
                    mount(item, el)
                })
            } else  {
                // 两者都是数组时 进行diff比较
                //  取两者公共长度
                const commLength = Math.min(oldChildren.length, newChildren.length)
                
                for (let i = 0 ;i < commLength ; i++) {
                    patch(oldChildren[i], newChildren[i])
                }

                // 当旧的大于新的
                if (oldChildren.length > newChildren.length) {
                    oldChildren.slice(newChildren.length).forEach(item => {
                        el.removeChildren(item.el)
                    })
                }

                // 当新的大于旧的
                if (newChildren.length > oldChildren.length) {
                    newChildren.slice(oldChildren.length).forEach(item => {
                        mount(item, el)
                    })
                }
            }
        }
    }
}