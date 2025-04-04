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
        awakeScale: 1.5,        // 唤醒时的缩放比例
        idleTimeout: 5000,      // 恢复到待机状态的时间（毫秒）
        easing: (p) => p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2,  // 缓动函数
        awakeAnimationTime: 800, // 唤醒动画时间
        transitionToChat: 1200   // 苏醒后跳转到对话页面的延迟
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
    let isTransitioning = false;    // 是否正在执行过渡动画
    
    // 获取眼睛和鼻涕泡元素
    const eyes = document.querySelector('.eyes');
    const noseBubble = document.querySelector('.nose-bubble');
    const blushLeft = document.querySelector('.blush-left');
    const blushRight = document.querySelector('.blush-right');
    const dreamBubble = document.querySelector('.dream-bubble');
    const chatLink = document.getElementById('chat-link');
    
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

    // 在HTML加载后立即设置初始睡眠状态
    // 这样可以确保一开始就是睡眠状态，而不是先睁眼后闭眼
    if (eyes) {
        eyes.classList.add('sleeping-eyes');
    }
    
    if (noseBubble) {
        noseBubble.classList.add('active');
    }
    
    const zzzContainer = document.querySelector('.zzz-container');
    if (zzzContainer) {
        zzzContainer.style.display = 'block';
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
        // 如果正在过渡动画中，不执行
        if (isTransitioning) return;
        
        console.log("进入待机状态（睡眠）");
        isAwake = false;
        
        // 移除awake类名
        blackholeCore.classList.remove('awake');
        
        // 设置眼睛为闭眼状态
        if (eyes && !eyes.classList.contains('sleeping-eyes')) {
            eyes.classList.add('sleeping-eyes');
        }
        
        // 显示鼻涕泡
        if (noseBubble && !noseBubble.classList.contains('active')) {
            noseBubble.classList.add('active');
        }
        
        // 显示ZZZ符号
        if (zzzContainer) {
            zzzContainer.style.display = 'block';
        }
        
        // 移除脸红效果
        if (blushLeft) blushLeft.classList.remove('show');
        if (blushRight) blushRight.classList.remove('show');
        
        // 启用对话气泡
        enableDreamBubble();
        
        // 确保当前没有呼吸动画在运行，再启动新的
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // 恢复呼吸动画
        stateStartTime = 0;
        state = 'inhale';
        currentScale = config.minScale;
        applyScaleToCore(currentScale); // 立即应用初始比例
        animationId = requestAnimationFrame(breathe);
    }
    
    // 苏醒动画效果
    function animateWakeUp(callback) {
        isTransitioning = true;
        const startScale = config.minScale;
        const targetScale = config.awakeScale;
        const startTime = performance.now();
        
        // 添加awake类名以保持放大状态
        blackholeCore.classList.add('awake');
        
        function animate(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / config.awakeAnimationTime, 1);
            
            // 使用缓动函数使动画更自然
            const easedProgress = config.easing(progress);
            const newScale = startScale + (targetScale - startScale) * easedProgress;
            
            // 应用缩放
            applyScaleToCore(newScale);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                isTransitioning = false;
                if (typeof callback === 'function') {
                    callback();
                }
            }
        }
        
        requestAnimationFrame(animate);
    }
    
    // 设置唤醒状态
    function setAwakeState(navigateToChat = false) {
        // 如果正在过渡动画中，不执行
        if (isTransitioning) return;
        
        console.log("唤醒黑洞！", "是否将跳转:", navigateToChat);
        isAwake = true;
        tapCount = 1; // 初始化点击计数
        
        // 清除当前待机超时
        if (idleTimeoutId) {
            clearTimeout(idleTimeoutId);
            idleTimeoutId = null;
        }
        
        // 设置新的待机超时 (除非要导航到聊天页面)
        if (!navigateToChat) {
            console.log("设置5秒后返回睡眠状态的计时器");
            idleTimeoutId = setTimeout(setIdleState, config.idleTimeout);
        } else {
            console.log("跳转模式，不设置自动返回睡眠");
        }
        
        // 移除睡眠状态
        if (eyes) {
            eyes.classList.remove('sleeping-eyes');
        }
        
        // 重置瞳孔位置到中心
        resetPupilsPosition();
        
        // 隐藏ZZZ符号
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
        
        // 播放唤醒动画
        animateWakeUp(() => {
            // 如果需要导航到聊天页面，则在动画完成后延迟跳转
            if (navigateToChat && chatLink) {
                setTimeout(() => {
                    console.log("唤醒动画完成，执行跳转");
                    chatLink.click();
                }, config.transitionToChat);
            }
        });
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
    
    // 处理点击黑洞的事件 - 只唤醒黑洞，不跳转
    function handleBlackholeClick(e) {
        // 阻止事件冒泡
        e.stopPropagation();
        
        // 如果正在过渡动画中，不执行
        if (isTransitioning) return;
        
        if (!isAwake) {
            // 如果当前不是唤醒状态，则唤醒（无需跳转）
            setAwakeState(false); 
        } else {
            // 如果已经唤醒，增加点击次数
            tapCount++;
            
            // 清除当前待机超时
            if (idleTimeoutId) {
                clearTimeout(idleTimeoutId);
                idleTimeoutId = null;
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
        // 隐藏整个对话气泡容器
        const bubbleContainer = document.getElementById('dream-bubble-container');
        if (bubbleContainer) {
            bubbleContainer.style.display = 'none';
        }
        
        // 隐藏当前显示的气泡
        const bubble = document.querySelector('.dream-bubble');
        if (bubble) {
            bubble.classList.remove('auto-animate', 'show');
            bubble.style.opacity = '0';
            bubble.style.transform = 'scale(0)';
        }
        
        // 隐藏气泡文本
        const bubbleText = document.getElementById('bubble-text');
        if (bubbleText) {
            bubbleText.classList.remove('auto-animate', 'show');
            bubbleText.style.opacity = '0';
        }
    }

    // 呼吸动画帧
    function breathe(timestamp) {
        // 如果状态开始时间未初始化，则初始化
        if (stateStartTime === 0) {
            stateStartTime = timestamp;
        }
        
        // 计算状态持续时间
        const stateDuration = timestamp - stateStartTime;
        
        // 根据当前状态和持续时间计算缩放比例
        switch (state) {
            case 'inhale':
                if (stateDuration < config.inhaleTime) {
                    // 吸气阶段 - 从小到大
                    const progress = stateDuration / config.inhaleTime;
                    const easedProgress = config.easing(progress);
                    currentScale = config.minScale + (config.maxScale - config.minScale) * easedProgress;
                } else {
                    // 吸气完成，进入暂停阶段
                    state = 'pause-inhaled';
                    stateStartTime = timestamp;
                    currentScale = config.maxScale;
                }
                break;
                
            case 'pause-inhaled':
                if (stateDuration >= config.pauseTime) {
                    // 暂停完成，进入呼气阶段
                    state = 'exhale';
                    stateStartTime = timestamp;
                }
                break;
                
            case 'exhale':
                if (stateDuration < config.exhaleTime) {
                    // 呼气阶段 - 从大到小
                    const progress = stateDuration / config.exhaleTime;
                    const easedProgress = config.easing(progress);
                    currentScale = config.maxScale - (config.maxScale - config.minScale) * easedProgress;
                } else {
                    // 呼气完成，进入暂停阶段
                    state = 'pause-exhaled';
                    stateStartTime = timestamp;
                    currentScale = config.minScale;
                }
                break;
                
            case 'pause-exhaled':
                if (stateDuration >= config.pauseTime) {
                    // 暂停完成，重新开始呼吸周期
                    state = 'inhale';
                    stateStartTime = timestamp;
                }
                break;
        }
        
        // 应用当前缩放比例
        applyScaleToCore(currentScale);
        
        // 继续下一帧
        animationId = requestAnimationFrame(breathe);
    }

    // 确保吸积盘与黑洞容器位置匹配
    function alignAccretionDisk() {
        const accretionDisk = document.querySelector('.accretion-disk');
        
        if (!blackholeContainer || !accretionDisk) {
            console.error("找不到黑洞容器或吸积盘元素!");
            return;
        }
        
        // 设置吸积盘位置与黑洞容器完全一致
        setImportantStyle(accretionDisk, 'position', 'absolute');
        setImportantStyle(accretionDisk, 'top', '50%');
        setImportantStyle(accretionDisk, 'left', '50%');
        setImportantStyle(accretionDisk, 'transform', 'translate(-50%, -50%)');
        
        console.log("已对齐吸积盘与黑洞容器");
    }

    // 初始化状态
    setIdleState();
    
    // 监听唤醒并跳转的自定义事件 - 处理"叫醒瓦力"按钮点击
    document.addEventListener('wakeUpAndTransition', function(e) {
        console.log("收到唤醒并跳转事件");
        
        // 如果正在过渡动画中，不执行
        if (isTransitioning) return;
        
        // 无论是否已经唤醒，都执行唤醒并跳转
        // 如果已经唤醒，会跳过动画直接跳转
        setAwakeState(true);
    });
    
    // 添加点击事件监听器 - 只对黑洞核心生效
    if (blackholeCore) {
        blackholeCore.addEventListener('click', handleBlackholeClick);
        blackholeCore.style.cursor = 'pointer';
    }
    
    // 确保黑洞容器也可以点击
    if (blackholeContainer) {
        blackholeContainer.addEventListener('click', function(e) {
            // 只有当点击事件的目标是容器本身时才触发，避免冒泡导致的重复触发
            if (e.target === blackholeContainer) {
                handleBlackholeClick(e);
            }
        });
        blackholeContainer.style.cursor = 'pointer';
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
        
        // 确保当前没有动画在运行
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        // 启动新的呼吸动画
        stateStartTime = 0;
        state = 'inhale';
        currentScale = config.minScale;
        animationId = requestAnimationFrame(breathe);
    }, 1000); // 延迟一秒启动，确保页面加载完成

    // 监听导航事件 - 确保从其他页面回到首页时黑洞处于睡眠状态
    document.addEventListener('navigated', function(e) {
        if (!e.detail || !e.detail.target) return;
        
        const targetSection = e.detail.target;
        console.log("导航到:", targetSection);
        
        // 如果不是导航到home，则不处理
        if (targetSection !== 'home') return;
        
        // 如果导航到首页，设置为睡眠状态
        // 允许稍微延迟执行，确保其他导航逻辑已完成
        setTimeout(() => {
            if (targetSection === 'home') {
                setIdleState();
            }
        }, 100);
    });

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
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        if (idleTimeoutId) {
            clearTimeout(idleTimeoutId);
            idleTimeoutId = null;
        }
        if (blushTimeout) {
            clearTimeout(blushTimeout);
            blushTimeout = null;
        }
    });

    // 在控制台打印初始化完成信息
    console.log("黑洞呼吸和互动效果初始化完成");
});