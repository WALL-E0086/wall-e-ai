// blackhole-breathing.js - 只有黑洞核心呼吸，不影响吸积盘和旋转线条
window.addEventListener('load', function() {
    // 获取黑洞核心元素（只对核心应用呼吸效果）
    const blackholeCore = document.querySelector('.blackhole-core');
    const blackholeContainer = document.querySelector('.blackhole-container');
    
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
        awakeScale: 1.3,        // 唤醒时的缩放比例
        idleTimeout: 5000,      // 恢复到待机状态的时间（毫秒）
        easing: (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2  // 缓动函数
    };

    // 状态管理
    let state = 'inhale';           // 初始状态: 吸气
    let currentScale = config.minScale;  // 当前缩放比例
    let animationId = null;         // 动画帧ID
    let stateStartTime = 0;         // 当前状态开始时间
    let blushTimeout = null;        // 脸红效果的超时ID
    let idleTimeoutId = null;       // 恢复待机状态的超时ID
    let isAwake = false;            // 是否处于唤醒状态
    let tapCount = 0;               // 点击次数，用于脸红效果
    
    // 获取眼睛和鼻涕泡元素
    const eyes = document.querySelector('.eyes');
    const noseBubble = document.querySelector('.nose-bubble');
    const blushLeft = document.querySelector('.blush-left');
    const blushRight = document.querySelector('.blush-right');
    const dreamBubble = document.querySelector('.dream-bubble');
    
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
        
        // 确保眼睛高光有正确的大小比例
        const highlights = document.querySelectorAll('.highlight-main, .highlight-small');
        highlights.forEach(highlight => {
            // 通过调整高光透明度而不是大小来适应呼吸效果
            // 这样可以保持X形瞳孔设计的完整性
            const opacityScale = 0.8 + (scale - 1) * 0.4; // 根据缩放调整透明度
            setImportantStyle(highlight, 'opacity', opacityScale.toString());
        });
    }

    // 设置待机状态（睡眠状态）
    function setIdleState() {
        console.log("进入待机状态（睡眠）");
        isAwake = false;
        
        // 设置眼睛为闭眼状态
        eyes.classList.add('sleeping-eyes');
        
        // 显示鼻涕泡
        if (noseBubble) {
            noseBubble.classList.add('active');
        }
        
        // 显示ZZZ符号
        const zzzContainer = document.querySelector('.zzz-container');
        if (zzzContainer) {
            zzzContainer.style.display = 'block';
        }
        
        // 移除脸红效果
        if (blushLeft) blushLeft.classList.remove('show');
        if (blushRight) blushRight.classList.remove('show');
        
        // 启用对话气泡
        enableDreamBubble();
        
        // 恢复呼吸动画
        if (!animationId) {
            stateStartTime = 0;
            animationId = requestAnimationFrame(breathe);
        }
    }
    
    // 设置唤醒状态
    function setAwakeState() {
        console.log("唤醒黑洞！");
        isAwake = true;
        tapCount = 1; // 初始化点击计数
        
        // 清除当前待机超时
        if (idleTimeoutId) {
            clearTimeout(idleTimeoutId);
        }
        
        // 设置新的待机超时
        idleTimeoutId = setTimeout(setIdleState, config.idleTimeout);
        
        // 移除睡眠状态
        eyes.classList.remove('sleeping-eyes');
        
        // 重置瞳孔位置到中心
        resetPupilsPosition();
        
        // 隐藏ZZZ符号
        const zzzContainer = document.querySelector('.zzz-container');
        if (zzzContainer) {
            zzzContainer.style.display = 'none';
        }
        
        // 移除鼻涕泡并播放破裂动画
        if (noseBubble && noseBubble.classList.contains('active')) {
            noseBubble.classList.remove('active');
            noseBubble.classList.add('nose-bubble-pop');
            // 动画完成后移除破裂类
            setTimeout(() => {
                noseBubble.classList.remove('nose-bubble-pop');
            }, 500);
        }
        
        // 停止对话气泡
        disableDreamBubble();
        
        // 暂停呼吸动画
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // 应用唤醒时的缩放效果
        applyScaleToCore(config.awakeScale);
    }
    
    // 重置瞳孔位置到中心
    function resetPupilsPosition() {
        const pupils = document.querySelectorAll('.pupil');
        pupils.forEach(pupil => {
            // 暂停动画
            pupil.style.animationPlayState = 'paused';
            
            // 重置位置
            pupil.style.transform = 'translate(0, 0)';
            
            // 延迟后重新启动动画
            setTimeout(() => {
                pupil.style.animationPlayState = 'running';
            }, 100);
        });
    }
    
    // 处理点击黑洞的事件
    function handleBlackholeClick() {
        if (!isAwake) {
            // 如果当前不是唤醒状态，则唤醒
            setAwakeState();
        } else {
            // 如果已经唤醒，增加点击次数
            tapCount++;
            
            // 清除当前待机超时
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
            }
            
            // 设置新的待机超时
            idleTimeoutId = setTimeout(setIdleState, config.idleTimeout);
            
            // 达到点击阈值时显示脸红效果
            if (tapCount >= 3) {
                showBlush();
            }
        }
    }
    
    // 显示脸红效果
    function showBlush() {
        console.log("显示脸红效果");
        
        // 显示脸红效果
        if (blushLeft) blushLeft.classList.add('show');
        if (blushRight) blushRight.classList.add('show');
        
        // 清除之前的脸红超时
        if (blushTimeout) {
            clearTimeout(blushTimeout);
        }
        
        // 设置脸红持续时间
        blushTimeout = setTimeout(() => {
            if (blushLeft) blushLeft.classList.remove('show');
            if (blushRight) blushRight.classList.remove('show');
        }, 2000); // 2秒后脸红消失
    }
    
    // 启用对话气泡
    function enableDreamBubble() {
        // 找到对话气泡相关的脚本并重新启用
        const bubbleContainer = document.getElementById('dream-bubble-container');
        if (bubbleContainer) {
            bubbleContainer.style.display = 'flex';
        }
    }
    
    // 禁用对话气泡
    function disableDreamBubble() {
        // 隐藏当前显示的气泡
        const bubble = document.querySelector('.dream-bubble');
        if (bubble) {
            bubble.classList.remove('auto-animate', 'show');
        }
        
        // 隐藏气泡容器
        const bubbleContainer = document.getElementById('dream-bubble-container');
        if (bubbleContainer) {
            bubbleContainer.style.display = 'none';
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

        // 应用当前缩放值到黑洞核心和眼睛
        applyScaleToCore(currentScale);
        
        // 继续动画循环
        animationId = requestAnimationFrame(breathe);
    }

    // 确保吸积盘与黑洞容器位置匹配
    function alignAccretionDisk() {
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

    // 添加点击事件监听器
    if (blackholeCore) {
        blackholeCore.addEventListener('click', handleBlackholeClick);
    }
    
    if (blackholeContainer) {
        blackholeContainer.addEventListener('click', handleBlackholeClick);
    }
    
    // 也为"叫醒瓦力"按钮添加事件监听
    const startChatButton = document.getElementById('start-chat');
    if (startChatButton) {
        startChatButton.addEventListener('click', setAwakeState);
    }

    // 启动黑洞呼吸动画并设置为待机状态
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
        
        // 默认进入待机状态
        setIdleState();
    }, 1000); // 延迟一秒启动，确保页面加载完成

    // 当页面隐藏或关闭时取消动画
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        } else if (document.visibilityState === 'visible' && !animationId && !isAwake) {
            // 页面重新可见时恢复动画（如果处于待机状态）
            stateStartTime = 0;
            animationId = requestAnimationFrame(breathe);
        }
    });

    // 页面卸载时清理
    window.addEventListener('beforeunload', () => {
        if (animationId) cancelAnimationFrame(animationId);
        if (idleTimeoutId) clearTimeout(idleTimeoutId);
        if (blushTimeout) clearTimeout(blushTimeout);
    });
});