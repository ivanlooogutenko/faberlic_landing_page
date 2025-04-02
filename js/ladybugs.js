// Класс для божьей коровки с расширенным поворотом
class Ladybug {
    constructor(controller, id) {
        this.id = id;
        this.controller = controller;
        this.element = this.createLadybugElement();
        this.x = Math.random() * 90;
        this.y = Math.random() * 90;
        this.speed = 0.7 + Math.random() * 1.0; // Увеличиваем начальную скорость для более активного движения
        this.direction = Math.random() * 360;
        this.rotationSpeed = 0.15 + Math.random() * 0.3; // Увеличиваем скорость поворота для быстрой реакции
        
        // Добавляем переменные для плавности движения
        this.targetDirection = this.direction;
        this.targetSpeed = this.speed;
        this.lastRepelTime = 0;
        this.smoothingFactor = 0.05; // Увеличиваем фактор плавности для более динамичного движения
        
        // Индивидуальный коэффициент выбора направления при столкновении
        // Используем ID для создания противоположных коэффициентов у разных коровок
        // Четные ID отклоняются в одну сторону, нечетные - в противоположную
        // Добавляем небольшое случайное смещение для естественности
        const baseAngle = this.id % 2 === 0 ? 25 : -25;
        const variability = 15; // Диапазон вариации внутри группы
        this.directionBias = baseAngle + (Math.random() * variability - variability/2);
        
        // Увеличиваем количество состояний
        this.states = ['wander', 'flee', 'rest', 'eating', 'sleeping', 'flying', 'dancing', 'following', 'landing', 'dragging'];
        this.state = 'wander'; // Начальное состояние
        
        this.stateTimer = 0;
        this.nearbyLadybugs = [];
        this.targetElement = null;
        this.targetLeaf = null;
        this.isHappy = false; // Настроение
        this.trail = []; // След за божьей коровкой
        this.trailUpdateCounter = 0;
        
        // Переменные для перетаскивания
        this.isDragging = false;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.originalScale = 1;
        this.beforeDragState = null;
        
        // Переменные для отслеживания кликов
        this.mouseDownTime = 0;
        this.mouseDownX = 0;
        this.mouseDownY = 0;
        this.clickThreshold = 300; // Миллисекунды для определения клика
        this.moveThreshold = 5; // Пиксели для определения начала движения
        this.potentialDrag = false; // Флаг перетаскивания
        
        this.personality = {
            sociability: Math.random(), // Социальность к группировке
            curiosity: Math.random(),   // Социальность к исследованию
            laziness: Math.random(),    // Социальность к отдыху
            playfulness: Math.random(), // Социальность к игре
            fearfulness: Math.random()  // Социальность к страху
        };
        
        this.updatePosition();
        this.setupEventListeners();
    }

    createLadybugElement() {
        const ladybug = document.createElement('div');
        ladybug.className = 'ladybug';
        ladybug.id = `ladybug-${this.id}`;
        
        // Создаем основное тело (красный круг)
        const body = document.createElement('div');
        body.className = 'ladybug-body';
        
        // Создаем симметричные точки
        const spotPositions = [
            {x: 30, y: 30}, 
            {x: 70, y: 30}, 
            {x: 50, y: 50}, 
            {x: 30, y: 70}, 
            {x: 70, y: 70}
        ];
        
        spotPositions.forEach(pos => {
            const spot = document.createElement('div');
            spot.className = 'ladybug-spot';
            spot.style.left = `${pos.x}%`;
            spot.style.top = `${pos.y}%`;
            
            // Более одинаковые размеры для симметрии
            const size = 10 + Math.random() * 5;
            spot.style.width = `${size}%`;
            spot.style.height = `${size}%`;
            
            body.appendChild(spot);
        });
        
        // Создаем голову
        const head = document.createElement('div');
        head.className = 'ladybug-head';
        
        // Добавляем антенны
        const leftAntenna = document.createElement('div');
        leftAntenna.className = 'ladybug-antenna ladybug-antenna-left';
        
        const rightAntenna = document.createElement('div');
        rightAntenna.className = 'ladybug-antenna ladybug-antenna-right';
        
        head.appendChild(leftAntenna);
        head.appendChild(rightAntenna);
        
        // Добавляем глаза
        const leftEye = document.createElement('div');
        leftEye.className = 'ladybug-eye ladybug-eye-left';
        
        const rightEye = document.createElement('div');
        rightEye.className = 'ladybug-eye ladybug-eye-right';
        
        head.appendChild(leftEye);
        head.appendChild(rightEye);
        
        // Добавляем улыбку
        const smile = document.createElement('div');
        smile.className = 'ladybug-smile';
        head.appendChild(smile);
        
        body.appendChild(head);
        
        // Добавляем разделительную линию
        const divider = document.createElement('div');
        divider.className = 'ladybug-divider';
        body.appendChild(divider);
        
        // Добавляем ножки
        for (let i = 1; i <= 6; i++) {
            const leg = document.createElement('div');
            leg.className = `ladybug-leg ladybug-leg-${i}`;
            leg.style.animationDelay = `${Math.random() * 0.5}s`;
            // Ножки добавляем в тело напрямую
            body.appendChild(leg);
        }
        
        // Добавляем тело в контейнер божьей коровки
        ladybug.appendChild(body);
        
        return ladybug;
    }

