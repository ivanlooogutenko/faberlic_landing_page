"use strict";
class CountdownTimer {
    constructor(endDateString) {
        // Парсим дату окончания
        this.endDate = new Date(endDateString);
        
        // Получаем все элементы DOM
        this.daysTens = document.getElementById('days-tens').querySelector('span');
        this.daysOnes = document.getElementById('days-ones').querySelector('span');
        this.hoursTens = document.getElementById('hours-tens').querySelector('span');
        this.hoursOnes = document.getElementById('hours-ones').querySelector('span');
        this.minutesTens = document.getElementById('minutes-tens').querySelector('span');
        this.minutesOnes = document.getElementById('minutes-ones').querySelector('span');
        this.secondsTens = document.getElementById('seconds-tens').querySelector('span');
        this.secondsOnes = document.getElementById('seconds-ones').querySelector('span');
        
        // Проверяем, что элементы фона корректно добавлены
        this.checkAndFixTimerStructure();
        
        // Предустановка фиксированной ширины для всех цифр
        this.setFixedWidthForDigits();
        
        // Инициализируем таймер
        this.updateTimer();
        this.startTimer();
    }
    
    // Проверяем и исправляем структуру HTML таймера
    checkAndFixTimerStructure() {
        const digitElements = document.querySelectorAll('.timer-digit');
        
        digitElements.forEach(digit => {
            // Проверяем, есть ли у блока цифры элементы для 3D-эффекта
            if (!digit.querySelector('.timer-digit-front')) {
                // Создаем передний элемент, если его нет
                const frontElement = document.createElement('div');
                frontElement.className = 'timer-digit-front';
                digit.appendChild(frontElement);
            }
            
            if (!digit.querySelector('.timer-digit-back')) {
                // Создаем задний элемент, если его нет
                const backElement = document.createElement('div');
                backElement.className = 'timer-digit-back';
                digit.appendChild(backElement);
            }
            
            // Перемещаем span в передний слой, если уже не там
            const span = digit.querySelector('span');
            if (span && digit.childNodes[0] === span) {
                digit.appendChild(span);
            }
        });
    }
    
    // Устанавливаем фиксированную ширину для всех цифр
    setFixedWidthForDigits() {
        const digits = document.querySelectorAll('.timer-digit span');
        digits.forEach(digit => {
            digit.style.width = '1em'; // Фиксированная ширина
            digit.style.textAlign = 'center';
            digit.style.display = 'inline-block'; // Для лучшей поддержки блочной модели
            digit.style.lineHeight = '1'; // Предотвращает дергание по вертикали
        });
    }
    
