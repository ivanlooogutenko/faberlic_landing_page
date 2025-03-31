"use strict";

class ViewsCounter {
    constructor(initialViews = 1234) {
        // Получаем все элементы DOM
        this.thousandsElement = document.getElementById('views-thousands').querySelector('span');
        this.hundredsElement = document.getElementById('views-hundreds').querySelector('span');
        this.tensElement = document.getElementById('views-tens').querySelector('span');
        this.onesElement = document.getElementById('views-ones').querySelector('span');
        
        // Устанавливаем начальное значение счетчика
        this.viewsCount = initialViews;
        
        // Инициализируем счетчик
        this.updateDisplay();
        
        // Запускаем автоматическое обновление счетчика
        this.startAutoIncrement();
    }
    
    // Обновление отображения счетчика
    updateDisplay() {
        const thousands = Math.floor(this.viewsCount / 1000) % 10;
        const hundreds = Math.floor(this.viewsCount / 100) % 10;
        const tens = Math.floor(this.viewsCount / 10) % 10;
        const ones = this.viewsCount % 10;
        
        this.thousandsElement.textContent = thousands.toString();
        this.hundredsElement.textContent = hundreds.toString();
        this.tensElement.textContent = tens.toString();
        this.onesElement.textContent = ones.toString();
    }
    
    // Увеличение счетчика на 1
    increment() {
        this.viewsCount++;
        
        // Если достигли 10000, сбрасываем до 1000
        if (this.viewsCount >= 10000) {
            this.viewsCount = 1000;
        }
        
        this.updateDisplay();
    }
    
    // Запуск автоматического обновления
    startAutoIncrement() {
        const scheduleNextIncrement = () => {
            // Случайное время от 1 до 3 минут (в миллисекундах)
            const randomTime = Math.floor(Math.random() * (180000 - 60000 + 1) + 60000);
            
            setTimeout(() => {
                this.increment();
                scheduleNextIncrement(); // Планируем следующее увеличение
            }, randomTime);
        };
        
        // Запускаем процесс
        scheduleNextIncrement();
        
        // Для демонстрации, добавим первое увеличение через короткое время
        setTimeout(() => {
            this.increment();
        }, 5000);
    }
}

// Инициализация счетчика при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Создаем счетчик с начальным значением
    const viewsCounter = new ViewsCounter(1234);
}); 