
const createApp = (rootComponents) => {
    return {
        mount(selector) {
            const container = document.querySelector(selector)
            let oldNode = null
            let isMounted = false
            watchEffect(() => {
                if (!isMounted) {
                    oldNode = rootComponents.render()
                    mount(oldNode, container)
                    isMounted = true
                } else {
                    const newNode = rootComponents.render()
                    patch(oldNode, newNode)
                    oldNode = newNode 
                }
            })
        }
    }
}