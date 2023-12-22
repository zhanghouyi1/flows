/**创建flow啥类 */
export class CreateFlows {
    /**
     * canvas: canvas dom
     * data: 基础组织数数据
     * domData: 渲染的样式数据 对象
     * 
     */

    constructor(prams) {
        const { id, data, domData } = prams || {}
        /**创建画布 */
        this.canvas = document.getElementById(id);
        /**画布宽高 */
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        /**创建执行上下文 */
        this.context = this.canvas.getContext('2d')
        /**数据 */
        this.data = data;
        /**dom数据 */
        this.domData = domData
        this.domDataArray = Object.keys(domData)
        /**卡片宽 */
        this.rectWidth = domData['rect']?.width;
        /**卡片高 */
        this.rectHeight = domData['rect']?.height
        /**循环样式数据 去创建样式 */

        /**创建类 */
        this.rect = new Rect(this.context)
        this.avatar = new Avatar(this.context)
        this.text = new Text(this.context);
        this.bound = this.canvas.getBoundingClientRect();
        /**缩放比例 */
        this.scaleX = this.width / this.bound.width;
        this.scaleY = this.height / this.bound.height;
        /**画布中心点 */

        this.center = {
            x: this.bound.width / 2,
            y: this.bound.height / 2
        }
        /**存储总共有几级 用于计算上下位置 */
        this.levels = 0
        /**最长同级 */
        this.maxGrade = 0
        this.gradeObj = {}
        this.gradeKeys = [];
        /** 存储起点 */
        this.fromData = {};
        /**存储单个元素 */
        this.store = {}
        /**存储画布位置移动 */
        this.contextStore={
            x:0,
            y:0,
            clientX:0,
            clientY:0
        }
        /**注册事件 */
        this.canvas.addEventListener('mousedown', (e) => {
            this.onMousedown(e)
        })
        /**初始数据 */
        this.init(this.data).then(() => {
            /**确定第一个位置 */
            this.gradeKeys = Object.keys(this.gradeObj)
            this.context.clearRect(0, 0, this.width, this.height);
            const rectInfo = this.domData['rect'];
            this.initDom(this.gradeKeys, {
                x: this.center.x,
                y: this.center.y - this.levels / 2 * rectInfo.height
            })
        })
    }
    /**初始化数据 */
    init(imgUrls) {
        /**要保证所有图片资源加载完毕 */
        const load = (imgUrl) => {
            //创建img标签
            let img = new Image();
            img.src = imgUrl.src;
            //跨域选项
            img.setAttribute("crossOrigin", 'Anonymous');
            return new Promise((resolve, reject) => {
                //文件加载完毕
                img.onload = () => {
                    resolve(img);
                    imgUrl.url = img;
                    imgUrl.imgWidth = img.width;
                    imgUrl.imgHeigt = img.height;
                };
            });
        }
        /*存promise*/
        let loadedImageUrls = [];
        const loadAll = (imgUrls, level, parentId) => {
            this.gradeObj[level] = this.gradeObj[level]?.length ? this.gradeObj[level] : []
            for (var i = 0, len = imgUrls.length; i < len; i++) {
                const result = load(imgUrls[i]);
                if (level > this.levels) {
                    this.levels = level
                }
                this.gradeObj[level].push(imgUrls[i])
                imgUrls[i].level = level
                imgUrls[i].parentId = parentId
                loadedImageUrls.push(result);
                if (imgUrls[i]?.child?.length) {
                    loadAll(imgUrls[i]?.child, imgUrls[i].level + 1, imgUrls[i].id)
                }
            }
            return loadedImageUrls
        }
        return Promise.all(loadAll(imgUrls, 0, 0))
    }
    /**画图形 */
    initDom(list, center) {
        let i = 0;
        while (i < list.length) {
            this.gradeObj[i]?.forEach((item, index) => {
                let x, y;
                const rectInfo = this.domData['rect'];
                const { width, height } = rectInfo;
                /**判断是奇数还是偶数 */
                //this.center
                const midIndex = (this.gradeObj[i].length - 1) / 2
                if (this.gradeObj[i].length % 2 === 0) {
                    /**偶数个 */
                    x = center.x - (midIndex - index) * width;
                    y = center.y + i * height
                } else {
                    /**奇数个 */
                    x = (center.x - (midIndex - index) * width - width / 4);
                    y = center.y + i * height
                }
                this.fromData[item.id] = {
                    x: x * this.scaleX + this.rectWidth / 2,
                    y: y * this.scaleY + this.rectHeight
                }

                item.x = x * this.scaleX;
                item.y = y * this.scaleY
                if (i > 0) {
                    /**存储终点 */
                    item.to = {
                        x: x * this.scaleX + this.rectWidth / 2,
                        y: y * this.scaleY
                    }
                    /**从二级开始画线 */
                    this.context.beginPath();
                    this.context.lineWidth = 4;
                    this.context.strokeStyle = '#000';
                    const fromX = this.fromData[item.parentId].x
                    const fromY = this.fromData[item.parentId].y
                    const cp1x = fromX;
                    const cp1y = fromY + (y * this.scaleY - fromY) / 2;
                    const cp2x = x * this.scaleX + this.rectWidth / 2;
                    const cp2y = y * this.scaleY - (y * this.scaleY - fromY) / 2;
                    this.context.moveTo(fromX, fromY);
                    // 绘制曲线点
                    this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x * this.scaleX + this.rectWidth / 2, y * this.scaleY);
                    this.context.stroke();
                }

                //长方体
                this.domDataArray.includes('rect') && this.rect.createRect(this.context, x * this.scaleX, y * this.scaleY, rectInfo);
                //文字
                this.domDataArray.includes('text') && this.text.createText(this.context, item.title, x * this.scaleX, y * this.scaleY, this.domData['text'])
                //头像
                this.domDataArray.includes('avatar') && this.avatar.createAvatar(this.context, x * this.scaleX, y * this.scaleY, item.url, item.imgWidth, item.imgHeigt, this.domData['avatar'])
                //结束
                this.context.closePath();
            })
            i++
        }
    }
    drawDom(list) {
        let i = 0;
        while (i < list.length) {
            this.gradeObj[i]?.forEach(item => {
                //长方体

                this.fromData[item.id] = {
                    x: item.x + this.rectWidth / 2,
                    y: item.y + this.rectHeight
                }
                if (i > 0) {
                    const fromX = this.fromData[item.parentId].x;

                    const fromY = this.fromData[item.parentId].y < item.to.y ? this.fromData[item.parentId].y : this.fromData[item.parentId].y - this.rectHeight;
                    const toX = item.to.x;

                    const toY = this.fromData[item.parentId].y < item.to.y ? item.to.y : item.to.y + this.rectHeight;
                    // 曲线控制点坐标
                    const cp1x = fromX;
                    const cp1y = fromY + (toY - fromY) / 2;

                    const cp2x = toX;
                    const cp2y = toY - (toY - fromY) / 2;

                    // 开始绘制曲线
                    this.context.beginPath();
                    this.context.lineWidth = 4;
                    this.context.strokeStyle = '#000';
                    this.context.moveTo(fromX, fromY);
                    // 绘制曲线点
                    this.context.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toX, toY);
                    this.context.stroke();
                }
                this.domDataArray.includes('rect') && this.rect.createRect(this.context, item.x, item.y, this.domData['rect']);
                //文字
                this.domDataArray.includes('text') && this.text.createText(this.context, item.title, item.x, item.y, this.domData['text'])
                //头像
                this.domDataArray.includes('avatar') && this.avatar.createAvatar(this.context, item.x, item.y, item.url, item.imgWidth, item.imgHeigt, this.domData['avatar'])
                //结束
                this.context.closePath();

            })
            i++
        }
    }
    /**画全部 */
    draw() {
        this.context.clearRect(0, 0, this.width, this.height);
        this.drawDom(this.gradeKeys)
    }
    /**画线条 */

    onMousedown(e) {
        this.store = null
        // 判断坐标是否在图形之内
        const clientX = e.clientX;
        const clientY = e.clientY;
        // canvas 画布的偏移

        // 点击坐标
        const clickX = clientX - this.bound.left;
        const clickY = clientY - this.bound.top;

        // 转换为canvas坐标
        const x = clickX * this.scaleX;
        const y = clickY * this.scaleY;
        this.isPointInSquare(this.gradeKeys, x, y);
        if (this.store) {
            // 选中物体
            // 记住位置
            this.store.clientX = clientX;
            this.store.clientY = clientY;
            // 目标元素
            this.store.dataMatch = this.store;
            // 记住初始位置
            this.store.originX = this.store.dataMatch.x;
            this.store.originY = this.store.dataMatch.y;

            if (this.store.dataMatch?.to?.x) {
                this.store.orginToX = this.store.dataMatch.to.x;
                this.store.orginToY = this.store.dataMatch.to.y;
            }

            // 记住缩放比例
            this.store.scaleX = this.scaleX;
            this.store.scaleY = this.scaleY;
        }else{
            this.contextStore={
                x:0,
                y:0,
                clientX,
                clientY
            }
        }


        const that = this
        document.addEventListener('mousemove', function (event) {
            if (!that.store) {
                
                // const distanceX = (event.clientX - that.contextStore.clientX)*that.scaleX;
                // const distanceY = (event.clientY - that.contextStore.clientY)*that.scaleY ;
                // console.log('distanceY',that.contextStore.x+distanceX)
                // that.context.clearRect(distanceX, distanceY, that.width, that.height);
                // that.draw();
                // that.context.translate(distanceX,distanceY)
                // that.context.restore()
                return;
            }
            event.preventDefault();
            // 需要移动的坐标
            const dataMatch = that.store.dataMatch;
            // 此时的偏移大小
            const distanceX = (event.clientX - that.store.clientX) * that.store.scaleX;
            const distanceY = (event.clientY - that.store.clientY) * that.store.scaleY;

            dataMatch.x = that.store.originX + distanceX;
            dataMatch.y = that.store.originY + distanceY;

            if (dataMatch.orginToX) {
                dataMatch.to.x = that.store.orginToX + distanceX;
                dataMatch.to.y = that.store.orginToY + distanceY;
            }
            // 重新绘制
            that.draw();
        }, {
            passive: false
        });
        document.addEventListener('mouseup', function () {
            that.store = null
            document.removeEventListener('mousemove', null)
            document.removeEventListener('mouseup', null)
        });
    }
    /** 判断是否在正方形内*/
    isPointInSquare(list, x, y) {
        // 两个矩形的绘制数据
        let i = 0;
        while (i < list.length) {
            this.gradeObj[i]?.forEach(item => {
                //长方体
                if (x >= item.x && x <= item.x + this.rectWidth && y >= item.y && y <= item.y + this.rectHeight) {
                    console.log('ooo', item)
                    this.store = item

                }
            })
            if (this.store) {
                break
            }
            i++
        }
    };
}

/**创建Rect 类用于创建每个组织的外层区域 并继承与父类 */

class Rect {
    /**ctx 画布 */
    constructor(context) {

    }
    createRect(context, x, y, prams) {
        const { width, height, background } = prams
        context.beginPath();
        context.fillStyle = background;
        context.fillRect(x, y, width, height);
    }
}

/**头像类 */
class Avatar {
    /**ctx 画布 */
    constructor(context) {

    }
    createAvatar(context, x, y, url, width, height, prams) {
        const { size, left, top } = prams
        context.save();
        const sizeX = size * 3;
        context.arc(x + size + left, y + size + top, size, 0, 2 * Math.PI);
        context.clip();
        context.drawImage(url, 0, 0, width, height, x + left, y + top, sizeX, sizeX);
        context.restore();
    }
}

/**创建文字类 */
class Text {
    /**ctx 画布 */
    constructor(context) {

    }
    createText(context, text, x, y, prams) {
        const { fontSize, color } = prams
        context.fillStyle = color || '#000'
        context.font = `${fontSize || '40px'} 宋体`
        context.fillText(text, x, y + 66 + 38);
    }
}