// компонент column
Vue.component('column', {
    props: ['title', 'notes', 'maxNotes', 'isLocked'],
    template: `
        <div class="column" :class="{ 'locked': isLocked }">
            <h2>{{ title }}</h2>
            <note-card 
                v-for="note in notes" 
                :key="note.id" 
                :note="note" 
                @update-note="handleUpdateNote"
                @move-note="handleMoveNote"
            ></note-card>
            <button 
                v-if="title === 'Столбец 1 (до 3 карточек)'" 
                @click="$emit('add-note')" 
                :disabled="notes.length >= maxNotes || isLocked"
            >Добавить карточку</button>
        </div>
    `,
    methods: {
        // Получение обновленной карточки
        handleUpdateNote(updatedNote) {
            this.$emit('update-note', updatedNote);
        },
        // Получение номера нового столбца
        handleMoveNote(newColumn) {
            this.$emit('move-note', newColumn);
        }
    }
});

// компонент note-card
Vue.component('note-card', {
    props: ['note'],
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
    methods: {
        // Генерация события и передача текущего состояния карточки
        updateCompletion() {
            this.$emit('update-note', this.note);
        }
    }
});

// главный компонент App
let App = ({
    template: `
        <div class="columns">
            <column 
                title="Столбец 1 (до 3 карточек)" 
                :notes="firstColumnNotes" 
                :maxNotes="3" 
                :isLocked="isFirstColumnLocked"
                @update-note="updateNote"
                @move-note="moveCurrentNote"
                @add-note="openModal"
            ></column>
            <column 
                title="Столбец 2 (до 5 карточек)" 
                :notes="secondColumnNotes" 
                :maxNotes="5" 
                :isLocked="false"
                @update-note="updateNote"
                @move-note="moveCurrentNote"
            ></column>
            <column 
                title="Столбец 3 (без ограничений)" 
                :notes="thirdColumnNotes" 
                :maxNotes="Infinity" 
                :isLocked="false"
                @update-note="updateNote"
                @move-note="moveCurrentNote"
            ></column>
            
            <!-- Модальное окно для создания карточки -->
            <div v-if="isModalOpen" class="modal">
                <div class="modal-content">
                    <h2>Создать новую карточку</h2>
                    <label>
                        Название карточки:
                        <input v-model="newNoteTitle" type="text">
                    </label>
                    <div v-for="(item, index) in newNoteItems" :key="index">
                        <label>
                            Пункт {{ index + 1 }}:
                            <input v-model="item.text" type="text">
                        </label>
                        <button 
                            v-if="newNoteItems.length > minItems" 
                            @click="newNoteItems.splice(index, 1)"
                            class="remove-item"
                        >×</button>
                    </div>
                    <div class="item-controls">
                        <button 
                            @click="addNewItem" 
                            :disabled="newNoteItems.length >= maxItems"
                        >Добавить пункт (макс. {{maxItems}})</button>
                        <span class="counter">
                            Пунктов: {{newNoteItems.length}}/{{maxItems}}
                        </span>
                    </div>
                    <button @click="createNote">Создать карточку</button>
                    <button @click="closeModal">Отмена</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            isFirstColumnLocked: false,
            isModalOpen: false,
            newNoteTitle: '',
            newNoteItems: [{ text: '', completed: false }],
            currentNote: null,
            newNoteItems: [
                { text: '', completed: false },
                { text: '', completed: false },
                { text: '', completed: false } // Начальные 3 обязательных пункта
            ],
            maxItems: 5, 
            minItems: 3
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
        openModal() {
            this.isModalOpen = true;
        },
        closeModal() {
            this.isModalOpen = false;
            this.newNoteTitle = '';
            this.newNoteItems = [{ text: '', completed: false }];
        },
        addNewItem() {
            if (this.newNoteItems.length < this.maxItems) {
                this.newNoteItems.push({ text: '', completed: false });
            }
        },
        createNote() {
            // Проверка на минимальное количество заполненных пунктов
            const filledItems = this.newNoteItems.filter(item => item.text.trim() !== '');
            if (filledItems.length < this.minItems) {
                alert(`Должно быть заполнено минимум ${this.minItems} пункта`);
                return;
            }
            
            if (this.firstColumnNotes.length >= 3) return;
            
            const newNote = {
                id: Date.now(),
                title: this.newNoteTitle,
                items: this.newNoteItems.filter(item => item.text.trim() !== ''),
                column: 1,
                completedDate: null
            };
            this.notes.push(newNote);
            this.saveNotes();
            this.closeModal();
        },
        updateNote(updatedNote) {
            const index = this.notes.findIndex(n => n.id === updatedNote.id);
            if (index !== -1) {
                this.notes[index] = updatedNote;
                this.checkNoteCompletion(updatedNote);
                this.saveNotes();
            }
        },
        moveCurrentNote(newColumn) {
            if (!this.currentNote) return;
            
            const index = this.notes.findIndex(n => n.id === this.currentNote.id);
            if (index !== -1) {
                // Проверяем ограничения для столбца 2
                if (newColumn === 2 && this.secondColumnNotes.length >= 5) {
                    this.isFirstColumnLocked = true;
                    return;
                }
                
                this.notes[index].column = newColumn;
                this.saveNotes();
                this.isFirstColumnLocked = false;
            }
        },
        checkNoteCompletion(note) {
            // Текущее состояние карточки
            this.currentNote = note;
            const completedItems = note.items.filter(item => item.completed).length;
            const totalItems = note.items.length;
            
            // Логика перемещений по условиями
            // 1. Если все пункты выполнены - перемещаем в столбец 3
            if (completedItems === totalItems && totalItems > 0) {
                note.completedDate = new Date().toLocaleString();
                this.$nextTick(() => {
                    this.moveCurrentNote(3);
                });
            } 
            // 2. Если выполнено больше половины - перемещаем в столбец 2 (если есть место)
            else if (completedItems > totalItems / 2 && note.column === 1) {
                this.$nextTick(() => {
                    this.moveCurrentNote(2);
                });
            }
            // 3. Если в столбце 2 и все пункты выполнены - перемещаем в столбец 3
            else if (note.column === 2 && completedItems === totalItems && totalItems > 0) {
                note.completedDate = new Date().toLocaleString();
                this.$nextTick(() => {
                    this.moveCurrentNote(3);
                });
            }
        },
        // Сохранение данных в хранилище
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