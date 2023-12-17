/**创建flow啥类 */
class CreateFlows {
    /**
     * canvas: canvas dom
     * data: 基础组织数数据
     * domData: 渲染的样式数据 对象
     * 
     */

    constructor(className, data, domData) {
        /**创建画布 */
        this.canvas = document.getElementById(className);
        /**创建执行上下文 */
        this.context = canvas.canvas.getContext('2d')
        this.data = data;
        this.domData = domData
        /**循环样式数据 去创建样式 */
        this.createDom(domData)
        /**创建类 */
        const rect = new Rect(this.context)
        const avatar = new Avatar(this.context)
        const text = new Text(this.context);


    }
    createDom(data) {

    }
}

/**创建Rect 类用于创建每个组织的外层区域 并继承与父类 */

class Rect extends CreateFlows {
    /**ctx 画布 */
    constructor(context,x,y,width,height,color) {
        super()
        this.createRect(context,x,y,width,height,color)
    }
    createRect(context,x,y,width,height,color) {
        context.beginPath();
        context.fillStyle = color;
        context.fillRect(x,y, width, height);
    }
}

/**头像类 */
class Avatar extends CreateFlows {
    /**ctx 画布 */
    constructor(context,x,y,url,size) {
        super()
        this.createAvatar(context,x,y,url,size)
    }
    createAvatar(context,x,y,url,size) {
        const _size =size|| 2 * 50;
        context.arc(x + 30, y + 30, 30, 0, 2 * Math.PI);
        context.clip();
        context.drawImage(url, x - 30, y - 30, _size, _size);
        context.restore();
    }
}

/**创建文字类 */
class Text extends CreateFlows {
    /**ctx 画布 */
    constructor(context,text,x,y,color,fontSize) {
        super()
        this.createText(context,text,x,y,color,fontSize)
    }
    createText(context,text,x,y,color,fontSize) {
        context.fillStyle = color||'#000'
        context.font = `${fontSize||'40px'} 宋体`
        context.fillText(text, x, y + 66 + 38);
    }
}