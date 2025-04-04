// blackhole-breathing.js - 只有黑洞核心呼吸，不影响吸积盘和旋转线条
window.addEventListener('load', function() {
    // 获取黑洞核心元素（只对核心应用呼吸效果）
    const blackholeCore = document.querySelector('.blackhole-core');
    
    if (!blackholeCore) {
        console.error("找不到黑洞核心元素!");
        return;
    }

    console.log("初始化黑洞核心呼吸效果");

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
    
    // 获取眼睛元素，使其跟随黑洞核心缩放
    const eyes = document.querySelector('.eyes');
    
    console.log("黑洞核心和眼睛元素:", blackholeCore, eyes);

    // 保存原始样式
    const originalCoreTransform = getComputedStyle(blackholeCore).transform;
    const originalCoreScale = originalCoreTransform === 'none' ? '' : originalCoreTransform;

    // 将样式属性强制设置为!important
    function setImportantStyle(element, property, value) {
        if (element) {
            element.style.setProperty(property, value, 'important');
        }
    }

    // 为黑洞核心应用呼吸效果的缩放
    function applyScaleToCore(scale) {
        // 保持原有的居中定位，只添加缩放效果
        const transformValue = `translate(-50%, -50%) scale(${scale})`;
        
        // 应用到黑洞核心
        setImportantStyle(blackholeCore, 'transform', transformValue);
        
        // 不再修改眼睛的transform属性，让它保持原生动画
        // 眼睛容器会自动随着黑洞核心缩放，并保持原有动画
        
        // 确保眼睛高光有正确的大小比例
        const highlights = document.querySelectorAll('.highlight-main, .highlight-small');
        highlights.forEach(highlight => {
            // 通过调整高光透明度而不是大小来适应呼吸效果
            // 这样可以保持X形瞳孔设计的完整性
            const opacityScale = 0.8 + (scale - 1) * 0.4; // 根据缩放调整透明度
            setImportantStyle(highlight, 'opacity', opacityScale.toString());
        });
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

        // 应用当前缩放值到黑洞核心和眼睛
        applyScaleToCore(currentScale);
        
        // 继续动画循环
        animationId = requestAnimationFrame(breathe);
    }

    // 确保吸积盘与黑洞容器位置匹配
    function alignAccretionDisk() {
        const blackholeContainer = document.querySelector('.blackhole-container');
        const accretionDisk = document.querySelector('.accretion-disk');
        
        if (!blackholeContainer || !accretionDisk) {
            console.error("找不到黑洞容器或吸积盘元素!");
            return;
        }
        
        // 获取黑洞容器位置
        const containerRect = blackholeContainer.getBoundingClientRect();
        
        // 设置吸积盘位置与黑洞容器完全一致
        setImportantStyle(accretionDisk, 'position', 'absolute');
        setImportantStyle(accretionDisk, 'top', '50%');
        setImportantStyle(accretionDisk, 'left', '50%');
        setImportantStyle(accretionDisk, 'transform', 'translate(-50%, -50%)');
        
        console.log("已对齐吸积盘与黑洞容器");
    }

    // 启动黑洞呼吸动画
    setTimeout(() => {
        // 首先确保吸积盘与黑洞容器对齐
        alignAccretionDisk();
        
        // 确保黑洞核心的定位正确
        setImportantStyle(blackholeCore, 'position', 'absolute');
        setImportantStyle(blackholeCore, 'top', '50%');
        setImportantStyle(blackholeCore, 'left', '50%');
        setImportantStyle(blackholeCore, 'transform', 'translate(-50%, -50%)');
        
        console.log("启动黑洞核心呼吸动画");
        animationId = requestAnimationFrame(breathe);
    }, 1000); // 延迟一秒启动，确保页面加载完成

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