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
}

// Создаем экземпляр таймера с фиксированными значениями для демонстрации
document.addEventListener('DOMContentLoaded', () => {
    // Создаем таймер с указанными значениями из макета
    const timer = new CountdownTimer(new Date(Date.now() + 1000000000)); // Просто большое время в будущем
    
    // Установим конкретные значения из макета
    timer.updateDisplay(3, 7, 46, 3);
    
    // Запускаем таймер для постоянного обновления
    // timer.startTimer(); // Уже запущен в конструкторе
});
