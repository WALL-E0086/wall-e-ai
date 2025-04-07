// 衣橱管理控制器
const WardrobeController = {
    // 当前分类
    currentCategory: 'tops',
    
    // 初始化
    init() {
        // 加载衣橱数据
        this.loadWardrobeData();
        
        // 绑定事件处理
        this.bindEvents();
        
        // 更新UI
        this.updateUI();
    },
    
    // 绑定事件
    bindEvents() {
        // 分类切换事件
        const categoryTabs = document.querySelectorAll('.category-tab');
        if (categoryTabs.length > 0) {
            categoryTabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const category = tab.dataset.category;
                    if (category) {
                        this.switchCategory(category);
                    }
                });
            });
        }
        
        // 添加新衣物按钮
        const addItemBtn = document.querySelector('#add-clothing-item');
        if (addItemBtn) {
            addItemBtn.addEventListener('click', () => {
                window.location.href = 'add-item.html';
            });
        }
        
        // 删除确认对话框
        const confirmDeleteBtn = document.querySelector('#confirm-delete');
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDeleteItem();
            });
        }
        
        // 取消删除按钮
        const cancelDeleteBtn = document.querySelector('#cancel-delete');
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
    },
    
    // 加载衣橱数据
    loadWardrobeData() {
        // 从本地存储加载衣橱数据
        const wardrobeData = app.utils.storage.load('wardrobe');
        
        if (wardrobeData) {
            app.state.wardrobe = { ...wardrobeData };
        } else {
            // 初始化空衣橱数据
            app.state.wardrobe = {
                tops: [],
                bottoms: [],
                outerwear: [],
                shoes: [],
                accessories: []
            };
        }
    },
    
    // 更新UI
    updateUI() {
        // 更新分类标签
        this.updateCategoryTabs();
        
        // 更新衣物列表
        this.updateClothingList();
        
        // 更新统计信息
        this.updateStatistics();
    },
    
    // 更新分类标签
    updateCategoryTabs() {
        const tabs = document.querySelectorAll('.category-tab');
        if (tabs.length > 0) {
            tabs.forEach(tab => {
                const category = tab.dataset.category;
                
                if (category === this.currentCategory) {
                    tab.classList.add('bg-blue-500', 'text-white');
                    tab.classList.remove('bg-gray-200', 'text-gray-700');
                } else {
                    tab.classList.remove('bg-blue-500', 'text-white');
                    tab.classList.add('bg-gray-200', 'text-gray-700');
                }
            });
        }
    },
    
    // 更新衣物列表
    updateClothingList() {
        const listContainer = document.querySelector('#clothing-list');
        if (!listContainer) return;
        
        // 获取当前分类的衣物
        const items = app.state.wardrobe[this.currentCategory] || [];
        
        // 清空列表
        listContainer.innerHTML = '';
        
        if (items.length === 0) {
            // 显示空状态
            listContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-10">
                    <i class="fas fa-tshirt text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500">你的${this.getCategoryName()}衣橱为空</p>
                    <p class="text-gray-400 text-sm mb-4">点击添加按钮开始添加衣物</p>
                    <button id="empty-add-btn" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
                        <i class="fas fa-plus mr-2"></i>添加${this.getCategoryName()}
                    </button>
                </div>
            `;
            
            // 绑定空状态添加按钮
            const emptyAddBtn = document.querySelector('#empty-add-btn');
            if (emptyAddBtn) {
                emptyAddBtn.addEventListener('click', () => {
                    window.location.href = 'add-item.html';
                });
            }
            
            return;
        }
        
        // 创建卡片网格
        const gridContainer = document.createElement('div');
        gridContainer.className = 'grid grid-cols-2 md:grid-cols-3 gap-4';
        listContainer.appendChild(gridContainer);
        
        // 添加衣物卡片
        items.forEach((item, index) => {
            const card = document.createElement('div');
            card.className = 'bg-white rounded-lg shadow overflow-hidden';
            card.innerHTML = `
                <div class="relative">
                    <img src="${item.image || this.getDefaultImage()}" alt="${item.name}" class="w-full h-36 object-cover">
                    <div class="absolute top-2 right-2 flex">
                        <button class="edit-item-btn bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200" data-index="${index}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-item-btn bg-gray-100 p-1 rounded-full text-gray-600 hover:bg-gray-200 ml-1" data-index="${index}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="p-3">
                    <h3 class="font-medium text-gray-800">${item.name}</h3>
                    <div class="flex items-center justify-between mt-1">
                        <span class="text-sm text-gray-500">${item.color || '无颜色'}</span>
                        <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">${item.season || '全季节'}</span>
                    </div>
                    <div class="mt-2 text-xs text-gray-500">${item.type || '无类型'}</div>
                </div>
            `;
            
            gridContainer.appendChild(card);
            
            // 绑定编辑按钮事件
            const editBtn = card.querySelector('.edit-item-btn');
            if (editBtn) {
                editBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemIndex = parseInt(editBtn.dataset.index);
                    this.editItem(itemIndex);
                });
            }
            
            // 绑定删除按钮事件
            const deleteBtn = card.querySelector('.delete-item-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const itemIndex = parseInt(deleteBtn.dataset.index);
                    this.showDeleteModal(itemIndex);
                });
            }
            
            // 卡片点击事件
            card.addEventListener('click', () => {
                this.viewItemDetails(index);
            });
        });
    },
    
    // 更新统计信息
    updateStatistics() {
        // 更新各分类衣物数量
        const categories = ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'];
        
        categories.forEach(category => {
            const countElement = document.querySelector(`#${category}-count`);
            if (countElement) {
                const count = app.state.wardrobe[category]?.length || 0;
                countElement.textContent = count;
            }
        });
        
        // 更新总数
        const totalElement = document.querySelector('#total-items');
        if (totalElement) {
            const total = categories.reduce((sum, category) => {
                return sum + (app.state.wardrobe[category]?.length || 0);
            }, 0);
            totalElement.textContent = total;
        }
    },
    
    // 切换分类
    switchCategory(category) {
        if (this.currentCategory === category) return;
        
        this.currentCategory = category;
        
        // 更新UI
        this.updateCategoryTabs();
        this.updateClothingList();
    },
    
    // 查看衣物详情
    viewItemDetails(index) {
        const item = app.state.wardrobe[this.currentCategory][index];
        if (!item) return;
        
        // 缓存当前查看的衣物信息
        app.utils.storage.save('currentViewItem', {
            category: this.currentCategory,
            index: index,
            item: item
        });
        
        // 跳转到详情页
        window.location.href = 'item-details.html';
    },
    
    // 编辑衣物
    editItem(index) {
        const item = app.state.wardrobe[this.currentCategory][index];
        if (!item) return;
        
        // 缓存当前编辑的衣物信息
        app.utils.storage.save('currentEditItem', {
            category: this.currentCategory,
            index: index,
            item: item
        });
        
        // 跳转到编辑页
        window.location.href = 'edit-item.html';
    },
    
    // 显示删除确认对话框
    showDeleteModal(index) {
        const item = app.state.wardrobe[this.currentCategory][index];
        if (!item) return;
        
        // 保存要删除的项目信息
        this.itemToDelete = {
            category: this.currentCategory,
            index: index,
            item: item
        };
        
        // 更新确认对话框内容
        const itemNameEl = document.querySelector('#delete-item-name');
        if (itemNameEl) {
            itemNameEl.textContent = item.name;
        }
        
        // 显示对话框
        const modal = document.querySelector('#delete-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    },
    
    // 隐藏删除确认对话框
    hideDeleteModal() {
        const modal = document.querySelector('#delete-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
        
        // 清除待删除项
        this.itemToDelete = null;
    },
    
    // 确认删除衣物
    confirmDeleteItem() {
        if (!this.itemToDelete) return;
        
        const { category, index } = this.itemToDelete;
        
        // 从数组中移除
        app.state.wardrobe[category].splice(index, 1);
        
        // 保存更新后的衣橱数据
        app.utils.storage.save('wardrobe', app.state.wardrobe);
        
        // 隐藏对话框
        this.hideDeleteModal();
        
        // 更新UI
        this.updateClothingList();
        this.updateStatistics();
        
        // 显示成功提示
        this.showNotification('衣物已成功删除');
    },
    
    // 获取分类名称
    getCategoryName() {
        const categoryNames = {
            tops: '上装',
            bottoms: '下装',
            outerwear: '外套',
            shoes: '鞋子',
            accessories: '配饰'
        };
        
        return categoryNames[this.currentCategory] || this.currentCategory;
    },
    
    // 获取默认图片
    getDefaultImage() {
        const defaultImages = {
            tops: 'https://cdn.pixabay.com/photo/2013/07/13/14/08/apparel-162192_640.png',
            bottoms: 'https://cdn.pixabay.com/photo/2016/03/31/19/24/clothes-1295305_640.png',
            outerwear: 'https://cdn.pixabay.com/photo/2014/04/03/10/55/jacket-311437_640.png',
            shoes: 'https://cdn.pixabay.com/photo/2013/07/12/18/20/shoes-153310_640.png',
            accessories: 'https://cdn.pixabay.com/photo/2018/02/14/21/42/hat-3154310_640.png'
        };
        
        return defaultImages[this.currentCategory] || 'https://cdn.pixabay.com/photo/2016/03/31/19/24/clothes-1295305_640.png';
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

// 衣物添加控制器
const AddItemController = {
    // 初始化
    init() {
        // 确定当前要添加的分类
        this.determineCurrentCategory();
        
        // 绑定事件
        this.bindEvents();
        
        // 更新UI
        this.updateUI();
    },
    
    // 确定当前分类
    determineCurrentCategory() {
        // 从URL参数获取分类
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        if (category && ['tops', 'bottoms', 'outerwear', 'shoes', 'accessories'].includes(category)) {
            this.currentCategory = category;
        } else {
            // 默认为上装
            this.currentCategory = 'tops';
        }
    },
    
    // 绑定事件
    bindEvents() {
        // 保存按钮
        const saveBtn = document.querySelector('#save-item');
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveItem();
            });
        }
        
        // 取消按钮
        const cancelBtn = document.querySelector('#cancel-add');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.history.back();
            });
        }
        
        // 分类选择改变
        const categorySelect = document.querySelector('#item-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.currentCategory = categorySelect.value;
                this.updateSeasonOptions();
                this.updateTypeOptions();
            });
        }
        
        // 上传图片按钮
        const uploadBtn = document.querySelector('#upload-image');
        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const imageInput = document.querySelector('#image-input');
                if (imageInput) {
                    imageInput.click();
                }
            });
        }
        
        // 图片文件输入变化
        const imageInput = document.querySelector('#image-input');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e);
            });
        }
    },
    
    // 更新UI
    updateUI() {
        // 设置标题
        const title = document.querySelector('#add-item-title');
        if (title) {
            title.textContent = `添加${this.getCategoryName()}`;
        }
        
        // 设置分类选择器
        const categorySelect = document.querySelector('#item-category');
        if (categorySelect) {
            categorySelect.value = this.currentCategory;
        }
        
        // 更新季节选项
        this.updateSeasonOptions();
        
        // 更新类型选项
        this.updateTypeOptions();
    },
    
    // 更新季节选项
    updateSeasonOptions() {
        const seasonSelect = document.querySelector('#item-season');
        if (!seasonSelect) return;
        
        // 通用季节选项
        const commonOptions = [
            { value: "", label: "选择季节" },
            { value: "春", label: "春季" },
            { value: "夏", label: "夏季" },
            { value: "秋", label: "秋季" },
            { value: "冬", label: "冬季" },
            { value: "全季节", label: "全季节" }
        ];
        
        // 清空现有选项
        seasonSelect.innerHTML = '';
        
        // 添加选项
        commonOptions.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            seasonSelect.appendChild(optionEl);
        });
    },
    
    // 更新类型选项
    updateTypeOptions() {
        const typeSelect = document.querySelector('#item-type');
        if (!typeSelect) return;
        
        // 清空现有选项
        typeSelect.innerHTML = '';
        
        // 根据分类设置不同的类型选项
        let options = [{ value: "", label: "选择类型" }];
        
        switch (this.currentCategory) {
            case 'tops':
                options = options.concat([
                    { value: "T恤", label: "T恤" },
                    { value: "短袖", label: "短袖" },
                    { value: "长袖", label: "长袖" },
                    { value: "衬衫", label: "衬衫" },
                    { value: "卫衣", label: "卫衣" },
                    { value: "毛衣", label: "毛衣" },
                    { value: "针织衫", label: "针织衫" }
                ]);
                break;
            case 'bottoms':
                options = options.concat([
                    { value: "短裤", label: "短裤" },
                    { value: "长裤", label: "长裤" },
                    { value: "牛仔裤", label: "牛仔裤" },
                    { value: "休闲裤", label: "休闲裤" },
                    { value: "运动裤", label: "运动裤" },
                    { value: "短裙", label: "短裙" },
                    { value: "长裙", label: "长裙" }
                ]);
                break;
            case 'outerwear':
                options = options.concat([
                    { value: "夹克", label: "夹克" },
                    { value: "外套", label: "外套" },
                    { value: "风衣", label: "风衣" },
                    { value: "棉服", label: "棉服" },
                    { value: "羽绒服", label: "羽绒服" },
                    { value: "大衣", label: "大衣" }
                ]);
                break;
            case 'shoes':
                options = options.concat([
                    { value: "运动鞋", label: "运动鞋" },
                    { value: "休闲鞋", label: "休闲鞋" },
                    { value: "正装鞋", label: "正装鞋" },
                    { value: "靴子", label: "靴子" },
                    { value: "凉鞋", label: "凉鞋" },
                    { value: "高跟鞋", label: "高跟鞋" },
                    { value: "平底鞋", label: "平底鞋" }
                ]);
                break;
            case 'accessories':
                options = options.concat([
                    { value: "帽子", label: "帽子" },
                    { value: "围巾", label: "围巾" },
                    { value: "手套", label: "手套" },
                    { value: "墨镜", label: "墨镜" },
                    { value: "包包", label: "包包" },
                    { value: "腰带", label: "腰带" },
                    { value: "雨伞", label: "雨伞" }
                ]);
                break;
        }
        
        // 添加选项
        options.forEach(option => {
            const optionEl = document.createElement('option');
            optionEl.value = option.value;
            optionEl.textContent = option.label;
            typeSelect.appendChild(optionEl);
        });
    },
    
    // 处理图片上传
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // 验证文件类型
        if (!file.type.match('image.*')) {
            this.showNotification('请上传图片文件', 'error');
            return;
        }
        
        // 限制文件大小（2MB）
        if (file.size > 2 * 1024 * 1024) {
            this.showNotification('图片大小不能超过2MB', 'error');
            return;
        }
        
        // 读取文件并显示预览
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            // 更新图片预览
            const preview = document.querySelector('#image-preview');
            if (preview) {
                preview.src = imageData;
                preview.classList.remove('hidden');
            }
            
            // 保存图片数据
            this.imageData = imageData;
            
            // 隐藏上传按钮，显示更改按钮
            const uploadBtn = document.querySelector('#upload-image');
            const changeBtn = document.querySelector('#change-image');
            
            if (uploadBtn && changeBtn) {
                uploadBtn.classList.add('hidden');
                changeBtn.classList.remove('hidden');
                
                // 绑定更改按钮事件
                changeBtn.addEventListener('click', () => {
                    const imageInput = document.querySelector('#image-input');
                    if (imageInput) {
                        imageInput.click();
                    }
                });
            }
        };
        
        reader.onerror = () => {
            this.showNotification('图片上传失败，请重试', 'error');
        };
        
        reader.readAsDataURL(file);
    },
    
    // 保存衣物
    saveItem() {
        // 获取表单数据
        const name = document.querySelector('#item-name')?.value || '';
        const color = document.querySelector('#item-color')?.value || '';
        const season = document.querySelector('#item-season')?.value || '';
        const type = document.querySelector('#item-type')?.value || '';
        const brand = document.querySelector('#item-brand')?.value || '';
        const notes = document.querySelector('#item-notes')?.value || '';
        
        // 验证必填字段
        if (!name) {
            this.showNotification('请输入衣物名称', 'error');
            return;
        }
        
        // 创建衣物对象
        const newItem = {
            name,
            color,
            season,
            type,
            brand,
            notes,
            image: this.imageData || null,
            createdAt: new Date()
        };
        
        // 添加到衣橱
        if (!app.state.wardrobe) {
            app.state.wardrobe = {
                tops: [],
                bottoms: [],
                outerwear: [],
                shoes: [],
                accessories: []
            };
        }
        
        app.state.wardrobe[this.currentCategory].push(newItem);
        
        // 保存到本地存储
        app.utils.storage.save('wardrobe', app.state.wardrobe);
        
        // 显示成功提示
        this.showNotification('衣物已添加到衣橱');
        
        // 返回衣橱页面
        setTimeout(() => {
            window.location.href = 'wardrobe.html';
        }, 1000);
    },
    
    // 获取分类名称
    getCategoryName() {
        const categoryNames = {
            tops: '上装',
            bottoms: '下装',
            outerwear: '外套',
            shoes: '鞋子',
            accessories: '配饰'
        };
        
        return categoryNames[this.currentCategory] || this.currentCategory;
    },
    
    // 显示通知
    showNotification(message, type = 'success') {
        const notification = document.querySelector('#notification');
        
        if (notification) {
            notification.textContent = message;
            
            // 设置通知类型样式
            notification.classList.remove('bg-green-500', 'bg-red-500');
            notification.classList.add(type === 'error' ? 'bg-red-500' : 'bg-green-500');
            
            // 显示通知
            notification.classList.replace('scale-0', 'scale-100');
            
            // 3秒后隐藏
            setTimeout(() => {
                notification.classList.replace('scale-100', 'scale-0');
            }, 3000);
        }
    }
};

// 当页面加载完成后根据页面初始化对应的控制器
document.addEventListener('DOMContentLoaded', () => {
    // 根据当前页面URL决定初始化哪个控制器
    const pathname = window.location.pathname;
    
    if (pathname.includes('add-item.html')) {
        AddItemController.init();
    } else {
        WardrobeController.init();
    }
}); 