    setupEventListeners() {
        // Удаляем прямой обработчик клика, вместо этого будем использовать handleDragEnd
        
        // При наведении мыши - проверяем, не находимся ли мы в режиме перетаскивания или потенциального перетаскивания
        this.element.addEventListener('mouseover', () => {
            if (this.isDragging || this.potentialDrag) return;
            
            // С вероятностью, зависящей от страха, мы убегаем
            if (Math.random() < this.personality.fearfulness) {
                this.startFlee();
            } else if (Math.random() < this.personality.playfulness) {
                // Если с вероятностью, зависящей от игры, мы начинаем танцевать
                this.startDancing();
            }
        });
        
        // Обработчики для мыши
        this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Обработчики для сенсорных экранов
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this));
        document.addEventListener('touchmove', this.handleTouchMove.bind(this));
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    startSleeping() {
        // Делаем сон значительно дольше
        this.changeState('sleeping', 3000 + Math.random() * 4000); // Увеличиваем время сна до 3-7 секунд
        this.speed = 0; // Не двигаемся во время сна
        
        // Массив для хранения элементов сна
        this.sleepElements = [];
        
        // Создаем несколько букв "Z" для анимации сна
        for (let i = 0; i < 5; i++) {
            const sleepZ = document.createElement('div');
            sleepZ.className = 'ladybug-sleep-z';
            sleepZ.innerHTML = 'z';
            sleepZ.style.position = 'absolute';
            sleepZ.style.fontSize = `${10 + i * 2}px`;
            sleepZ.style.fontWeight = 'bold';
            sleepZ.style.top = '-15px';
            sleepZ.style.right = `${-5 - i * 10}px`;
            sleepZ.style.opacity = '0';
            sleepZ.style.zIndex = '1001';
            sleepZ.style.pointerEvents = 'none';
            sleepZ.style.animation = `sleepZ ${2 + i * 0.5}s infinite`;
            sleepZ.style.animationDelay = `${i * 0.7}s`;
            sleepZ.style.color = '#210f4b'; // Используем тот же цвет, что и для головы
            sleepZ.style.textShadow = '1px 1px 2px rgba(0,0,0,0.2)';
            
            this.element.appendChild(sleepZ);
            this.sleepElements.push(sleepZ);
        }
    }
    
    endSleeping() {
        // Удаляем все элементы сна
        if (this.sleepElements && this.sleepElements.length) {
            this.sleepElements.forEach(element => {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            this.sleepElements = [];
        }
    }
    
    // Показываем счастье (увеличиваем масштаб элемента)
    showHappiness() {
        this.isHappy = true;
        // Удаляем изменение масштаба элемента, чтобы божья коровка не исчезала
        // this.element.style.transform = 'scale(1.2)';
        
        // Определяем цвет сердца - светло-красный оттенок
        const heartColor = '#ff5252';
        
        // Создаем одно сердце
        const heart = document.createElement('div');
        heart.className = 'ladybug-heart';
        
        // Используем unicode для сердца
        heart.innerHTML = '&#x2764;';
        heart.style.position = 'fixed'; // Используем fixed вместо absolute
        // Увеличиваем размер сердца
        heart.style.fontSize = '28px'; // Было 16px
        heart.style.fontWeight = 'bold';
        
        // Вычисляем позицию сердца на экране
        const rect = this.element.getBoundingClientRect();
        // Рассчитываем позицию на экране
        heart.style.left = `${rect.left + rect.width / 2 - 14}px`; // Центрируем по горизонтали (14px - половина ширины божьей коровки)
        heart.style.top = `${rect.top - 20}px`;  // Немножко выше верхней границы божьей коровки
        
        // Цвет сердца
        heart.style.color = heartColor;
        heart.style.opacity = '0';
        heart.style.zIndex = '1001';
        heart.style.pointerEvents = 'none';
        heart.style.filter = 'drop-shadow(0 0 3px rgba(255,0,0,0.7))';
        
        // Добавляем сердце в тело
        document.body.appendChild(heart);
        
        // Создаем анимацию для сердца
        const duration = 1.5; // 1.5 секунды
        
        // Анимация для сердца - простое уменьшение и увеличение
        const keyframes = `
            @keyframes heart${this.id} {
                0% {
                    opacity: 0;
                    transform: translateY(0) scale(0.5);
                }
                20% {
                    opacity: 1;
                    transform: translateY(-15px) scale(1.2);
                }
                80% {
                    opacity: 0.8;
                    transform: translateY(-45px) scale(1.4);
                }
                100% {
                    opacity: 0;
                    transform: translateY(-70px) scale(1);
                }
            }
        `;
        
        // Добавляем стили анимации в head
        const style = document.createElement('style');
        style.textContent = keyframes;
        document.head.appendChild(style);
        
        // Применяем анимацию к сердцу
        heart.style.animation = `heart${this.id} ${duration}s ease-out forwards`;
        
        // Удаляем сердце и стили анимации после окончания
        setTimeout(() => {
            if (heart.parentNode) {
                heart.parentNode.removeChild(heart);
            }
            if (style.parentNode) {
                style.parentNode.removeChild(style);
            }
        }, duration * 1000);
    }

    startFlee() {
        this.changeState('flee', 2000); // Время бегства 2000 мс
        
        // Увеличиваем скорость при бегстве
        this.targetSpeed = 2.2 + Math.random() * 1.5; // Увеличиваем скорость бегства
        
        // Меняем направление движения на противоположное
        const cursorX = this.controller.lastMouseX;
        const cursorY = this.controller.lastMouseY;
        
        if (cursorX !== null && cursorY !== null) {
            // Вычисляем новое направление от курсора
            const dx = this.x - cursorX;
            const dy = this.y - cursorY;
            this.targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Добавляем небольшое случайное отклонение
            this.targetDirection += (Math.random() - 0.5) * 20; // Уменьшаем разброс на 30 до 20
        } else {
            // Если нет данных о курсоре, просто выбираем случайное направление
            this.targetDirection = (this.direction + 120 + Math.random() * 40) % 360; // Уменьшаем на 60 до 40
        }
    }
    
    startDancing() {
        this.changeState('dancing', 4000); // Танцуем 4 секунды
        this.speed = 0.1; // Медленное движение в танце
    }
    
    startFlying() {
        this.changeState('flying', 5000); // Летим 5 секунд
        this.targetSpeed = 4 + Math.random() * 2; // Увеличиваем скорость полета
        this.y -= 3; // Летим вверх
    }
    
    startEating(leaf) {
        this.targetLeaf = leaf;
        // Ограничиваем время приема пищи максимум до 3 секунд
        this.changeState('eating', 1000 + Math.random() * 2000);
        this.speed = 0; // Не двигаемся во время поедания
        
        // Отмечаем лист как "съеденный"
        leaf.classList.add('eaten');
        
        // Удаляем лист после анимации "поедания"
        setTimeout(() => {
            if (leaf && leaf.parentNode) {
                leaf.parentNode.removeChild(leaf);
                
                // Создаем новый лист в случайном месте
                this.controller.createLeaf();
            }
        }, 3000);
    }
    
    startFollowing(target) {
        // Ограничиваем время следования максимум до 3 секунд
        this.changeState('following', 1000 + Math.random() * 2000);
        this.targetLadybug = target;
        this.speed = 1.5 + Math.random() * 1.0; // Увеличиваем скорость следования
    }
    
    startLanding(element) {
        // Ограничиваем время посадки максимум до 3 секунд
        this.changeState('landing', 1000 + Math.random() * 2000);
        this.targetElement = element;
        this.speed = 1 + Math.random(); // Средняя скорость для посадки
    }
    
    endLanding() {
        if (this.targetElement) {
            // После посадки меняем состояние на "отдых" не дольше 3 секунд
            this.changeState('rest', 1000 + Math.random() * 2000);
            this.speed = 0;
        }
    }

    changeState(newState, duration) {
        // Если уже в этом состоянии, просто обновляем таймер
        if (this.state === newState) {
            this.stateTimer = duration;
            return;
        }
        
        // Очищаем предыдущее состояние
        this.element.classList.remove(this.state);
        
        // Обработка для некоторых состояний
        if (this.state === 'sleeping') {
            this.endSleeping();
        } else if (this.state === 'landing' && newState !== 'rest') {
            this.targetElement = null;
        }
        
        // Устанавливаем новое состояние
        this.state = newState;
        this.stateTimer = duration;
        this.element.classList.add(newState);
        
        // Сбрасываем скорость по умолчанию для нового состояния
        if (newState === 'wander') {
            // Плавно устанавливаем новую скорость для блуждания
            this.targetSpeed = 0.7 + Math.random() * 0.9; // Увеличиваем диапазон скорости (было 0.4 + Math.random() * 0.7)
        } else if (newState === 'rest') {
            this.speed = 0;
            this.targetSpeed = 0;
        }
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
        
        // Применяем поворот только если не в режиме танца, сна или поедания
        if (!['dancing', 'sleeping', 'eating', 'rest'].includes(this.state)) {
            // Следим за текущим движением божьей коровки при перетаскивании
            if (this.state === 'dragging') {
                // Не меняем трансформацию при перетаскивании, она уже установлена в startDragging
                return;
            }
            
            // Проверяем, не установлен ли угол точно 90 или 270 градусов
            // (это может привести к застреванию)
            const safeDirection = this.direction;
            const isVertical = safeDirection % 180 === 90;
            
            // Если направление точно вертикальное, добавляем небольшое отклонение
            const rotateAngle = isVertical ? 
                safeDirection + (Math.random() < 0.5 ? 3 : -3) : // Отклоняем на 3 градуса
                safeDirection;
            
            this.element.style.transform = `rotate(${rotateAngle}deg)`;
        }
        
        // Обновляем след за божьей коровкой каждые 5 пикселей
        if (this.speed > 0 && ++this.trailUpdateCounter % 5 === 0) {
            this.createTrail();
        }
    }
    
    createTrail() {
        // Создаем элемент следующий
        const trail = document.createElement('div');
        trail.className = 'ladybug-trail';
        trail.style.left = `${this.x}vw`;
        trail.style.top = `${this.y}vh`;
        
        // Добавляем в DOM
        document.body.appendChild(trail);
        
        // Добавляем в массив следующих
        this.trail.push(trail);
        
        // Ограничиваем количество следующих
        if (this.trail.length > 10) {
            const oldTrail = this.trail.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.parentNode.removeChild(oldTrail);
            }
        }
        
        // Удаляем след через время анимации
        setTimeout(() => {
            if (trail && trail.parentNode) {
                trail.parentNode.removeChild(trail);
                const index = this.trail.indexOf(trail);
                if (index > -1) {
                    this.trail.splice(index, 1);
                }
            }
        }, 1500);
    }

    detectCollision(otherLadybugs, interactiveElements, leaves) {
        // Текущее время для проверки столкновений
        const currentTime = Date.now();
        
        // Проверяем ближайших соседей
        this.nearbyLadybugs = otherLadybugs.filter(other => {
            if (other.id === this.id) return false;
            
            // Вычисляем расстояние между божьими коровками
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Считаем, если расстояние меньше 20vw (увеличено для расширения области)
            return distance < 20;
        });
        
        // Сортируем по близости
        this.nearbyLadybugs.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - this.x, 2) + Math.pow(b.y - this.y, 2));
            return distA - distB;
        });
        
        // Проверяем, не находимся ли мы в пределах расстояния для столкновений
        const minDistance = 20; // Увеличиваем максимальное расстояние (было 15)
        const criticalDistance = 12; // Увеличиваем критическое расстояние (было 8)
        
        // Считаем количество близких божьих коровок
        let nearbyCount = 0;
        for (const other of otherLadybugs) {
            if (other.id === this.id) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < criticalDistance * 1.5) {
                nearbyCount++;
            }
        }
        
        // Если больше божьих коровок, увеличиваем силу отталкивания
        const crowdFactor = Math.min(1.5, nearbyCount * 0.4); // Увеличиваем для больших групп
        
        // Замедляем время между столкновениями
        const repelCooldown = 150 + (nearbyCount * 30); // Уменьшаем для более частого столкновения
        
        // Флаг, определяющий, было ли отталкивание
        let wasRepelled = false;
        
        for (const other of otherLadybugs) {
            if (other.id === this.id) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Начинаем отталкивание ближе для более плавного перемещения
            if (distance < minDistance) {
                // Легкое отталкивание при приближении
                const repelAngle = Math.atan2(-dy, -dx);
                const forceFactor = Math.pow(1 - (distance / minDistance), 1.5);
                
                // Базовое отталкивание, которое увеличивается при приближении
                this.x += Math.cos(repelAngle) * forceFactor * 0.15;
                this.y += Math.sin(repelAngle) * forceFactor * 0.15;
                
                // Основное отталкивание с использованием задержки
                if (currentTime - this.lastRepelTime < repelCooldown && this.state !== 'flee') {
                    continue;
                }
                
                this.lastRepelTime = currentTime;
                wasRepelled = true;
                
                // Коэффициент силы отталкивания при малых расстояниях
                const repelStrength = Math.pow(1 - (distance / minDistance), 2.2) * (1.8 + crowdFactor);
                
                // При больших расстояниях - вращение вокруг центра
                if (distance < criticalDistance) {
                    // Вращение вокруг центра при критическом расстоянии
                    const pushAmount = (criticalDistance - distance + 0.8) * (1.5 + crowdFactor);
                    
                    // Сила для разделения, но больше по мере увеличения расстояния
                    this.x += Math.cos(repelAngle) * pushAmount * 0.7;
                    this.y += Math.sin(repelAngle) * pushAmount * 0.7;
                    
                    // Меняем направление на противоположное встрече с учетом индивидуального отклонения
                    const baseDirection = (repelAngle * 180 / Math.PI);
                    // Добавляем индивидуальное отклонение для каждой коровки
                    this.direction = baseDirection + this.directionBias;
                    // Устанавливаем целевое направление с индивидуальным отклонением
                    this.targetDirection = this.direction;
                    
                    // Увеличиваем скорость для быстрого разделения
                    this.speed = 1.8 + Math.random() * 0.8 + crowdFactor;
                    this.targetSpeed = this.speed;
                    
                    // Переходим в состояние бега при критическом приближении
                    this.changeState('flee', 1500 + crowdFactor * 1000);
                } 
                // Если больше расстояния, но меньше критического,
                else {
                    // Меняем направление на противоположное встрече с учетом индивидуального отклонения
                    const baseOppositeDirection = (repelAngle * 180 / Math.PI);
                    // Добавляем индивидуальное отклонение и небольшое случайное для естественности
                    this.targetDirection = baseOppositeDirection + this.directionBias + (Math.random() * 10 - 5);
                    
                    // Увеличиваем скорость для эффективного разделения, но меньше
                    this.targetSpeed = 1.0 + 1.2 * repelStrength;
                    
                    // Если мы следуем за другой божьей коровкой,
                    if (this.state === 'following' && this.targetLadybug && this.targetLadybug.id === other.id) {
                        this.changeState('flee', 1200);
                    }
                }
                
                // Немедленно обновляем позицию для начала разделения
                this.move(60);
                
                // Меняем направление при столкновении
                break;
            }
        }
        
        // Если мы находимся рядом с другими божьими коровками,
        // но не было отталкивания,
        // то с вероятностью 0.15 меняем направление на случайное
        if (this.nearbyLadybugs.length > 1 && !wasRepelled && Math.random() < 0.15) {
            this.targetDirection = Math.random() * 360;
            this.targetSpeed = 0.9 + Math.random() * 0.6;
        }
        
        // Проверяем, не находимся ли мы в пределах расстояния для столкновений
        if (interactiveElements && interactiveElements.length > 0) {
            for (const element of interactiveElements) {
                const rect = element.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Преобразуем координаты из vw/vh в пиксели
                const bugX = (this.x * viewportWidth) / 100;
                const bugY = (this.y * viewportHeight) / 100;
                
                // Проверяем, не находимся ли мы рядом с элементом
                if (bugX > rect.left - 50 && bugX < rect.right + 50 &&
                    bugY > rect.top - 50 && bugY < rect.bottom + 50) {
                    
                    // Если с вероятностью 0.01 мы приземляемся на элемент
                    if (this.state === 'wander' && Math.random() < 0.01) {
                        this.startLanding(element);
                        break;
                    }
                }
            }
        }
        
        // Проверяем, не находимся ли мы в пределах расстояния для столкновений
        if (leaves && leaves.length > 0) {
            for (const leaf of leaves) {
                const leafRect = leaf.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Преобразуем координаты из vw/vh в пиксели
                const bugX = (this.x * viewportWidth) / 100;
                const bugY = (this.y * viewportHeight) / 100;
                
                // Проверяем, не находимся ли мы рядом с листом
                if (bugX > leafRect.left - 20 && bugX < leafRect.right + 20 &&
                    bugY > leafRect.top - 20 && bugY < leafRect.bottom + 20) {
                    
                    // Если с вероятностью 0.03 мы есть лист
                    if (['wander', 'following'].includes(this.state) && 
                        Math.random() < 0.03 && 
                        !leaf.classList.contains('eaten')) {
                        this.startEating(leaf);
                        break;
                    }
                }
            }
        }
    }

    update(deltaTime) {
        // Если в режиме перетаскивания, просто возвращаемся
        if (this.isDragging) return;
        
        // Добавляем проверку на "зависимость" от божьей коровки
        if (!this.lastPosition) {
            this.lastPosition = { x: this.x, y: this.y };
            this.stuckTime = 0;
            this.positionCheckTimer = 0;
            this.stuckRotation = 0; // Счетчик для обнаружения застревания в вертикальном положении
        }
        
        // Обновляем таймер каждые 300 мс
        this.positionCheckTimer += deltaTime;
        if (this.positionCheckTimer > 300) {
            const distMoved = Math.sqrt(
                Math.pow(this.x - this.lastPosition.x, 2) + 
                Math.pow(this.y - this.lastPosition.y, 2)
            );
            
            // Если божья коровка не двигается
            if (distMoved < 0.1) {
                this.stuckTime += this.positionCheckTimer;
                
                // Проверяем, не застряла ли божья коровка в вертикальном положении
                const isVerticallyStuck = Math.abs(this.direction % 180) < 10 || Math.abs(this.direction % 180 - 180) < 10;
                
                if (isVerticallyStuck) {
                    this.stuckRotation += this.positionCheckTimer;
                } else {
                    this.stuckRotation = 0;
                }
                
                // Если коровка застряла в вертикальном положении более 1000 мс
                if (this.stuckRotation > 1000) {
                    // Выводим из застрявшего состояния - меняем направление на случайное не вертикальное
                    this.targetDirection = 45 + Math.random() * 90; // От 45° до 135°
                    if (Math.random() < 0.5) this.targetDirection += 180; // Может быть также от 225° до 315°
                    
                    this.targetSpeed = 1.0 + Math.random() * 0.5;
                    this.changeState('wander', 0);
                    this.stuckRotation = 0;
                    this.stuckTime = 0;
                    
                    // Принудительно двигаем коровку, чтобы вывести из застрявшего положения
                    this.move(300);
                }
                // Обычная проверка на застревание по времени
                else if (this.stuckTime > 800 && 
                   !['sleeping', 'eating', 'rest'].includes(this.state)) {
                    // Если коровка "застряла" в состоянии dragging, восстановим её
                    if (this.element.classList.contains('dragging')) {
                        this.endDragging();
                    }
                    
                    // Выводим состояние из-за отсутствия движения
                    this.targetDirection = this.direction + (Math.random() * 40 - 20); // Меняем направление на случайное
                    this.targetSpeed = 0.6 + Math.random() * 0.4; 
                    this.changeState('wander', 0);
                    this.stuckTime = 0;
                    
                    // Гарантируем очистку стилей перехода
                    this.element.style.transition = '';
                }
            } else {
                // Если божья коровка двигается, сбрасываем таймеры задержки
                this.stuckTime = 0;
                this.stuckRotation = 0;
            }
            
            // Обновляем предыдущую позицию
            this.lastPosition.x = this.x;
            this.lastPosition.y = this.y;
            this.positionCheckTimer = 0;
        }
        
        // Обновляем параметры движения
        this.updateMovementParameters(deltaTime);
        
        // Обработка состояния божьей коровки
        if (this.stateTimer > 0) {
            this.stateTimer -= deltaTime;
            if (this.stateTimer <= 0) {
                // Переходим в следующее состояние в зависимости от текущего
                if (this.state === 'flee') {
                    // После бега удаляем
                    this.changeState('rest', 800);
                } else if (this.state === 'rest') {
                    // После отдыха переходим в обычное состояние
                    this.changeState('wander', 0);
                } else if (this.state === 'eating') {
                    // После поедания небольшой порции
                    this.targetLeaf = null;
                    this.changeState('rest', 500);
                } else if (this.state === 'sleeping') {
                    // После сна - бодрое состояние
                    this.changeState('wander', 0);
                } else if (this.state === 'flying') {
                    // После полета - медленное приземление
                    this.targetSpeed = 1;
                    this.changeState('wander', 0);
                } else if (this.state === 'dancing') {
                    // После танца - обычное состояние
                    this.changeState('wander', 0);
                } else if (this.state === 'following') {
                    // После следования - или продолжаем, или переходим в обычное состояние
                    this.targetLadybug = null;
                    if (Math.random() < 0.7) {
                        this.changeState('wander', 0);
                    } else {
                        // Если нет цели, меняем состояние на "отдых"
                        this.changeState('rest', 700);
                    }
                } else if (this.state === 'landing') {
                    // Завершаем посадку
                    this.endLanding();
                } else {
                    // После отдыха - блуждание
                    this.changeState('wander', 0);
                }
            }
        }

        // Логика в зависимости от текущего состояния
        if (this.state === 'wander') {
            this.handleWandering(deltaTime);
        } else if (this.state === 'following' && this.targetLadybug) {
            this.followTarget(deltaTime);
        } else if (this.state === 'landing' && this.targetElement) {
            this.landOnElement(deltaTime);
        } else if (this.state === 'flee') {
            // При беге с ускорением двигаемся с увеличенной скоростью в направлении, указанном в начале
            this.move(deltaTime);
        } else if (this.state === 'flying') {
            // При полете медленно перемещаемся вверх и вниз
            this.move(deltaTime);
            if (Math.random() < 0.03) { // Уменьшаем вероятность появления случайного направления с 0.05 до 0.03
                // Случайно меняем направление в полете, но не резко
                this.targetDirection += (Math.random() - 0.5) * 20; // Уменьшаем разброс на 30 до 20
            }
        }
        
        // Обновляем позицию
        this.updatePosition();
    }
    
    // Новый метод для изменения параметров движения
    updateMovementParameters(deltaTime) {
        // Вычисляем фактор плавности в зависимости от deltaTime, уменьшаем его для более плавного движения
        const smoothing = Math.min(this.smoothingFactor * (deltaTime / 25), 0.15); // Уменьшаем с 20 до 25, с 0.5 до 0.15
        
        // Меняем направление
        const angleDiff = this.targetDirection - this.direction;
        // Нормализуем разницу углов для вращения по кругу
        const normalizedDiff = ((angleDiff + 180) % 360) - 180;
        // Для более плавного вращения применяем больший фактор
        this.direction += normalizedDiff * smoothing;
        
        // Меняем скорость, используя больший фактор
        this.speed += (this.targetSpeed - this.speed) * (smoothing * 1.0); // Уменьшаем с 1.2 до 1.0
    }

    handleWandering(deltaTime) {
        // Обработка обычного состояния
        
        // Случайно меняем направление время от времени
        if (Math.random() < 0.003) { // Вероятность изменения направления
            this.targetDirection += (Math.random() - 0.5) * 25; // Случайное отклонение
        }
        
        // Устанавливаем скорость для блуждания
        this.targetSpeed = 0.9 + Math.random() * 1.1; // Увеличиваем скорость блуждания
        
        // С вероятностью 0.0005 переходим в новое состояние
        if (Math.random() < 0.0005) {
            const randomState = Math.random();
            
            // Увеличиваем вероятность перехода в состояние сна
            if (randomState < this.personality.laziness * 0.5) { // Увеличиваем влияние лени на сон (было 0.3)
                // Начинаем спать
                this.startSleeping();
            } else if (randomState < this.personality.laziness * 0.5 + 0.003) { // Увеличиваем скорость листа
                // Начинаем летать
                this.startFlying();
            } else if (randomState < this.personality.laziness * 0.5 + 0.006) { // Увеличиваем скорость танца
                // Начинаем танцевать
                this.startDancing();
            }
        }
        
        // Если рядом есть другие божьи коровки,
        // уменьшаем вероятность следования, особенно если их много
        if (this.nearbyLadybugs.length > 0) {
            // Чем больше соседей, тем меньше вероятность следования
            const followFactor = Math.max(0.1, 1 - this.nearbyLadybugs.length * 0.1);
            // Уменьшаем вероятность следования в 3 раза
            if (Math.random() < this.personality.sociability * 0.1 * followFactor) {
                const closest = this.nearbyLadybugs[0];
                this.startFollowing(closest);
            }
        }
        
        // Продолжаем движение
        this.move(deltaTime);
    }
    
    followTarget(deltaTime) {
        if (!this.targetLadybug) return;
        
        // Вычисляем направление к цели
        const dx = this.targetLadybug.x - this.x;
        const dy = this.targetLadybug.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Увеличиваем безразмерное расстояние следования
        const followDistance = 6; // Минимальное безразмерное расстояние следования
        
        if (distance < followDistance) {
            // Если близко - просто отходим, но остаемся на месте
            const repelAngle = Math.atan2(-dy, -dx);
            // Меняем направление
            this.targetDirection = repelAngle * 180 / Math.PI + (Math.random() * 10 - 5);
            
            // Скорость пропорциональна расстоянию
            const proximityFactor = 1 - (distance / followDistance);
            this.targetSpeed = 0.8 + proximityFactor * 1.0;
            
            // Если мы близко к цели,
            if (Math.random() < 0.02) {
                this.changeState('wander', 0);
                return;
            }
        } else if (distance < followDistance * 1.5) {
            // На большом расстоянии - останавливаемся или летим на месте
            if (Math.random() < 0.8) {
                this.targetSpeed = 0;
            } else {
                // Случайное движение по дуге с вращением
                const orbitAngle = Math.atan2(dy, dx) + (Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4);
                this.targetDirection = orbitAngle * 180 / Math.PI;
                this.targetSpeed = 0.2 + Math.random() * 0.1;
            }
        } else {
            // Если далеко от цели - просто летим с небольшой скоростью
            this.targetSpeed = 0.8 + Math.random() * 0.3;
            
            const targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Меняем направление
            this.targetDirection = targetDirection + (Math.random() * 10 - 5);
        }
        
        // Двигаемся
        this.move(deltaTime);
    }

    landOnElement(deltaTime) {
        if (!this.targetElement) return;
        
        const rect = this.targetElement.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Вычисляем координаты цели в пикселях
        const targetX = ((rect.left + rect.width / 2) / viewportWidth) * 100;
        const targetY = ((rect.top + rect.height / 2) / viewportHeight) * 100;
        
        // Вычисляем направление к цели
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если достаточно близко, завершаем посадку
        if (distance < 3) {
            this.endLanding();
            return;
        }
        
        const targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Меняем направление цели
        this.targetDirection = targetDirection;
        
        // Двигаемся
        this.move(deltaTime);
    }
    
    move(deltaTime) {
        // Не двигаемся при слишком малой скорости, чтобы избежать дергания
        if (this.speed < 0.3) {
            this.speed = 0;
            return;
        }

        // Проверяем, не установлено ли точно вертикальное направление
        if (Math.abs(this.direction % 180 - 90) < 1) {
            // Если направление точно 90° или 270°, добавляем небольшое отклонение
            this.direction += (Math.random() < 0.5 ? 5 : -5);
        }

        const radians = this.direction * Math.PI / 180;
        // Увеличиваем коэффициент скорости движения
        this.x += Math.cos(radians) * this.speed * deltaTime / 700; // Увеличиваем скорость движения (было 800)
        this.y += Math.sin(radians) * this.speed * deltaTime / 700; // Увеличиваем скорость движения (было 800)
        
        // Улучшенное отталкивание от границ экрана
        const borderMargin = 6; // Отступ от края экрана
        const pushForce = 0.8; // Сила отталкивания от границ
        
        if (this.x < borderMargin) {
            // Отталкиваемся от левого края
            this.x += pushForce * (borderMargin - this.x) / borderMargin;
            this.targetDirection = (Math.random() * 60) % 360; // Уменьшаем разброс направления (было 90-45)
            this.targetSpeed = 0.9 + Math.random() * 0.6; // Уменьшаем ускорение (было 1.2+0.8)
            // Увеличиваем дополнительный импульс
            this.x += 0.3; // Было 0.5
        } else if (this.x > (100 - borderMargin)) {
            // Отталкиваемся от правого края
            this.x -= pushForce * (this.x - (100 - borderMargin)) / borderMargin;
            this.targetDirection = (180 + Math.random() * 60 - 30) % 360; // Уменьшаем разброс направления
            this.targetSpeed = 0.9 + Math.random() * 0.6;
            // Увеличиваем дополнительный импульс
            this.x -= 0.3;
        }
        
        if (this.y < borderMargin) {
            // Отталкиваемся от верхнего края
            this.y += pushForce * (borderMargin - this.y) / borderMargin;
            this.targetDirection = (90 + Math.random() * 60 - 30) % 360; // Уменьшаем разброс направления
            this.targetSpeed = 0.9 + Math.random() * 0.6;
            // Увеличиваем дополнительный импульс
            this.y += 0.3;
        } else if (this.y > (100 - borderMargin)) {
            // Отталкиваемся от нижнего края
            this.y -= pushForce * (this.y - (100 - borderMargin)) / borderMargin;
            this.targetDirection = (270 + Math.random() * 60 - 30) % 360; // Уменьшаем разброс направления
            this.targetSpeed = 0.9 + Math.random() * 0.6;
            // Увеличиваем дополнительный импульс
            this.y -= 0.3;
        }
        
        // Пределы экрана
        if (this.x < 0) this.x = 0.5;
        if (this.x > 100) this.x = 99.5;
        if (this.y < 0) this.y = 0.5;
        if (this.y > 100) this.y = 99.5;
    }

    // Начало перетаскивания
    startDragging() {
        this.isDragging = true;
        this.changeState('dragging');
        
        // Запоминаем текущий масштаб
        this.originalScale = this.element.style.transform ? 
            parseFloat(this.element.style.transform.replace('scale(', '').replace(')', '')) || 1 : 1;
        
        // Сначала очищаем все текущие стили transition
        this.element.style.transition = '';
        
        // Добавляем плавный переход для трансформации
        this.element.style.transition = 'transform 0.2s ease-out';
        
        // Увеличиваем масштаб при перетаскивании
        this.element.style.transform = 'scale(1.8)';
        
        // Добавляем класс перетаскивания
        this.element.classList.add('dragging');
        
        // Меняем вид лица при перетаскивании
        this.makeAngryFace();
        
        // Увеличиваем z-index божьей коровки, чтобы она была поверх других элементов
        this.element.style.zIndex = '1100';
        
        // Устанавливаем скорость движения на 0
        this.speed = 0;
        this.targetSpeed = 0;
        
        // Добавляем знаки злости (восклицательные знаки)
        this.angerSigns = [];
        
        // Создаем 2-3 восклицательных знака
        const count = 2 + Math.floor(Math.random());
        
        for (let i = 0; i < count; i++) {
            const angerSign = document.createElement('div');
            angerSign.className = 'ladybug-anger-sign';
            angerSign.innerHTML = '&#x2757;'; // Восклицательный знак Unicode
            angerSign.style.position = 'absolute';
            // Увеличиваем размер восклицательного знака
            angerSign.style.fontSize = `${18 + i * 3}px`;
            angerSign.style.fontWeight = 'bold';
            angerSign.style.top = `-${20 + i * 10}px`;
            angerSign.style.right = `${-10 - i * 15}px`;
            angerSign.style.color = '#FF3333';
            angerSign.style.textShadow = '1px 1px 2px rgba(0,0,0,0.3)';
            angerSign.style.zIndex = '1101';
            angerSign.style.pointerEvents = 'none';
            angerSign.style.transform = `rotate(${-15 + Math.random() * 30}deg)`;
            angerSign.style.animation = `angerAnimation ${0.8 + i * 0.2}s infinite alternate`;
            angerSign.style.animationDelay = `${i * 0.15}s`;
            
            this.element.appendChild(angerSign);
            this.angerSigns.push(angerSign);
        }
        
        // Добавляем анимацию для восклицательных знаков
        this.angerAnimationStyle = document.createElement('style');
        this.angerAnimationStyle.textContent = `
            @keyframes angerAnimation {
                0% {
                    transform: scale(0.7) translateY(0) rotate(-5deg);
                }
                100% {
                    transform: scale(1.1) translateY(-5px) rotate(5deg);
                }
            }
        `;
        document.head.appendChild(this.angerAnimationStyle);
    }
    
    // Завершение перетаскивания
    endDragging() {
        // Защита от двойного вызова
        if (!this.isDragging) return;
        
        this.isDragging = false;
        
        // Немедленно удаляем класс перетаскивания
        this.element.classList.remove('dragging');
        
        // Немедленно восстанавливаем нормальное лицо
        this.restoreNormalFace();
        
        // Немедленно восстанавливаем z-index
        this.element.style.zIndex = '1000';
        
        // Удаляем элементы гнева сразу
        if (this.angerSigns && this.angerSigns.length) {
            this.angerSigns.forEach(sign => {
                if (sign && sign.parentNode) {
                    sign.parentNode.removeChild(sign);
                }
            });
            this.angerSigns = [];
        }
        
        // Удаляем анимацию для знаков немедленно
        if (this.angerAnimationStyle && this.angerAnimationStyle.parentNode) {
            this.angerAnimationStyle.parentNode.removeChild(this.angerAnimationStyle);
            this.angerAnimationStyle = null;
        }
        
        // Очищаем переходы немедленно
        this.element.style.transition = '';
        
        // Создаем новую функцию для безопасного возврата с рандомизированным начальным углом
        const safeRestore = () => {
            // Сначала восстановим масштаб
            this.element.style.transform = `scale(${this.originalScale || 1})`;
            
            // Небольшая задержка перед восстановлением поворота
            setTimeout(() => {
                // Генерируем случайный начальный угол, избегая вертикальных углов
                let newDirection;
                do {
                    newDirection = Math.random() * 360;
                } while (Math.abs(newDirection % 180 - 90) < 15); // Избегаем углов близких к 90/270
                
                this.direction = newDirection;
                this.targetDirection = newDirection;
                
                // Применяем стандартный поворот, избегая вертикальных углов
                const rotateAngle = this.direction;
                this.element.style.transform = `rotate(${rotateAngle}deg)`;
                
                // Запускаем божью коровку в случайном направлении
                this.speed = 0.6 + Math.random() * 1.0;
                this.targetSpeed = this.speed;
                
                // Небольшое смещение в случайном направлении для гарантии движения
                const radians = this.direction * Math.PI / 180;
                this.x += Math.cos(radians) * 0.5;
                this.y += Math.sin(radians) * 0.5;
                this.updatePosition();
                
                // Переход в состояние блуждания
                if (this.beforeDragState) {
                    this.changeState(this.beforeDragState);
                    this.beforeDragState = null;
                } else {
                    this.changeState('wander');
                }
            }, 50);
        };
        
        // Выполняем безопасное восстановление сразу
        safeRestore();
    }

    // Новый обработчик для mousedown
    handleMouseDown(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Запоминаем время и позицию клика
        this.mouseDownTime = Date.now();
        this.mouseDownX = e.clientX;
        this.mouseDownY = e.clientY;
        
        // Устанавливаем флаг перетаскивания
        this.potentialDrag = true;
        
        // Получаем позицию элемента и вычисляем смещение для перетаскивания (если элемент был инициализирован)
        const rect = this.element.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
    }
    
    // Обычный обработчик для mousemove
    handleMouseMove(e) {
        // Если мы уже в режиме перетаскивания, обновляем позицию
        if (this.isDragging) {
            // Получаем текущую позицию мыши
            const mouseX = e.clientX;
            const mouseY = e.clientY;
            
            // Вычисляем новую позицию элемента
            const left = mouseX - this.dragOffsetX;
            const top = mouseY - this.dragOffsetY;
            
            // Преобразуем координаты из vw/vh в пиксели
            const vw = window.innerWidth / 100;
            const vh = window.innerHeight / 100;
            
            this.x = left / vw;
            this.y = top / vh;
            
            // Обновляем позицию
            this.updatePosition();
            return;
        }
        
        // Если есть флаг перетаскивания, проверяем, достаточно ли быстро мышь двигается для начала перетаскивания
        if (this.potentialDrag) {
            const dx = e.clientX - this.mouseDownX;
            const dy = e.clientY - this.mouseDownY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если движение превышает пороговое значение, начинаем перетаскивание
            if (distance > this.moveThreshold) {
                // Сохраняем текущее состояние перед началом перетаскивания
                this.beforeDragState = this.state;
                
                // Анимация перетаскивания
                this.startDragging();
            }
        }
    }
    
    // Обычный обработчик для mouseup
    handleMouseUp(e) {
        // Защита от ситуации, когда mouseup произошел за пределами окна
        if (!this.potentialDrag && !this.isDragging) return;
        
        // Если было перетаскивание, завершаем его
        if (this.isDragging) {
            this.endDragging();
            this.potentialDrag = false;
            return;
        }
        
        // Если было перетаскивание, но движение было недостаточно быстрым, и время нажатия было меньше порогового значения
        if (this.potentialDrag) {
            const clickDuration = Date.now() - this.mouseDownTime;
            
            // Если это был клик, показываем счастье
            if (clickDuration < this.clickThreshold) {
                this.showHappiness();
            }
            
            this.potentialDrag = false;
        }
    }

    // Новый обработчик для touchstart
    handleTouchStart(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Получаем первое касание
        const touch = e.touches[0];
        
        // Запоминаем время и позицию касания
        this.mouseDownTime = Date.now();
        this.mouseDownX = touch.clientX;
        this.mouseDownY = touch.clientY;
        
        // Устанавливаем флаг перетаскивания
        this.potentialDrag = true;
        
        // Получаем позицию элемента и вычисляем смещение для перетаскивания
        const rect = this.element.getBoundingClientRect();
        this.dragOffsetX = touch.clientX - rect.left;
        this.dragOffsetY = touch.clientY - rect.top;
    }
    
    // Обычный обработчик для touchmove
    handleTouchMove(e) {
        // Если мы уже в режиме перетаскивания, обновляем позицию
        if (this.isDragging) {
            // Получаем первое касание
            const touch = e.touches[0];
            
            // Получаем текущую позицию касания
            const touchX = touch.clientX;
            const touchY = touch.clientY;
            
            // Вычисляем новую позицию элемента
            const left = touchX - this.dragOffsetX;
            const top = touchY - this.dragOffsetY;
            
            // Преобразуем координаты из vw/vh в пиксели
            const vw = window.innerWidth / 100;
            const vh = window.innerHeight / 100;
            
            this.x = left / vw;
            this.y = top / vh;
            
            // Обновляем позицию
            this.updatePosition();
            return;
        }
        
        // Если есть флаг перетаскивания, проверяем, достаточно ли быстро касание продолжается для начала перетаскивания
        if (this.potentialDrag) {
            const touch = e.touches[0];
            const dx = touch.clientX - this.mouseDownX;
            const dy = touch.clientY - this.mouseDownY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Если движение превышает пороговое значение, начинаем перетаскивание
            if (distance > this.moveThreshold) {
                // Сохраняем текущее состояние перед началом перетаскивания
                this.beforeDragState = this.state;
                
                // Анимация перетаскивания
                this.startDragging();
            }
        }
    }
    
    // Обычный обработчик для touchend
    handleTouchEnd(e) {
        // Защита от ситуации, когда touchend произошел за пределами окна
        if (!this.potentialDrag && !this.isDragging) return;
        
        // Если было перетаскивание, завершаем его
        if (this.isDragging) {
            this.endDragging();
            this.potentialDrag = false;
            return;
        }
        
        // Если было перетаскивание, но движение было недостаточно быстрым, и время нажатия было меньше порогового значения
        if (this.potentialDrag) {
            const clickDuration = Date.now() - this.mouseDownTime;
            
            // Если это был конечный тап, показываем счастье
            if (clickDuration < this.clickThreshold) {
                this.showHappiness();
            }
            
            this.potentialDrag = false;
        }
    }

    // Делаем лицо злого таракана
    makeAngryFace() {
        // Находим элементы глаз и улыбки
        const leftEye = this.element.querySelector('.ladybug-eye-left');
        const rightEye = this.element.querySelector('.ladybug-eye-right');
        const smile = this.element.querySelector('.ladybug-smile');
        
        // Меняем размер головы - делаем их немного выше и наклонными
        if (leftEye) {
            leftEye.style.height = '20%';
            leftEye.style.transform = 'rotate(-20deg)';
        }
        
        if (rightEye) {
            rightEye.style.height = '20%';
            rightEye.style.transform = 'rotate(20deg)';
        }
        
        // Меняем улыбку на ненадутой гриме
        if (smile) {
            smile.style.borderBottom = 'none';
            smile.style.borderTop = '2px solid #210f4b';
            smile.style.borderRadius = '50% 50% 0 0';
            smile.style.top = '60%';
        }
        
        // Добавляем анимацию для антенн
        const leftAntenna = this.element.querySelector('.ladybug-antenna-left');
        const rightAntenna = this.element.querySelector('.ladybug-antenna-right');
        
        if (leftAntenna) {
            leftAntenna.style.animation = 'antennaShake 0.3s infinite';
        }
        
        if (rightAntenna) {
            rightAntenna.style.animation = 'antennaShake 0.3s infinite';
            rightAntenna.style.animationDelay = '0.15s';
        }
    }
    
    // Возвращаем нормальное лицо
    restoreNormalFace() {
        // Находим элементы глаз и улыбки
        const leftEye = this.element.querySelector('.ladybug-eye-left');
        const rightEye = this.element.querySelector('.ladybug-eye-right');
        const smile = this.element.querySelector('.ladybug-smile');
        
        // Восстанавливаем голову
        if (leftEye) {
            leftEye.style.height = '25%';
            leftEye.style.transform = 'none';
        }
        
        if (rightEye) {
            rightEye.style.height = '25%';
            rightEye.style.transform = 'none';
        }
        
        // Восстанавливаем улыбку
        if (smile) {
            smile.style.borderBottom = '2px solid #210f4b';
            smile.style.borderTop = 'none';
            smile.style.borderRadius = '0 0 50% 50%';
            smile.style.top = '55%';
        }
        
        // Возвращаем анимацию для антенн
        const leftAntenna = this.element.querySelector('.ladybug-antenna-left');
        const rightAntenna = this.element.querySelector('.ladybug-antenna-right');
        
        if (leftAntenna) {
            leftAntenna.style.animation = 'antennaWiggle 2s ease-in-out infinite';
            leftAntenna.style.animationDelay = '-0.5s';
        }
        
        if (rightAntenna) {
            rightAntenna.style.animation = 'antennaWiggle 2s ease-in-out infinite';
            rightAntenna.style.animationDelay = '-1s';
        }
    }
}