    // Обновление таймера
    updateTimer() {
        const now = new Date();
        const diff = this.endDate.getTime() - now.getTime();
        if (diff <= 0) {
            // Когда время истекло
            this.updateDisplay(0, 0, 0, 0);
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
            }
            return;
        }
        // Вычисляем оставшееся время
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        // Обновляем отображение
        this.updateDisplay(days, hours, minutes, seconds);
    }
    
    // Обновление отображения таймера
    updateDisplay(days, hours, minutes, seconds) {
        this.updateDigits(this.daysTens, this.daysOnes, days);
        this.updateDigits(this.hoursTens, this.hoursOnes, hours);
        this.updateDigits(this.minutesTens, this.minutesOnes, minutes);
        this.updateDigits(this.secondsTens, this.secondsOnes, seconds);
    }
    
    // Обновление конкретной пары цифр (десятки и единицы)
    updateDigits(tensElement, onesElement, value) {
        if (tensElement && onesElement) {
            const tens = Math.floor(value / 10);
            const ones = value % 10;
            tensElement.textContent = tens.toString();
            onesElement.textContent = ones.toString();
        }
    }
    
    // Запуск таймера
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    // Метод для создания пунктирной линии между цифрами и фиксации стилей
    addSeparatorLines() {
        // Получаем все блоки с цифрами
        const digitBlocks = document.querySelectorAll('.timer-unit');
        
        // Обеспечиваем правильные стили для всех блоков (включая последний)
        digitBlocks.forEach(block => {
            // Гарантируем, что темный фон (нижний прямоугольник) всегда есть 
            const blockStyle = {
                position: 'relative',
                display: 'flex',
                gap: '0',
                backgroundColor: 'transparent',
                borderRadius: 'var(--digit-border-radius)',
            };
            
            // Применяем стили к блоку
            Object.assign(block.style, blockStyle);
            
            // Создаем или находим нижний (темный) прямоугольник
            let darkBg = block.querySelector('.timer-unit-dark-bg');
            if (!darkBg) {
                darkBg = document.createElement('div');
                darkBg.className = 'timer-unit-dark-bg';
                block.appendChild(darkBg);
            }
            
            // Берем значение смещения из CSS
            const digitOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--digit-offset').trim()) || 3;
            
            // Стили для темного фона
            Object.assign(darkBg.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                backgroundColor: 'var(--digit-back-color)',
                borderRadius: 'calc(var(--digit-border-radius) + 3px)', // Увеличиваем скругление углов для темного фона
                zIndex: '0'
            });
            
            // Проверяем наличие светлого (верхнего) прямоугольника
            let lightBg = block.querySelector('.timer-unit-light-bg');
            if (!lightBg) {
                lightBg = document.createElement('div');
                lightBg.className = 'timer-unit-light-bg';
                block.appendChild(lightBg);
            }
            
            // Стили для светлого фона
            Object.assign(lightBg.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                width: 'calc(100% - 3px)', // Отступ справа 3px
                height: 'calc(100% - 7px)', // Отступ снизу 7px
                backgroundColor: 'var(--digit-bg-color)',
                borderRadius: 'var(--digit-border-radius)',
                zIndex: '1',
                transform: 'none' // Не смещаем светлый фон
            });
            
            // Получаем все цифры в блоке
            const digits = block.querySelectorAll('.timer-digit');
            
            // Устанавливаем правильный z-index для цифр
            digits.forEach(digit => {
                digit.style.zIndex = '2';
                digit.style.position = 'relative'; // Обеспечиваем, что цифры выше фонов
            });
            
            // Если в блоке есть две цифры, добавляем разделитель
            if (digits.length === 2) {
                // Создаем разделитель
                const separator = document.createElement('div');
                separator.className = 'digit-separator';
                
                // Настраиваем стиль разделителя
                Object.assign(separator.style, {
                    position: 'absolute',
                    left: `calc(50% - 4px)`, // Смещаем линию немного влево
                    top: '0',
                    height: '100%',
                    width: '0',
                    borderRight: '1px dashed #597db4',
                    zIndex: '3', // Выше светлого фона, но ниже цифр
                    pointerEvents: 'none'
                });
                
                // Добавляем разделитель в блок цифр
                block.appendChild(separator);
            }
        });
    }
}

