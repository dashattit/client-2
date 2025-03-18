/ компонент column
Vue.component('column', {
    props: ['title', 'notes', 'maxNotes', 'isLocked', 'allowAdd'],
    // шаблон
    template: `
        <div class="column" :class="{ 'locked': isLocked }">
            <h2>{{ title }}</h2>
            <note-card 
                v-for="(note, index) in notes" 
                :key="note.id" 
                :note="note" 
                @update-note="$emit('update-note', index, $event)"
                @move-note="$emit('move-note', index, $event)"
            ></note-card>
            <button @click="$emit('add-note')" v-if="allowAdd" :disabled="notes.length >= maxNotes || isLocked">Добавить карточку</button>
        </div>
    `
});

// компонент note-card
Vue.component('note-card', {
    // принимаем props, который содержит данные
    props: ['note'],
    // шаблон
    template: `
        <div class="note-card">
            <h3>{{ note.title }}</h3>
            <ul>
                <li v-for="(item, index) in note.items" :key="index">
                    <label>
                        <input type="checkbox" v-model="item.completed" @change="updateCompletion">
                        {{ item.text }}
                    </label>
                </li>
            </ul>
            <p v-if="note.completedDate">Завершено: {{ note.completedDate }}</p>
        </div>
    `,
    // метод для обработки изменения пункта
    methods: {
        updateCompletion() {
            // генерируем событие и передаем обновленную карточку
            this.$emit('update-note', this.note);
        }
    }
});

// главный компонент App
let App = ({
    template: `
        <div class="columns">
            <column 
                title="Столбец 1" 
                :notes="firstColumnNotes" 
                :maxNotes="3" 
                :isLocked="isFirstColumnLocked"
                :allowAdd="true"
                @update-note="updateNote"
                @move-note="moveNote"
                @add-note="showCreateForm = true"
            ></column>
            <column 
                title="Столбец 2" 
                :notes="secondColumnNotes" 
                :maxNotes="5" 
                :isLocked="false"
                :allowAdd="false"
                @update-note="updateNote"
                @move-note="moveNote"
            ></column>
            <column 
                title="Столбец 3" 
                :notes="thirdColumnNotes" 
                :maxNotes="Infinity" 
                :isLocked="false"
                :allowAdd="false"
                @update-note="updateNote"
                @move-note="moveNote"
            ></column>
            <!-- Форма для создания новой карточки -->
            <div class="new-note-form" v-if="showCreateForm">
                <input type="text" v-model="newNoteTitle" placeholder="Название карточки">
                <ul>
                    <li v-for="(item, index) in newNoteItems" :key="index">
                        <input type="text" v-model="item.text" placeholder="Пункт списка">
                        <button @click="removeItem(index)">Удалить</button>
                    </li>
                </ul>
                <button @click="addItem">Добавить пункт</button>
                <button @click="createNote">Создать карточку</button>
                <button @click="showCreateForm = false">Отмена</button>
            </div>
        </div>
    `,
    data() {
        return {
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            isFirstColumnLocked: false,
            newNoteTitle: '',
            newNoteItems: [{ text: '' }],
            showCreateForm: false
        };
    },
    computed: {
        firstColumnNotes() {
            return this.notes.filter(note => note.column === 1);
        },
        secondColumnNotes() {
            return this.notes.filter(note => note.column === 2);
        },
        thirdColumnNotes() {
            return this.notes.filter(note => note.column === 3);
        }
    },
    methods: {
        // Создание глубокой копии карточки
        deepCopyNote(note) {
            return JSON.parse(JSON.stringify(note));
        },
        createNote() {
            if (this.newNoteTitle && this.newNoteItems.some(item => item.text)) {
                const newNote = {
                    id: Date.now(),
                    title: this.newNoteTitle,
                    items: this.newNoteItems.filter(item => item.text).map(item => ({ text: item.text, completed: false })),
                    column: 1, // Новая карточка всегда создается в первом столбце
                    completedDate: null
                };
                this.notes.push(newNote);
                this.newNoteTitle = '';
                this.newNoteItems = [{ text: '' }];
                this.showCreateForm = false;
                this.saveNotes();
            }
        },
        addItem() {
            this.newNoteItems.push({ text: '' });
        },
        removeItem(index) {
            if (this.newNoteItems.length > 1) {
                this.newNoteItems.splice(index, 1);
            }
        },
        updateNote(index, updatedNote) {
            // Создаем глубокую копию обновленной карточки
            const noteCopy = this.deepCopyNote(updatedNote);
            this.notes[index] = noteCopy;
            this.checkNoteCompletion(index); // Проверяем состояние карточки
            this.saveNotes();
        },
        moveNote(index, newColumn) {
            // Создаем глубокую копию карточки перед перемещением
            const noteCopy = this.deepCopyNote(this.notes[index]);
            noteCopy.column = newColumn;
            this.notes[index] = noteCopy;
            this.saveNotes();
        },
        checkNoteCompletion(index) {
            const note = this.notes[index];
            const completedItems = note.items.filter(item => item.completed).length;
            const totalItems = note.items.length;

            // Если все пункты выполнены (100%)
            if (completedItems === totalItems) {
                note.completedDate = new Date().toLocaleString();
                this.moveNote(index, 3); // Перемещаем в третий столбец
            }
            // Если выполнено больше 50% и карточка в первом столбце
            else if (completedItems > totalItems / 2 && note.column === 1) {
                if (this.secondColumnNotes.length < 5) {
                    this.moveNote(index, 2); // Перемещаем во второй столбец
                } else {
                    this.isFirstColumnLocked = true; // Блокируем первый столбец, если второй переполнен
                }
            }
            // Если выполнено меньше 50% и карточка не в первом столбце
            else if (completedItems <= totalItems / 2 && note.column !== 1) {
                this.moveNote(index, 1); // Возвращаем в первый столбец
            }
        },
        saveNotes() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        }
    }
});

// Главный экземпляр Vue
let app = new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App
    }
});