// Контроллер для управления всеми божьими коровками и их взаимодействием
class LadybugController {
    constructor() {
        // Создаем контейнер для божьих коровок
        this.container = document.createElement('div');
        this.container.className = 'ladybugs-container';
        document.body.appendChild(this.container);
        
        // Массив всех божьих коровок
        this.ladybugs = [];
        
        // Элементы страницы, на которые можно нажать (карточки предложений, таймер обратного отсчета, рекламные бары)
        this.interactiveElements = Array.from(document.querySelectorAll('.offer-card, .countdown-timer, .promo-bar'));
        
        // Массив для хранения листьев
        this.leaves = [];
        
        // Время последнего обновления
        this.lastUpdateTime = Date.now();
        
        // Позиция мыши на предыдущем кадре
        this.lastMouseX = null;
        this.lastMouseY = null;
        
        // Количество божьих коровок
        const countValue = getComputedStyle(document.documentElement).getPropertyValue('--ladybug-count').trim();
        this.count = parseInt(countValue) || 7; // Если не указано, то 7 по умолчанию
        
        // Флаг видимости страницы
        this.isPageVisible = true;
        
        // Идентификатор интервала для обновления, когда страница не активна
        this.updateInterval = null;
        
        // Настройка отслеживания мыши
        this.setupMouseTracking();
        // Настройка отслеживания видимости страницы
        this.setupVisibilityTracking();
        this.createLeaves(10); // Создаем 10 начальных листьев
        this.createLadybugs();
        this.startUpdateLoop();
    }
    
