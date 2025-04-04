// wake-up-transition.js - 处理黑洞唤醒和导航跳转的独立逻辑文件
// 这个文件专门处理"叫醒瓦力"按钮点击后的唤醒动画和页面跳转逻辑
// 不会影响原始的blackhole-breathing.js和script.js文件

document.addEventListener('DOMContentLoaded', function() {
    console.log("唤醒跳转模块初始化");
    
    // 设置全局标志，表示自定义导航已激活
    window.customNavigationActive = true;
    
    // 获取关键元素
    const startChatBtn = document.getElementById('start-chat');
    const chatLink = document.getElementById('chat-link');
    const blackholeCore = document.querySelector('.blackhole-core');
    
    // 修复功能1: 点击"叫醒瓦力"按钮，先执行唤醒动画，再跳转到聊天页面
    if (startChatBtn) {
        // 移除原有事件监听器（如果有）
        const newStartBtn = startChatBtn.cloneNode(true);
        startChatBtn.parentNode.replaceChild(newStartBtn, startChatBtn);
        
        // 添加新的事件监听器
        newStartBtn.addEventListener('click', function(e) {
            // 防止默认行为和冒泡
            e.preventDefault();
            e.stopPropagation();
            
            console.log("点击叫醒瓦力按钮");
            
            // 防止连续点击
            this.disabled = true;
            
            // 如果黑洞已经唤醒，直接跳转到聊天页面
            const isAwake = blackholeCore && blackholeCore.classList.contains('awake');
            
            if (isAwake) {
                console.log("黑洞已经唤醒，直接跳转到聊天页面");
                if (chatLink) {
                    setTimeout(() => {
                        chatLink.click();
                    }, 100);
                }
            } else {
                console.log("黑洞未唤醒，先唤醒再跳转");
                // 触发自定义事件，通知blackhole-breathing.js执行唤醒
                const wakeUpEvent = new CustomEvent('wakeUpAndTransition');
                document.dispatchEvent(wakeUpEvent);
            }
            
            // 2秒后重新启用按钮
            setTimeout(() => {
                this.disabled = false;
            }, 2000);
        });
    }
    
    // 修复功能2: 监听导航链接点击，修复导航问题
    const navLinks = document.querySelectorAll('#sidebar a');
    navLinks.forEach(link => {
        if (link.id !== 'chat-link') { // 不修改聊天链接的行为
            // 移除原有事件监听器
            const newLink = link.cloneNode(true);
            link.parentNode.replaceChild(newLink, link);
            
            // 添加新的事件监听器
            newLink.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                console.log("点击导航到:", targetId);
                
                // 隐藏所有页面
                const sections = document.querySelectorAll('main section');
                sections.forEach(section => section.classList.add('hidden'));
                
                // 移除所有链接的活动状态
                navLinks.forEach(l => {
                    const newL = document.querySelector(`#sidebar a[href="${l.getAttribute('href')}"]`);
                    if (newL) {
                        newL.classList.remove('active', 'bg-gray-100');
                    }
                });
                
                // 为当前链接添加活动状态
                this.classList.add('active', 'bg-gray-100');
                
                // 显示目标页面
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.remove('hidden');
                    
                    // 特殊处理 - 每次进入柜me页面时刷新天气数据
                    if (targetId === 'cuime-section' && typeof fetchWeatherData === 'function') {
                        fetchWeatherData();
                    }
                    
                    // 触发导航事件
                    const navigatedEvent = new CustomEvent('navigated', {
                        detail: {
                            target: targetId
                        }
                    });
                    document.dispatchEvent(navigatedEvent);
                    
                    // 如果是首页，触发黑洞进入睡眠状态
                    if (targetId === 'home') {
                        setTimeout(() => {
                            console.log("返回首页，触发睡眠状态");
                            const sleepEvent = new CustomEvent('forceIdleState');
                            document.dispatchEvent(sleepEvent);
                        }, 100);
                    }
                }
                
                // 在移动设备上关闭侧边栏
                if (window.innerWidth < 768) {
                    const sidebar = document.getElementById('sidebar');
                    if (sidebar) {
                        sidebar.classList.add('-translate-x-full');
                    }
                }
            });
        }
    });
    
    // 修复功能3: 为黑洞呼吸添加额外的事件监听
    document.addEventListener('forceIdleState', function() {
        console.log("收到强制进入睡眠状态事件");
        if (typeof window.setIdleStateExternal === 'function') {
            window.setIdleStateExternal();
        } else {
            console.warn("setIdleStateExternal函数不存在，无法强制睡眠");
        }
    });
    
    console.log("唤醒跳转模块初始化完成，已接管页面导航");
}); 