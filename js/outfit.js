// 服装推荐控制器
const OutfitController = {
    // 初始化
    init() {
        this.updateOutfitUI();
        this.bindEvents();
        
        // 检查用户信息是否完整，如果不完整则显示提示
        this.checkUserProfile();
    },
    
    // 绑定事件
    bindEvents() {
        // 刷新推荐按钮点击事件
        const refreshBtn = document.querySelector('#refresh-outfit');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.generateOutfitRecommendation();
            });
        }
        
        // 保存到衣橱按钮点击事件
        const saveBtn = document.querySelector('#save-outfit');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCurrentOutfit();
            });
        }
        
        // 监听天气数据更新
        window.addEventListener('weatherupdate', () => {
            this.generateOutfitRecommendation();
        });
        
        // 监听用户信息更新
        window.addEventListener('userprofileupdate', () => {
            this.checkUserProfile();
            this.generateOutfitRecommendation();
        });
    },
    
    // 检查用户信息是否完整
    checkUserProfile() {
        const user = app.state.user || {};
        const profileCompleteStatus = document.querySelector('#profile-complete-status');
        const profileWarning = document.querySelector('#profile-warning');
        
        const requiredFields = ['gender', 'height', 'weight', 'age'];
        const missingFields = requiredFields.filter(field => !user[field]);
        
        if (missingFields.length > 0) {
            // 用户信息不完整
            if (profileCompleteStatus) {
                profileCompleteStatus.textContent = '不完整';
                profileCompleteStatus.classList.remove('text-green-500');
                profileCompleteStatus.classList.add('text-red-500');
            }
            
            if (profileWarning) {
                profileWarning.classList.remove('hidden');
            }
        } else {
            // 用户信息完整
            if (profileCompleteStatus) {
                profileCompleteStatus.textContent = '完整';
                profileCompleteStatus.classList.remove('text-red-500');
                profileCompleteStatus.classList.add('text-green-500');
            }
            
            if (profileWarning) {
                profileWarning.classList.add('hidden');
            }
        }
    },
    
    // 更新服装推荐UI
    updateOutfitUI() {
        const outfit = app.state.outfit?.current || {};
        
        if (!outfit.top && !outfit.bottom && !outfit.outerwear) {
            // 如果没有推荐，生成一个新的
            this.generateOutfitRecommendation();
            return;
        }
        
        // 更新上装
        const topEl = document.querySelector('#outfit-top');
        if (topEl && outfit.top) {
            topEl.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${outfit.top.image || this.getDefaultImage('top')}" alt="${outfit.top.name}" class="w-20 h-20 object-contain mb-2">
                    <span class="text-sm font-medium">${outfit.top.name || '未指定'}</span>
                    <span class="text-xs text-gray-500">${outfit.top.color || ''}</span>
                </div>
            `;
        }
        
        // 更新下装
        const bottomEl = document.querySelector('#outfit-bottom');
        if (bottomEl && outfit.bottom) {
            bottomEl.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${outfit.bottom.image || this.getDefaultImage('bottom')}" alt="${outfit.bottom.name}" class="w-20 h-20 object-contain mb-2">
                    <span class="text-sm font-medium">${outfit.bottom.name || '未指定'}</span>
                    <span class="text-xs text-gray-500">${outfit.bottom.color || ''}</span>
                </div>
            `;
        }
        
        // 更新外套
        const outerwearEl = document.querySelector('#outfit-outerwear');
        if (outerwearEl && outfit.outerwear) {
            outerwearEl.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${outfit.outerwear.image || this.getDefaultImage('outerwear')}" alt="${outfit.outerwear.name}" class="w-20 h-20 object-contain mb-2">
                    <span class="text-sm font-medium">${outfit.outerwear.name || '未指定'}</span>
                    <span class="text-xs text-gray-500">${outfit.outerwear.color || ''}</span>
                </div>
            `;
        } else if (outerwearEl) {
            outerwearEl.innerHTML = `
                <div class="flex flex-col items-center text-gray-400">
                    <img src="${this.getDefaultImage('outerwear')}" alt="无外套" class="w-20 h-20 object-contain mb-2 opacity-50">
                    <span class="text-sm">今天不需要外套</span>
                </div>
            `;
        }
        
        // 更新鞋子
        const shoesEl = document.querySelector('#outfit-shoes');
        if (shoesEl && outfit.shoes) {
            shoesEl.innerHTML = `
                <div class="flex flex-col items-center">
                    <img src="${outfit.shoes.image || this.getDefaultImage('shoes')}" alt="${outfit.shoes.name}" class="w-20 h-20 object-contain mb-2">
                    <span class="text-sm font-medium">${outfit.shoes.name || '未指定'}</span>
                    <span class="text-xs text-gray-500">${outfit.shoes.color || ''}</span>
                </div>
            `;
        }
        
        // 更新配饰
        const accessoriesEl = document.querySelector('#outfit-accessories');
        if (accessoriesEl && outfit.accessories && outfit.accessories.length > 0) {
            accessoriesEl.innerHTML = outfit.accessories.map(accessory => `
                <div class="flex flex-col items-center mr-4 mb-2">
                    <img src="${accessory.image || this.getDefaultImage('accessory')}" alt="${accessory.name}" class="w-12 h-12 object-contain mb-1">
                    <span class="text-xs font-medium">${accessory.name || '未指定'}</span>
                </div>
            `).join('');
        } else if (accessoriesEl) {
            accessoriesEl.innerHTML = `<div class="text-gray-400 text-xs">没有推荐配饰</div>`;
        }
        
        // 更新建议
        const suggestionEl = document.querySelector('#outfit-suggestion');
        if (suggestionEl && outfit.suggestions && outfit.suggestions.length > 0) {
            suggestionEl.innerHTML = outfit.suggestions.map(suggestion => 
                `<div class="text-sm text-gray-700 mb-1">• ${suggestion}</div>`
            ).join('');
        }
    },
    
    // 生成服装推荐
    generateOutfitRecommendation() {
        // 检查是否有天气数据
        if (!app.state.weather || !app.state.weather.current) {
            this.showNotification('无法生成推荐，天气数据不可用');
            return;
        }
        
        const weather = app.state.weather.current;
        const lifeIndex = app.state.weather.lifeIndex || {};
        const user = app.state.user || {};
        
        // 获取用户衣橱
        const wardrobe = app.state.wardrobe || {
            tops: [],
            bottoms: [],
            outerwear: [],
            shoes: [],
            accessories: []
        };
        
        // 如果用户没有足够的衣物，使用默认推荐
        if (wardrobe.tops.length === 0 || wardrobe.bottoms.length === 0) {
            this.generateDefaultRecommendation(weather, lifeIndex, user);
            return;
        }
        
        // 基于天气过滤合适的衣物
        const temp = weather.temperature;
        let suitableTops = [];
        let suitableBottoms = [];
        let suitableOuterwear = [];
        let suitableShoes = [];
        let suitableAccessories = [];
        
        // 根据温度过滤上衣
        if (temp >= 25) {
            // 夏季
            suitableTops = wardrobe.tops.filter(top => top.season?.includes('夏') || top.type?.includes('短袖'));
        } else if (temp >= 15) {
            // 春秋
            suitableTops = wardrobe.tops.filter(top => top.season?.includes('春') || top.season?.includes('秋') || top.type?.includes('长袖'));
        } else {
            // 冬季
            suitableTops = wardrobe.tops.filter(top => top.season?.includes('冬') || top.type?.includes('毛衣') || top.type?.includes('卫衣'));
        }
        
        // 根据温度过滤下装
        if (temp >= 25) {
            // 夏季
            suitableBottoms = wardrobe.bottoms.filter(bottom => bottom.season?.includes('夏') || bottom.type?.includes('短裤') || bottom.type?.includes('短裙'));
        } else if (temp >= 15) {
            // 春秋
            suitableBottoms = wardrobe.bottoms.filter(bottom => bottom.season?.includes('春') || bottom.season?.includes('秋') || bottom.type?.includes('长裤'));
        } else {
            // 冬季
            suitableBottoms = wardrobe.bottoms.filter(bottom => bottom.season?.includes('冬') || bottom.type?.includes('厚裤') || bottom.type?.includes('牛仔裤'));
        }
        
        // 根据温度确定是否需要外套
        let needOuterwear = temp < 20;
        if (needOuterwear) {
            if (temp < 5) {
                // 寒冷需要厚外套
                suitableOuterwear = wardrobe.outerwear.filter(outerwear => 
                    outerwear.season?.includes('冬') || 
                    outerwear.type?.includes('羽绒') || 
                    outerwear.type?.includes('棉服')
                );
            } else if (temp < 15) {
                // 较冷需要中厚外套
                suitableOuterwear = wardrobe.outerwear.filter(outerwear => 
                    outerwear.season?.includes('春') || 
                    outerwear.season?.includes('秋') || 
                    outerwear.type?.includes('夹克') || 
                    outerwear.type?.includes('风衣')
                );
            } else {
                // 微凉需要轻薄外套
                suitableOuterwear = wardrobe.outerwear.filter(outerwear => 
                    outerwear.season?.includes('春') || 
                    outerwear.season?.includes('秋') || 
                    outerwear.type?.includes('轻薄') || 
                    outerwear.type?.includes('外套')
                );
            }
        }
        
        // 根据天气状况过滤鞋子
        if (weather.condition === 'rain' || weather.condition === 'snow') {
            // 雨雪天气
            suitableShoes = wardrobe.shoes.filter(shoe => 
                shoe.type?.includes('雨鞋') || 
                shoe.type?.includes('靴子') || 
                shoe.waterproof
            );
        } else {
            // 晴天
            suitableShoes = wardrobe.shoes;
        }
        
        // 根据天气状况推荐配饰
        if (weather.condition === 'clear' && temp > 20) {
            // 晴天炎热
            suitableAccessories = wardrobe.accessories.filter(acc => 
                acc.type?.includes('帽子') || 
                acc.type?.includes('墨镜') || 
                acc.type?.includes('扇子')
            );
        } else if (weather.condition === 'rain') {
            // 雨天
            suitableAccessories = wardrobe.accessories.filter(acc => 
                acc.type?.includes('雨伞')
            );
        } else if (temp < 10) {
            // 寒冷天气
            suitableAccessories = wardrobe.accessories.filter(acc => 
                acc.type?.includes('围巾') || 
                acc.type?.includes('手套') || 
                acc.type?.includes('帽子')
            );
        }
        
        // 如果过滤后没有合适的衣物，回退到原始列表
        if (suitableTops.length === 0) suitableTops = wardrobe.tops;
        if (suitableBottoms.length === 0) suitableBottoms = wardrobe.bottoms;
        if (needOuterwear && suitableOuterwear.length === 0) suitableOuterwear = wardrobe.outerwear;
        if (suitableShoes.length === 0) suitableShoes = wardrobe.shoes;
        
        // 随机选择衣物
        const selectedTop = this.getRandomItem(suitableTops);
        const selectedBottom = this.getRandomItem(suitableBottoms);
        const selectedOuterwear = needOuterwear ? this.getRandomItem(suitableOuterwear) : null;
        const selectedShoes = this.getRandomItem(suitableShoes);
        
        // 选择1-2个配饰
        let selectedAccessories = [];
        if (suitableAccessories.length > 0) {
            const accessoryCount = Math.min(Math.floor(Math.random() * 2) + 1, suitableAccessories.length);
            for (let i = 0; i < accessoryCount; i++) {
                const accessory = this.getRandomItem(suitableAccessories.filter(a => !selectedAccessories.includes(a)));
                if (accessory) {
                    selectedAccessories.push(accessory);
                }
            }
        }
        
        // 生成穿着建议
        const suggestions = this.generateSuggestions(weather, selectedTop, selectedBottom, selectedOuterwear);
        
        // 更新全局状态
        app.state.outfit = {
            current: {
                top: selectedTop,
                bottom: selectedBottom,
                outerwear: selectedOuterwear,
                shoes: selectedShoes,
                accessories: selectedAccessories,
                suggestions: suggestions,
                date: new Date(),
                weather: {
                    temperature: weather.temperature,
                    condition: weather.condition
                }
            },
            history: app.state.outfit?.history || []
        };
        
        // 保存到本地存储
        app.utils.storage.save('outfit', app.state.outfit);
        
        // 更新UI
        this.updateOutfitUI();
        
        // 显示成功提示
        this.showNotification('已生成新的穿搭推荐');
    },
    
    // 使用默认数据生成推荐
    generateDefaultRecommendation(weather, lifeIndex, user) {
        const temp = weather.temperature;
        const condition = weather.condition;
        const gender = user.gender || 'neutral';
        
        // 基于温度和性别推荐服装
        let top, bottom, outerwear, shoes, accessories = [];
        
        // 上装推荐
        if (temp >= 25) {
            top = gender === 'female' 
                ? { name: 'T恤', type: '短袖', color: '白色', season: '夏' }
                : { name: 'T恤', type: '短袖', color: '蓝色', season: '夏' };
        } else if (temp >= 15) {
            top = gender === 'female'
                ? { name: '长袖衬衫', type: '长袖', color: '粉色', season: '春秋' }
                : { name: '长袖T恤', type: '长袖', color: '灰色', season: '春秋' };
        } else {
            top = gender === 'female'
                ? { name: '针织衫', type: '毛衣', color: '米色', season: '冬' }
                : { name: '卫衣', type: '卫衣', color: '黑色', season: '冬' };
        }
        
        // 下装推荐
        if (temp >= 25) {
            bottom = gender === 'female'
                ? { name: '短裙', type: '短裙', color: '蓝色', season: '夏' }
                : { name: '短裤', type: '短裤', color: '卡其色', season: '夏' };
        } else if (temp >= 15) {
            bottom = gender === 'female'
                ? { name: '牛仔裤', type: '长裤', color: '浅蓝色', season: '春秋' }
                : { name: '休闲裤', type: '长裤', color: '深蓝色', season: '春秋' };
        } else {
            bottom = gender === 'female'
                ? { name: '加绒牛仔裤', type: '厚裤', color: '深蓝色', season: '冬' }
                : { name: '加绒休闲裤', type: '厚裤', color: '黑色', season: '冬' };
        }
        
        // 外套推荐
        if (temp < 5) {
            outerwear = gender === 'female'
                ? { name: '羽绒服', type: '羽绒', color: '白色', season: '冬' }
                : { name: '羽绒夹克', type: '羽绒', color: '黑色', season: '冬' };
        } else if (temp < 15) {
            outerwear = gender === 'female'
                ? { name: '风衣', type: '风衣', color: '驼色', season: '春秋' }
                : { name: '夹克', type: '夹克', color: '棕色', season: '春秋' };
        } else if (temp < 20) {
            outerwear = gender === 'female'
                ? { name: '轻薄外套', type: '外套', color: '粉色', season: '春秋' }
                : { name: '薄夹克', type: '外套', color: '蓝色', season: '春秋' };
        } else {
            outerwear = null; // 温暖天气不需要外套
        }
        
        // 鞋子推荐
        if (condition === 'rain' || condition === 'snow') {
            shoes = gender === 'female'
                ? { name: '防水靴子', type: '靴子', color: '黑色', waterproof: true }
                : { name: '防水运动鞋', type: '运动鞋', color: '黑色', waterproof: true };
        } else if (temp < 10) {
            shoes = gender === 'female'
                ? { name: '短靴', type: '靴子', color: '棕色' }
                : { name: '休闲鞋', type: '休闲鞋', color: '黑色' };
        } else {
            shoes = gender === 'female'
                ? { name: '平底鞋', type: '平底鞋', color: '白色' }
                : { name: '运动鞋', type: '运动鞋', color: '白色' };
        }
        
        // 配饰推荐
        if (condition === 'clear' && temp > 25) {
            accessories.push(gender === 'female'
                ? { name: '遮阳帽', type: '帽子', color: '白色' }
                : { name: '棒球帽', type: '帽子', color: '黑色' });
            accessories.push({ name: '太阳镜', type: '墨镜', color: '黑色' });
        } else if (condition === 'rain') {
            accessories.push({ name: '折叠雨伞', type: '雨伞', color: '黑色' });
        } else if (temp < 10) {
            accessories.push(gender === 'female'
                ? { name: '围巾', type: '围巾', color: '红色' }
                : { name: '围巾', type: '围巾', color: '灰色' });
            
            if (temp < 5) {
                accessories.push({ name: '手套', type: '手套', color: '黑色' });
            }
        }
        
        // 生成穿着建议
        const suggestions = this.generateSuggestions(weather, top, bottom, outerwear);
        
        // 更新全局状态
        app.state.outfit = {
            current: {
                top,
                bottom,
                outerwear,
                shoes,
                accessories,
                suggestions,
                date: new Date(),
                weather: {
                    temperature: weather.temperature,
                    condition: weather.condition
                }
            },
            history: app.state.outfit?.history || []
        };
        
        // 保存到本地存储
        app.utils.storage.save('outfit', app.state.outfit);
        
        // 更新UI
        this.updateOutfitUI();
    },
    
    // 保存当前穿搭到历史记录
    saveCurrentOutfit() {
        if (!app.state.outfit || !app.state.outfit.current) {
            this.showNotification('没有可保存的穿搭');
            return;
        }
        
        // 创建历史记录
        if (!app.state.outfit.history) {
            app.state.outfit.history = [];
        }
        
        // 添加到历史记录
        app.state.outfit.history.unshift({
            ...app.state.outfit.current,
            savedAt: new Date()
        });
        
        // 限制历史记录数量
        if (app.state.outfit.history.length > 10) {
            app.state.outfit.history = app.state.outfit.history.slice(0, 10);
        }
        
        // 保存到本地存储
        app.utils.storage.save('outfit', app.state.outfit);
        
        // 显示成功提示
        this.showNotification('穿搭已保存到历史记录');
    },
    
    // 生成穿着建议
    generateSuggestions(weather, top, bottom, outerwear) {
        const suggestions = [];
        const temp = weather.temperature;
        const condition = weather.condition;
        
        // 基于天气状况生成建议
        if (condition === 'rain') {
            suggestions.push('今天有雨，记得携带雨伞');
            suggestions.push('建议穿防水的鞋子');
        } else if (condition === 'snow') {
            suggestions.push('今天有雪，注意保暖');
            suggestions.push('建议穿防滑的鞋子');
        } else if (condition === 'clear' && temp > 25) {
            suggestions.push('阳光强烈，建议涂抹防晒霜');
            suggestions.push('可以戴帽子和墨镜防晒');
        }
        
        // 基于温度生成建议
        if (temp < 5) {
            suggestions.push('天气寒冷，注意保暖');
            suggestions.push('建议戴手套和围巾');
        } else if (temp < 10) {
            suggestions.push('天气较冷，多穿一件保暖内衣');
        } else if (temp > 30) {
            suggestions.push('天气炎热，注意防暑降温');
            suggestions.push('多喝水，避免长时间在户外活动');
        }
        
        // 基于穿搭生成建议
        if (top && bottom) {
            if (top.color && bottom.color) {
                if (this.areColorsCompatible(top.color, bottom.color)) {
                    suggestions.push(`${top.color}${top.name}与${bottom.color}${bottom.name}搭配协调`);
                }
            }
        }
        
        // 随机选择2-3条建议
        return this.getRandomElements(suggestions, Math.min(3, Math.max(2, suggestions.length)));
    },
    
    // 判断颜色是否协调
    areColorsCompatible(color1, color2) {
        const compatiblePairs = [
            ['白色', '黑色'], ['白色', '蓝色'], ['白色', '红色'],
            ['黑色', '红色'], ['黑色', '灰色'], ['黑色', '米色'],
            ['蓝色', '灰色'], ['蓝色', '白色'], ['蓝色', '卡其色'],
            ['粉色', '白色'], ['粉色', '灰色'], ['粉色', '深蓝色'],
            ['红色', '白色'], ['红色', '黑色'], ['红色', '灰色']
        ];
        
        return compatiblePairs.some(pair => 
            (pair[0] === color1 && pair[1] === color2) || 
            (pair[0] === color2 && pair[1] === color1)
        );
    },
    
    // 获取随机元素
    getRandomItem(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    },
    
    // 获取多个随机元素
    getRandomElements(array, count) {
        if (!array || array.length === 0) return [];
        if (count >= array.length) return [...array];
        
        const result = [];
        const copyArray = [...array];
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * copyArray.length);
            result.push(copyArray[randomIndex]);
            copyArray.splice(randomIndex, 1);
        }
        
        return result;
    },
    
    // 获取默认图片URL
    getDefaultImage(type) {
        const imageMap = {
            top: 'https://cdn.pixabay.com/photo/2013/07/13/14/08/apparel-162192_640.png',
            bottom: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/clothes-1295305_640.png',
            outerwear: 'https://cdn.pixabay.com/photo/2014/04/03/10/55/jacket-311437_640.png',
            shoes: 'https://cdn.pixabay.com/photo/2013/07/12/18/20/shoes-153310_640.png',
            accessory: 'https://cdn.pixabay.com/photo/2018/02/14/21/42/hat-3154310_640.png'
        };
        
        return imageMap[type] || 'https://cdn.pixabay.com/photo/2016/03/31/19/24/clothes-1295305_640.png';
    },
    
    // 显示通知
    showNotification(message) {
        const notification = document.querySelector('#notification');
        if (notification) {
            notification.textContent = message;
            notification.classList.replace('scale-0', 'scale-100');
            
            setTimeout(() => {
                notification.classList.replace('scale-100', 'scale-0');
            }, 3000);
        }
    }
};

// 当页面加载完成后初始化服装推荐控制器
document.addEventListener('DOMContentLoaded', () => {
    OutfitController.init();
}); 