    setupMouseTracking() {
        // Отслеживаем движение мыши для взаимодействия с божьими коровками
        document.addEventListener('mousemove', (e) => {
            // Преобразуем координаты мыши в vw/vh
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            this.lastMouseX = (e.clientX / viewportWidth) * 100;
            this.lastMouseY = (e.clientY / viewportHeight) * 100;
        });
        
        // Отключаем координаты мыши при выходе из области
        document.addEventListener('mouseout', () => {
            this.lastMouseX = null;
            this.lastMouseY = null;
        });
    }
    
    setupVisibilityTracking() {
        // Отслеживаем видимость страницы
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = document.visibilityState === 'visible';
            
            // Переключаемся между requestAnimationFrame и setInterval
            if (this.isPageVisible) {
                // Если страница стала видимой, останавливаем интервал и возобновляем анимацию
                if (this.updateInterval) {
                    clearInterval(this.updateInterval);
                    this.updateInterval = null;
                }
                this.lastUpdateTime = Date.now();
                requestAnimationFrame(this.update.bind(this));
            } else {
                // Если страница стала невидимой, запускаем интервал для обновления
                if (!this.updateInterval) {
                    this.updateInterval = setInterval(() => {
                        const currentTime = Date.now();
                        const deltaTime = currentTime - this.lastUpdateTime;
                        this.updateLadybugs(deltaTime);
                        this.lastUpdateTime = currentTime;
                    }, 50); // Обновление примерно 20 раз в секунду
                }
            }
        });
    }
    
    createLeaves(count = 1) {
        for (let i = 0; i < count; i++) {
            const leaf = document.createElement('div');
            leaf.className = 'leaf';
            
            // Случайное положение листа
            leaf.style.left = `${5 + Math.random() * 90}vw`;
            leaf.style.top = `${5 + Math.random() * 90}vh`;
            
            // Случайный поворот
            leaf.style.transform = `rotate(${Math.random() * 360}deg)`;
            
            document.body.appendChild(leaf);
            this.leaves.push(leaf);
        }
    }
    
    createLadybugs() {
        for (let i = 0; i < this.count; i++) {
            const ladybug = new Ladybug(this, i);
            this.container.appendChild(ladybug.element);
            this.ladybugs.push(ladybug);
        }
    }
    
    // Обновление божьих коровок
    updateLadybugs(deltaTime) {
        // Удаляем уже удаленные листья из массива
        this.leaves = this.leaves.filter(leaf => document.body.contains(leaf));
        
        // Обновляем позицию каждой божьей коровки
        this.ladybugs.forEach(ladybug => {
            // Определяем взаимодействие
            ladybug.detectCollision(this.ladybugs, this.interactiveElements, this.leaves);
            ladybug.update(deltaTime);
        });
    }
    
    // Обновление анимации
    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastUpdateTime;
        
        this.updateLadybugs(deltaTime);
        
        this.lastUpdateTime = currentTime;
        
        // Продолжаем анимацию только если страница видима
        if (this.isPageVisible) {
            requestAnimationFrame(this.update.bind(this));
        }
    }
    
    startUpdateLoop() {
        // Запускаем анимацию
        this.lastUpdateTime = Date.now();
        requestAnimationFrame(this.update.bind(this));
    }
}

