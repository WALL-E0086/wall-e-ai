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
    blackhole.style.animation = 'none';

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

    // 保存原始样式和位置信息
    const originalTransform = window.getComputedStyle(blackhole).transform;
    const isMatrix = originalTransform && originalTransform !== 'none' && originalTransform.includes('matrix');
    
    // 检查元素是否已经居中定位
    const style = window.getComputedStyle(blackhole);
    const isAlreadyCentered = style.position === 'absolute' && 
                             (style.left === '50%' || style.top === '50%') && 
                             style.transform.includes('translate');
    
    // 调整元素样式以支持动画
    if (!isAlreadyCentered) {
        console.log("调整黑洞元素定位");
        blackhole.style.position = 'absolute';
        blackhole.style.left = '50%';
        blackhole.style.top = '50%';
        // 保留原有的transform属性，只添加translate部分
        blackhole.style.transform = isMatrix 
            ? `${originalTransform} translate(-50%, -50%)` 
            : 'translate(-50%, -50%)';
    }

    // 应用初始缩放
    applyTransform(currentScale);

    // 应用变换，保留元素居中效果
    function applyTransform(scale) {
        if (isAlreadyCentered) {
            // 如果已经居中，只添加缩放效果
            blackhole.style.transform = `translate(-50%, -50%) scale(${scale})`;
        } else {
            // 否则需要组合原有变换
            blackhole.style.transform = isMatrix
                ? `${originalTransform} translate(-50%, -50%) scale(${scale})`
                : `translate(-50%, -50%) scale(${scale})`;
        }
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
        
        // 调试信息
        // console.log(`状态: ${state}, 缩放: ${currentScale.toFixed(3)}`);
        
        // 继续动画循环
        animationId = requestAnimationFrame(breathe);
    }

    // 启动动画
    console.log("启动黑洞呼吸动画");
    animationId = requestAnimationFrame(breathe);

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