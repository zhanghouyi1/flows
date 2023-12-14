/**创建flow啥类 */
class CreateFlows{
    /**
     * canvas: canvas dom
     * data: 基础组织数数据
     * domData: 渲染的样式数据 对象
     * 
     */
    
    constructor(className,data,domData){
        /**创建画布 */
        this.canvas=document.getElementById(className);
        /**创建执行上下文 */
        this.ctx=canvas.canvas.getContext('2d')
        this.data=data;
        this.domData=domData
        /**循环样式数据 去创建样式 */
        this.createDom(domData)
    }
    createDom(data){
       
    }
}

/**创建Rect 类用于创建每个组织的外层区域 */

class Rect{
    constructor(){

    }
}

/**头像类 */
class Avatar{
    constructor(){

    }
}

/**创建文字类 */
class Text{
    constructor(){

    }
}