// Добавляем CSS анимации для новых элементов
const styleSheet = document.createElement('style');
styleSheet.textContent = `
@keyframes heartFloat {
    0% {
        opacity: 0;
        transform: scale(1, 0.5) translateY(0) rotate(0deg);
    }
    20% {
        opacity: 1;
        transform: scale(1, 0.5) translateY(-5px) rotate(5deg);
    }
    60% {
        opacity: 1;
        transform: scale(1, 0.5) translateY(-15px) rotate(-5deg);
    }
    100% {
        opacity: 0;
        transform: scale(1, 0.5) translateY(-25px) rotate(10deg);
    }
}

@keyframes sleepZ {
    0% {
        opacity: 0;
        transform: translateY(0) scale(0.7);
    }
    30% {
        opacity: 0.8;
        transform: translateY(-5px) scale(0.8) rotate(-5deg);
    }
    70% {
        opacity: 1;
        transform: translateY(-15px) scale(1) rotate(5deg);
    }
    100% {
        opacity: 0;
        transform: translateY(-25px) scale(0.7) rotate(15deg);
    }
}

.ladybug-heart {
    display: inline-block;
    color: #ff6b6b;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
}

.ladybug-sleep-z {
    font-family: 'Arial', sans-serif;
    color: #210f4b;
    font-style: italic;
    filter: drop-shadow(0 1px 1px rgba(0,0,0,0.1));
}
`;
document.head.appendChild(styleSheet);

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new LadybugController();
}); 
