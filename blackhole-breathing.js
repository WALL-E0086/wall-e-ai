// blackhole-breathing.js - 完整实现黑洞呼吸效果
window.addEventListener('load', function() {
    // 获取黑洞元素
    const blackhole = document.querySelector('.blackhole-container');
    if (!blackhole) {
        console.error("找不到黑洞元素!");
        return;
    }

    console.log("初始化黑洞呼吸效果");

    // 禁用可能存在的CSS动画
    blackhole.style.animation = 'none !important';

    // 配置参数
    const config = {
        inhaleTime: 1500,       // 吸气时间 (ms)
        exhaleTime: 2000,       // 呼气时间 (ms)
        pauseTime: 500,         // 暂停时间 (ms)
        minScale: 1,            // 最小缩放比例
        maxScale: 1.12,         // 最大缩放比例
        easing: (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2  // 缓动函数
    };

    // 状态管理
    let state = 'inhale';           // 初始状态: 吸气
    let currentScale = config.minScale;  // 当前缩放比例
    let animationId = null;         // 动画帧ID
    let stateStartTime = 0;         // 当前状态开始时间

    // 获取黑洞内部元素，以确保它们不受呼吸效果的影响
    const blackholeCore = document.querySelector('.blackhole-core');
    const accretionDisk = document.querySelector('.accretion-disk');
    const eyes = document.querySelector('.eyes');

    console.log("黑洞内部元素:", blackholeCore, accretionDisk, eyes);

    // 保存原始样式和位置信息
    let originalTransform = window.getComputedStyle(blackhole).transform;
    // 如果transform是none，设置为空字符串避免后续拼接出错
    if (originalTransform === 'none') originalTransform = '';
    
    const isMatrix = originalTransform && originalTransform !== 'none' && originalTransform.includes('matrix');
    
    // 检查元素是否已经居中定位
    const style = window.getComputedStyle(blackhole);
    const isAlreadyCentered = style.position === 'absolute' && 
                             (style.left === '50%' || style.top === '50%') && 
                             style.transform.includes('translate');
    
    console.log("原始transform:", originalTransform);
    console.log("已经居中:", isAlreadyCentered);

    // 将样式属性强制设置为!important
    function setImportantStyle(element, property, value) {
        element.style.setProperty(property, value, 'important');
    }

    // 为黑洞元素应用transform
    function applyTransform(scale) {
        // 构建包含缩放的transform字符串
        let transformValue;
        
        if (isAlreadyCentered) {
            // 如果已经居中，保留translate，添加缩放
            // 正则表达式找到translate部分，然后添加scale
            const translateMatch = originalTransform.match(/translate\([^)]+\)/);
            const translatePart = translateMatch ? translateMatch[0] : 'translate(-50%, -50%)';
            transformValue = `${translatePart} scale(${scale})`;
        } else {
            // 如果没有居中，添加居中和缩放
            transformValue = isMatrix
                ? `${originalTransform} translate(-50%, -50%) scale(${scale})`
                : `translate(-50%, -50%) scale(${scale})`;
        }
        
        console.log("应用transform:", transformValue);
        setImportantStyle(blackhole, 'transform', transformValue);
    }

    // 呼吸动画函数
    function breathe(timestamp) {
        if (!stateStartTime) stateStartTime = timestamp;
        const elapsed = timestamp - stateStartTime;

        switch (state) {
            case 'inhale':
                if (elapsed < config.inhaleTime) {
                    // 吸气过程中，缩放从小变大
                    const progress = elapsed / config.inhaleTime;
                    currentScale = config.minScale + config.easing(progress) * (config.maxScale - config.minScale);
                } else {
                    // 吸气完成，切换到暂停状态
                    state = 'pause-after-inhale';
                    stateStartTime = timestamp;
                    currentScale = config.maxScale;
                }
                break;
                
            case 'pause-after-inhale':
                if (elapsed >= config.pauseTime) {
                    // 暂停结束，切换到呼气状态
                    state = 'exhale';
                    stateStartTime = timestamp;
                }
                break;
                
            case 'exhale':
                if (elapsed < config.exhaleTime) {
                    // 呼气过程中，缩放从大变小
                    const progress = elapsed / config.exhaleTime;
                    currentScale = config.maxScale - config.easing(progress) * (config.maxScale - config.minScale);
                } else {
                    // 呼气完成，切换到暂停状态
                    state = 'pause-after-exhale';
                    stateStartTime = timestamp;
                    currentScale = config.minScale;
                }
                break;
                
            case 'pause-after-exhale':
                if (elapsed >= config.pauseTime) {
                    // 暂停结束，重新开始吸气
                    state = 'inhale';
                    stateStartTime = timestamp;
                }
                break;
        }

        // 应用当前缩放值
        applyTransform(currentScale);
        
        // 继续动画循环
        animationId = requestAnimationFrame(breathe);
    }

    // 启动黑洞呼吸动画前的初始化设置
    setTimeout(() => {
        // 确保position和定位属性设置正确
        setImportantStyle(blackhole, 'position', 'absolute');
        setImportantStyle(blackhole, 'left', '50%');
        setImportantStyle(blackhole, 'top', '30%');
        setImportantStyle(blackhole, 'animation', 'none');
        
        console.log("启动黑洞呼吸动画");
        animationId = requestAnimationFrame(breathe);
    }, 1000); // 延迟一秒启动，确保页面其他元素已加载

    // 当页面隐藏或关闭时取消动画
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else if (document.visibilityState === 'visible' && !animationId) {
            // 页面重新可见时恢复动画
            stateStartTime = 0;
            animationId = requestAnimationFrame(breathe);
        }
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
    });
});