// Стили для сепаратора и блоков
const style = document.createElement('style');
style.textContent = `
.digit-separator {
    position: absolute;
    border-right: 1px dashed #597db4;
    z-index: 3;
    pointer-events: none;
}

/* Убираем все старые стили для разделителей в CSS */
.timer-digit:first-child::after {
    display: none !important;
    content: none !important;
    border: none !important;
}

/* Удаляем стили по умолчанию, которые могут мешать */
.timer-unit::before,
.timer-unit::after {
    display: none !important;
    content: none !important;
}

/* Убеждаемся, что темный фон всегда видим (включая последний блок) */
.timer-unit-dark-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: var(--digit-back-color);
    border-radius: calc(var(--digit-border-radius) + 3px); /* Увеличиваем скругление углов для темного фона */
    z-index: 0;
}

/* Убеждаемся, что светлый фон всегда находится поверх темного и меньше него */
.timer-unit-light-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: calc(100% - 3px);  /* Отступ справа 3px */
    height: calc(100% - 7px);  /* Отступ снизу 7px */
    background-color: var(--digit-bg-color);
    border-radius: var(--digit-border-radius);
    z-index: 1;
}

/* Убеждаемся, что цифры наверху */
.timer-digit {
    position: relative;
    z-index: 2;
}

/* Устанавливаем минимальные размеры для ячеек таймера */
.timer-digit {
    min-width: 56px;  /* Было 40px, увеличено на коэффициент 1.4 */
    min-height: 84px;  /* Было 60px, увеличено на коэффициент 1.4 */
    display: flex;
    align-items: center;
    justify-content: center;
}

.timer-digit span {
    font-size: 2.8rem;  /* Было 2rem, увеличено на коэффициент 1.4 */
}

@media (max-width: 768px) {
    .timer-unit-dark-bg,
    .timer-unit-light-bg {
        display: block !important;
    }
    
    .timer-unit-dark-bg {
        background-color: var(--digit-back-color) !important;
        border-radius: calc(var(--digit-border-radius) + 3px) !important;
        z-index: 0 !important;
        width: 100% !important;
        height: 100% !important;
    }
    
    .timer-unit-light-bg {
        background-color: var(--digit-bg-color) !important;
        border-radius: var(--digit-border-radius) !important;
        z-index: 1 !important;
        width: calc(100% - 3px) !important;
        height: calc(100% - 7px) !important;
    }
    
    .digit-separator {
        left: calc(50% - 4px) !important; /* Смещаем линию немного влево */
    }
    
    .timer-digit {
        min-width: 49px;  /* Было 35px, увеличено на коэффициент 1.4 */
        min-height: 70px;  /* Было 50px, увеличено на коэффициент 1.4 */
    }
    
    .timer-digit span {
        font-size: 2.45rem;  /* Было 1.75rem, увеличено на коэффициент 1.4 */
    }
}

/* Предотвращаем слишком сильное уменьшение ячеек на маленьких экранах */
@media (max-width: 600px) {
    .timer-blocks {
        display: grid;
        grid-template-columns: repeat(2, 1fr) !important;
        grid-gap: 15px !important;
        margin: 0 auto;
        width: 95% !important;  /* Было 90%, увеличено для размещения больших ячеек */
        max-width: 500px !important;  /* Было 400px, увеличено для размещения больших ячеек */
    }
    
    .timer-digit {
        min-width: 42px !important;  /* Было 30px, увеличено на коэффициент 1.4 */
        min-height: 63px !important;  /* Было 45px, увеличено на коэффициент 1.4 */
    }
    
    .timer-digit span {
        font-size: 2.1rem !important;  /* Было 1.5rem, увеличено на коэффициент 1.4 */
    }
    
    .timer-block {
        margin-bottom: 14px !important;  /* Было 10px, увеличено на коэффициент 1.4 */
    }
}

/* Для очень маленьких экранов */
@media (max-width: 400px) {
    .timer-digit {
        min-width: 39px !important;  /* Было 28px, увеличено на коэффициент 1.4 */
        min-height: 59px !important;  /* Было 42px, увеличено на коэффициент 1.4 */
    }
    
    .timer-digit span {
        font-size: 2rem !important;  /* Было 1.4rem, увеличено на коэффициент 1.4 */
    }
    
    .timer-blocks {
        grid-gap: 14px !important;  /* Было 10px, увеличено на коэффициент 1.4 */
    }
}
`;
document.head.appendChild(style);

// Создаем экземпляр таймера с фиксированными значениями для демонстрации
document.addEventListener('DOMContentLoaded', () => {
    // Создаем таймер с указанными значениями из макета
    const timer = new CountdownTimer(new Date(Date.now() + 1000000000)); // Просто большое время в будущем
    
    // Установим конкретные значения из макета
    timer.updateDisplay(3, 7, 46, 3);
    
    // Добавляем разделительные линии между цифрами
    timer.addSeparatorLines();
    
    // Запускаем таймер для постоянного обновления
    // timer.startTimer(); // Уже запущен в конструкторе
});
