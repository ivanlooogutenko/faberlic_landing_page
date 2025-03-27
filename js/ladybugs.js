// Класс для божьей коровки с расширенным поведением
class Ladybug {
    constructor(controller, id) {
        this.id = id;
        this.controller = controller;
        this.element = this.createLadybugElement();
        this.x = Math.random() * 90;
        this.y = Math.random() * 90;
        this.speed = 0.3 + Math.random() * 1.0; // Уменьшаем скорость
        this.direction = Math.random() * 360;
        this.rotationSpeed = 0.1 + Math.random() * 0.3; // Уменьшаем скорость поворота
        
        // Добавляем переменные для плавности движения
        this.targetDirection = this.direction;
        this.targetSpeed = this.speed;
        this.lastRepelTime = 0;
        this.smoothingFactor = 0.05; // Уменьшаем фактор плавности для более мягкого движения
        
        // Увеличиваем количество состояний
        this.states = ['wander', 'flee', 'rest', 'eating', 'sleeping', 'flying', 'dancing', 'following', 'landing'];
        this.state = 'wander'; // начальное состояние
        
        this.stateTimer = 0;
        this.nearbyLadybugs = [];
        this.targetElement = null;
        this.targetLeaf = null;
        this.isHappy = false; // настроение
        this.trail = []; // след за божьей коровкой
        this.trailUpdateCounter = 0;
        
        this.personality = {
            sociability: Math.random(), // склонность к группированию
            curiosity: Math.random(),   // склонность к исследованию
            laziness: Math.random(),    // склонность к отдыху
            playfulness: Math.random(), // склонность к играм
            fearfulness: Math.random()  // склонность к страху
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
        
        // Создаем симметричные пятна
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
        
        // Добавляем усики
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
        
        // Добавляем ножки ВНУТРИ тела (ключевое отличие)
        for (let i = 1; i <= 6; i++) {
            const leg = document.createElement('div');
            leg.className = `ladybug-leg ladybug-leg-${i}`;
            leg.style.animationDelay = `${Math.random() * 0.5}s`;
            // Ножки добавляем в тело напрямую
            body.appendChild(leg);
        }
        
        // Добавляем тело в основной контейнер
        ladybug.appendChild(body);
        
        return ladybug;
    }

    setupEventListeners() {
        // При нажатии - показываем "счастье"
        this.element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showHappiness();
        });
        
        // При наведении мыши - убегание или иное поведение
        this.element.addEventListener('mouseover', () => {
            // С вероятностью, зависящей от fearfulness, убегаем
            if (Math.random() < this.personality.fearfulness) {
                this.startFlee();
            } else if (Math.random() < this.personality.playfulness) {
                // Иначе с вероятностью, зависящей от playfulness, начинаем танцевать
                this.startDancing();
            }
        });
        
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.showHappiness();
        });
    }
    
    startSleeping() {
        this.changeState('sleeping', 5000 + Math.random() * 5000);
        this.speed = 0; // не двигаемся во время сна
        
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
    
    // Показываем счастье (улыбаемся и подпрыгиваем) с улучшенной анимацией сердечек
    showHappiness() {
        this.isHappy = true;
        this.element.style.transform = 'scale(1.2)';
        
        // Определяем цвета сердечек - более мягкие оттенки розового и красного
        const colors = [
            '#ff9999', '#ffb3b3', '#ffcccc', // Светлые тона
            '#ff7777', '#ff5252', '#ff6b6b', // Средние тона
            '#e57373', '#ef5350', '#f44336'  // Насыщенные тона
        ];
        
        // Создаем больше сердечек для охвата всего периметра
        for (let i = 0; i < 24; i++) {
            const heart = document.createElement('div');
            heart.className = 'ladybug-heart';
            
            // Используем unicode сердце
            heart.innerHTML = '&#x2764;';
            heart.style.position = 'absolute';
            heart.style.fontSize = `${10 + Math.random() * 10}px`; // Разные размеры от 10px до 20px
            
            // Рандомизируем начальное положение по всему периметру вокруг божьей коровки
            const angle = Math.random() * Math.PI * 2; // Полный круг (от 0 до 2π)
            const distance = 5 + Math.random() * 10; // Расстояние от центра
            // Центрируем положение сердечек относительно божьей коровки
            heart.style.left = `${15 + Math.cos(angle) * distance}px`;
            heart.style.top = `${15 + Math.sin(angle) * distance}px`;
            
            // Выбираем случайный цвет из палитры
            heart.style.color = colors[Math.floor(Math.random() * colors.length)];
            heart.style.opacity = '0';
            heart.style.zIndex = '1001';
            heart.style.pointerEvents = 'none';
            
            // Добавляем эффект свечения для некоторых сердечек
            if (Math.random() > 0.6) {
                heart.style.filter = `drop-shadow(0 0 2px ${heart.style.color})`;
            } else {
                heart.style.filter = 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))';
            }
            
            // Делаем сердечки плоскими с разной степенью сплющенности
            const flatness = 0.3 + Math.random() * 0.3; // От 0.3 до 0.6
            heart.style.transform = `scale(1, ${flatness})`;
            
            // Добавляем уникальные параметры анимации для большего разнообразия
            const duration = 1.2 + Math.random() * 1.5; // От 1.2 до 2.7 секунд
            const delay = Math.random() * 0.5; // От 0 до 0.5 секунд
            const maxHeight = 30 + Math.random() * 20; // Максимальная высота подъема
            
            // Анимация для каждого сердечка будет направлена от центра наружу
            const keyframes = `
                @keyframes heart${this.id}_${i} {
                    0% {
                        opacity: 0;
                        transform: scale(1, ${flatness}) translate(0, 0) rotate(0deg);
                    }
                    15% {
                        opacity: 0.9;
                        transform: scale(1, ${flatness}) translate(${Math.cos(angle) * 5}px, ${Math.sin(angle) * 5}px) rotate(${(Math.random() - 0.5) * 10}deg);
                    }
                    70% {
                        opacity: 0.8;
                        transform: scale(1, ${flatness}) translate(${Math.cos(angle) * 20}px, ${Math.sin(angle) * 20}px) rotate(${(Math.random() - 0.5) * 25}deg);
                    }
                    100% {
                        opacity: 0;
                        transform: scale(1, ${flatness}) translate(${Math.cos(angle) * 40}px, ${Math.sin(angle) * 40}px) rotate(${(Math.random() - 0.5) * 40}deg);
                    }
                }
            `;
            
            // Добавляем стиль с анимацией в head
            const style = document.createElement('style');
            style.textContent = keyframes;
            document.head.appendChild(style);
            
            // Применяем уникальную анимацию
            heart.style.animation = `heart${this.id}_${i} ${duration}s ${delay}s forwards`;
            
            this.element.appendChild(heart);
            
            // Удаляем сердечки и стиль через время
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.parentNode.removeChild(heart);
                }
                if (style.parentNode) {
                    style.parentNode.removeChild(style);
                }
            }, (duration + delay) * 1000 + 100);
        }
        
        // Возвращаем обычное состояние через 1.5 секунды
        setTimeout(() => {
            this.element.style.transform = '';
            this.isHappy = false;
        }, 1500);
    }

    startFlee() {
        this.changeState('flee', 2000); // сокращаем время бегства для плавности
        
        // Плавно увеличиваем скорость при убегании
        this.targetSpeed = 2 + Math.random() * 1.5; // уменьшаем скорость бегства
        
        // Меняем направление в противоположную сторону от курсора
        const cursorX = this.controller.lastMouseX;
        const cursorY = this.controller.lastMouseY;
        
        if (cursorX !== null && cursorY !== null) {
            // Вычисляем направление от курсора к божьей коровке
            const dx = this.x - cursorX;
            const dy = this.y - cursorY;
            this.targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Добавляем небольшое случайное отклонение
            this.targetDirection += (Math.random() - 0.5) * 30;
        } else {
            // Если нет данных о курсоре, просто выбираем случайное направление
            this.targetDirection = (this.direction + 120 + Math.random() * 60) % 360;
        }
    }
    
    startDancing() {
        this.changeState('dancing', 4000); // танцуем 4 секунды
        this.speed = 0.1; // очень медленное перемещение во время танца
    }
    
    startFlying() {
        this.changeState('flying', 5000); // летаем 5 секунд
        this.targetSpeed = 3 + Math.random() * 2; // снижаем скорость полета
        this.y -= 3; // медленнее взлетаем вверх
    }
    
    startEating(leaf) {
        this.targetLeaf = leaf;
        this.changeState('eating', 3000 + Math.random() * 2000);
        this.speed = 0; // не двигаемся во время еды
        
        // Отмечаем лист как "съедаемый"
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
        this.changeState('following', 3000 + Math.random() * 2000);
        this.targetLadybug = target;
        this.speed = 1.2 + Math.random() * 0.8; // Уменьшаем скорость следования
    }
    
    startLanding(element) {
        this.changeState('landing', 4000 + Math.random() * 3000);
        this.targetElement = element;
        this.speed = 1 + Math.random(); // умеренная скорость для посадки
    }
    
    endLanding() {
        if (this.targetElement) {
            // После посадки отдыхаем на элементе
            this.changeState('rest', 3000 + Math.random() * 2000);
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
        
        // Специальная обработка для некоторых состояний
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
            this.speed = 0.5 + Math.random() * 1.5;
        } else if (newState === 'rest') {
            this.speed = 0;
        }
    }

    updatePosition() {
        this.element.style.left = `${this.x}vw`;
        this.element.style.top = `${this.y}vh`;
        
        // Поворачиваем в соответствии с направлением движения только если не в специальных состояниях
        if (!['dancing', 'sleeping', 'eating', 'rest'].includes(this.state)) {
            this.element.style.transform = `rotate(${this.direction}deg)`;
        }
        
        // Обновляем след каждые несколько кадров, только во время движения
        if (this.speed > 0 && ++this.trailUpdateCounter % 5 === 0) {
            this.createTrail();
        }
    }
    
    createTrail() {
        // Создаем элемент следа
        const trail = document.createElement('div');
        trail.className = 'ladybug-trail';
        trail.style.left = `${this.x}vw`;
        trail.style.top = `${this.y}vh`;
        
        // Добавляем в DOM
        document.body.appendChild(trail);
        
        // Добавляем в массив следов
        this.trail.push(trail);
        
        // Ограничиваем количество следов
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
        // Текущее время для контроля частоты отталкивания
        const currentTime = Date.now();
        
        // Поиск ближайших божьих коровок
        this.nearbyLadybugs = otherLadybugs.filter(other => {
            if (other.id === this.id) return false;
            
            // Рассчитываем расстояние между божьими коровками
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Считаем близкими, если расстояние меньше 20vw (увеличено для раннего обнаружения)
            return distance < 20;
        });
        
        // Сортируем по близости
        this.nearbyLadybugs.sort((a, b) => {
            const distA = Math.sqrt(Math.pow(a.x - this.x, 2) + Math.pow(a.y - this.y, 2));
            const distB = Math.sqrt(Math.pow(b.x - this.x, 2) + Math.pow(b.y - this.y, 2));
            return distA - distB;
        });
        
        // Проверяем наложения с другими божьими коровками
        const minDistance = 15; // Увеличиваем минимальную дистанцию (было 10)
        const criticalDistance = 8; // Увеличиваем критическую дистанцию (было 5)
        
        // Подсчитываем количество очень близких коровок
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
        
        // Еще больше увеличиваем силу отталкивания
        const crowdFactor = Math.min(1.5, nearbyCount * 0.4); // Увеличено для большего отталкивания
        
        // Сокращаем время задержки между отталкиваниями для более активной реакции
        const repelCooldown = 150 + (nearbyCount * 30); // Уменьшено для более частого реагирования
        
        // Флаг, который определяет, было ли отталкивание
        let wasRepelled = false;
        
        for (const other of otherLadybugs) {
            if (other.id === this.id) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Начинаем отталкивание раньше для более плавного разделения
            if (distance < minDistance) {
                // Всегда легкое отталкивание при приближении
                const repelAngle = Math.atan2(-dy, -dx);
                const forceFactor = Math.pow(1 - (distance / minDistance), 1.5);
                
                // Базовое отталкивание даже при кулдауне
                this.x += Math.cos(repelAngle) * forceFactor * 0.15;
                this.y += Math.sin(repelAngle) * forceFactor * 0.15;
                
                // Основное отталкивание с задержкой
                if (currentTime - this.lastRepelTime < repelCooldown && this.state !== 'flee') {
                    continue;
                }
                
                this.lastRepelTime = currentTime;
                wasRepelled = true;
                
                // Коэффициент силы отталкивания с резким ростом при малом расстоянии
                const repelStrength = Math.pow(1 - (distance / minDistance), 2.2) * (1.8 + crowdFactor);
                
                // При критически малом расстоянии - мгновенно раздвигаем коровок
                if (distance < criticalDistance) {
                    // Принудительно изменяем координаты с большим шагом
                    const pushAmount = (criticalDistance - distance + 1.0) * (2.0 + crowdFactor);
                    
                    // Сильный импульс для надёжного разделения
                    this.x += Math.cos(repelAngle) * pushAmount * 0.9;
                    this.y += Math.sin(repelAngle) * pushAmount * 0.9;
                    
                    // Резко меняем направление
                    this.direction = repelAngle * 180 / Math.PI;
                    this.targetDirection = this.direction;
                    
                    // Увеличиваем скорость для немедленного разделения
                    this.speed = 2.5 + Math.random() * 1.0 + crowdFactor;
                    this.targetSpeed = this.speed;
                    
                    // Всегда переходим в состояние бегства при критическом сближении
                    this.changeState('flee', 1500 + crowdFactor * 1000);
                } 
                // Более раннее и сильное отталкивание при просто близком расстоянии
                else {
                    // Устанавливаем направление противоположное от другой коровки
                    this.targetDirection = repelAngle * 180 / Math.PI + (Math.random() * 15 - 7.5);
                    
                    // Значительно увеличиваем скорость для эффективного разделения
                    this.targetSpeed = 1.2 + 1.5 * repelStrength;
                    
                    // Если мы следуем за коровкой, но слишком близко, переходим в состояние бегства
                    if (this.state === 'following' && this.targetLadybug && this.targetLadybug.id === other.id) {
                        this.changeState('flee', 1200);
                    }
                }
                
                // Добавляем небольшое случайное отклонение для естественности
                this.targetDirection += (Math.random() - 0.5) * 5;
                
                // Немедленно обновляем позицию для начала разделения при любом расстоянии меньше минимального
                this.move(60);
                
                // Разрываем цикл после взаимодействия с ближайшей коровкой
                break;
            }
        }
        
        // Если мы находимся рядом с другими коровками, но не было отталкивания,
        // то с большой вероятностью меняем направление на случайное, чтобы разбить группы
        if (this.nearbyLadybugs.length > 1 && !wasRepelled && Math.random() < 0.15) {
            this.targetDirection = Math.random() * 360;
            this.targetSpeed = 0.9 + Math.random() * 1.0;
        }
        
        // Проверяем столкновения с интерактивными элементами
        if (interactiveElements && interactiveElements.length > 0) {
            for (const element of interactiveElements) {
                const rect = element.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Преобразуем координаты из vw/vh в пиксели
                const bugX = (this.x * viewportWidth) / 100;
                const bugY = (this.y * viewportHeight) / 100;
                
                // Проверяем, не находится ли божья коровка близко к элементу
                if (bugX > rect.left - 50 && bugX < rect.right + 50 &&
                    bugY > rect.top - 50 && bugY < rect.bottom + 50) {
                    
                    // С некоторой вероятностью решаем "приземлиться" на элемент
                    if (this.state === 'wander' && Math.random() < 0.01) {
                        this.startLanding(element);
                        break;
                    }
                }
            }
        }
        
        // Проверяем столкновения с листьями
        if (leaves && leaves.length > 0) {
            for (const leaf of leaves) {
                const leafRect = leaf.getBoundingClientRect();
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                
                // Преобразуем координаты из vw/vh в пиксели
                const bugX = (this.x * viewportWidth) / 100;
                const bugY = (this.y * viewportHeight) / 100;
                
                // Проверяем, не находится ли божья коровка близко к листу
                if (bugX > leafRect.left - 20 && bugX < leafRect.right + 20 &&
                    bugY > leafRect.top - 20 && bugY < leafRect.bottom + 20) {
                    
                    // С некоторой вероятностью решаем "съесть" лист
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
        // Плавно изменяем направление и скорость
        this.updateMovementParameters(deltaTime);
        
        // Обработка таймера состояния
        if (this.stateTimer > 0) {
            this.stateTimer -= deltaTime;
            if (this.stateTimer <= 0) {
                // Переходим в следующее состояние в зависимости от текущего
                if (this.state === 'flee') {
                    // После бегства отдыхаем
                    this.changeState('rest', 2000);
                } else if (this.state === 'rest') {
                    // После отдыха - в обычное состояние
                    this.changeState('wander', 0);
                } else if (this.state === 'eating') {
                    // После еды - небольшой отдых
                    this.targetLeaf = null;
                    this.changeState('rest', 1000);
                } else if (this.state === 'sleeping') {
                    // После сна - бодрое состояние
                    this.changeState('wander', 0);
                } else if (this.state === 'flying') {
                    // После полета - медленно приземляемся
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
                        // Иногда после следования отдыхаем
                        this.changeState('rest', 2000);
                    }
                } else if (this.state === 'landing') {
                    // Завершаем посадку
                    this.endLanding();
                } else {
                    // По умолчанию - в состояние wandering
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
            // При бегстве просто двигаемся с повышенной скоростью в установленном направлении
            this.move(deltaTime);
        } else if (this.state === 'flying') {
            // При полете перемещаемся быстрее и немного вверх
            this.move(deltaTime);
            if (Math.random() < 0.05) {
                // Случайно меняем направление в полете, но не резко
                this.targetDirection += (Math.random() - 0.5) * 30;
            }
        }
        
        // Обновляем позицию
        this.updatePosition();
    }
    
    // Новый метод для плавного изменения параметров движения
    updateMovementParameters(deltaTime) {
        // Рассчитываем фактор сглаживания в зависимости от deltaTime
        const smoothing = Math.min(this.smoothingFactor * (deltaTime / 20), 0.5);
        
        // Плавно изменяем направление
        const angleDiff = this.targetDirection - this.direction;
        // Нормализуем разницу углов для корректного поворота
        const normalizedDiff = ((angleDiff + 180) % 360) - 180;
        this.direction += normalizedDiff * smoothing;
        
        // Плавно изменяем скорость с более быстрым переходом для лучшего разделения
        this.speed += (this.targetSpeed - this.speed) * (smoothing * 1.2);
    }

    handleWandering(deltaTime) {
        // Обработка обычного состояния
        
        // Случайно меняем направление время от времени
        // Делаем изменения направления менее резкими и более редкими
        if (Math.random() < 0.005) { // Уменьшаем вероятность изменения направления
            this.targetDirection += (Math.random() - 0.5) * 40; // Уменьшаем амплитуду поворота
        }
        
        // С небольшой вероятностью переходим в новое состояние
        if (Math.random() < 0.0005) {
            const randomState = Math.random();
            
            if (randomState < this.personality.laziness * 0.5) {
                // Засыпаем
                this.startSleeping();
            } else if (randomState < this.personality.laziness * 0.5 + 0.002) {
                // Начинаем летать
                this.startFlying();
            } else if (randomState < this.personality.laziness * 0.5 + 0.004) {
                // Начинаем танцевать
                this.startDancing();
            }
        }
        
        // Если рядом есть другие божьи коровки, взаимодействуем с ними
        // Уменьшаем вероятность следования, особенно если есть много соседних коровок
        if (this.nearbyLadybugs.length > 0) {
            // Чем больше соседей, тем меньше вероятность следования
            const followFactor = Math.max(0.1, 1 - this.nearbyLadybugs.length * 0.1);
            // Снижаем вероятность следования в 3 раза
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
        
        // Увеличиваем безопасную дистанцию следования
        const followDistance = 6; // Минимальная безопасная дистанция
        
        if (distance < followDistance) {
            // Если слишком близко - отходим, но плавно
            const repelAngle = Math.atan2(-dy, -dx);
            // Плавно меняем направление
            this.targetDirection = repelAngle * 180 / Math.PI + (Math.random() * 10 - 5);
            
            // Скорость пропорциональна близости, но с плавным изменением
            const proximityFactor = 1 - (distance / followDistance);
            this.targetSpeed = 0.8 + proximityFactor * 1.0;
            
            // С определенной вероятностью прекращаем следование при близком расстоянии
            if (Math.random() < 0.02) {
                this.changeState('wander', 0);
                return;
            }
        } else if (distance < followDistance * 1.5) {
            // На комфортной дистанции - останавливаемся или медленно кружим с большей вероятностью остановки
            if (Math.random() < 0.8) {
                this.targetSpeed = 0;
            } else {
                // Случайное движение по дуге с плавным изменением
                const orbitAngle = Math.atan2(dy, dx) + (Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 4);
                this.targetDirection = orbitAngle * 180 / Math.PI;
                this.targetSpeed = 0.2 + Math.random() * 0.1;
            }
        } else {
            // Если далеко от цели - следуем к ней с умеренной скоростью
            this.targetSpeed = 0.8 + Math.random() * 0.3;
            
            const targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
            
            // Плавно поворачиваем к цели
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
        
        // Рассчитываем целевые координаты в центре элемента
        const targetX = ((rect.left + rect.width / 2) / viewportWidth) * 100;
        const targetY = ((rect.top + rect.height / 2) / viewportHeight) * 100;
        
        // Вычисляем направление к цели
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если достаточно близко, считаем, что посадка завершена
        if (distance < 3) {
            this.endLanding();
            return;
        }
        
        const targetDirection = Math.atan2(dy, dx) * 180 / Math.PI;
        
        // Плавно меняем целевое направление
        this.targetDirection = targetDirection;
        
        // Двигаемся
        this.move(deltaTime);
    }
    
    move(deltaTime) {
        if (this.speed <= 0) return;
        
        const radians = this.direction * Math.PI / 180;
        this.x += Math.cos(radians) * this.speed * deltaTime / 1000;
        this.y += Math.sin(radians) * this.speed * deltaTime / 1000;
        
        // Проверка границ экрана и отражение от них
        if (this.x < 0) {
            this.x = 0;
            this.direction = (180 - this.direction) % 360;
        } else if (this.x > 95) {
            this.x = 95;
            this.direction = (180 - this.direction) % 360;
        }
        
        if (this.y < 0) {
            this.y = 0;
            this.direction = (360 - this.direction) % 360;
        } else if (this.y > 95) {
            this.y = 95;
            this.direction = (360 - this.direction) % 360;
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
        
        // Интерактивные элементы страницы, на которые могут садиться божьи коровки
        this.interactiveElements = Array.from(document.querySelectorAll('.offer-card, .countdown-timer, .promo-bar'));
        
        // Массив для хранения листьев
        this.leaves = [];
        
        // Последнее время обновления
        this.lastUpdateTime = Date.now();
        
        // Отслеживание положения мыши
        this.lastMouseX = null;
        this.lastMouseY = null;
        
        // Количество божьих коровок
        const countValue = getComputedStyle(document.documentElement).getPropertyValue('--ladybug-count').trim();
        this.count = parseInt(countValue) || 7; // Если не указано, то 7 по умолчанию
        
        // Инициализация
        this.setupMouseTracking();
        this.createLeaves(10); // Создаем 10 начальных листьев
        this.createLadybugs();
        this.startUpdateLoop();
    }
    
    setupMouseTracking() {
        // Отслеживаем движение мыши для реакции на курсор
        document.addEventListener('mousemove', (e) => {
            // Преобразуем координаты мыши в vw/vh
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            
            this.lastMouseX = (e.clientX / viewportWidth) * 100;
            this.lastMouseY = (e.clientY / viewportHeight) * 100;
        });
        
        // Очищаем координаты при уходе мыши за пределы окна
        document.addEventListener('mouseout', () => {
            this.lastMouseX = null;
            this.lastMouseY = null;
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
    
    startUpdateLoop() {
        const update = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - this.lastUpdateTime;
            
            // Чистим удаленные листья из массива
            this.leaves = this.leaves.filter(leaf => document.body.contains(leaf));
            
            // Обновляем поведение каждой божьей коровки
            this.ladybugs.forEach(ladybug => {
                // Определяем взаимодействия
                ladybug.detectCollision(this.ladybugs, this.interactiveElements, this.leaves);
                ladybug.update(deltaTime);
            });
            
            this.lastUpdateTime = currentTime;
            requestAnimationFrame(update);
        };
        
        requestAnimationFrame(update);
    }
}

// Добавим CSS анимации для новых элементов
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