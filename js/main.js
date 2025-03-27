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

// главный компонент App с модальным окном
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
            <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
                <div class="modal">
                    <div class="modal-header">
                        <h3>Создать новую карточку</h3>
                        <button @click="closeModal" class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <label>Название карточки:</label>
                            <input v-model="newNoteTitle" type="text" placeholder="Введите название">
                        </div>
                        
                        <div class="items-list">
                            <div v-for="(item, index) in newNoteItems" :key="index" class="item-row">
                                <input 
                                    v-model="item.text" 
                                    type="text" 
                                    :placeholder="'Пункт ' + (index + 1)"
                                >
                                <button 
                                    v-if="newNoteItems.length > minItems" 
                                    @click="removeItem(index)"
                                    class="remove-btn"
                                >&times;</button>
                            </div>
                        </div>
                        
                        <div class="controls">
                            <button 
                                @click="addItem" 
                                :disabled="newNoteItems.length >= maxItems"
                                class="add-item-btn"
                            >
                                Добавить пункт ({{ newNoteItems.length }}/{{ maxItems }})
                            </button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="createNote" :disabled="!canCreateNote" class="create-btn">
                            Создать
                        </button>
                        <button @click="closeModal" class="cancel-btn">Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            notes: JSON.parse(localStorage.getItem('notes')) || [],
            isFirstColumnLocked: false,
            showModal: false,
            newNoteTitle: '',
            newNoteItems: [
                { text: '', completed: false },
                { text: '', completed: false },
                { text: '', completed: false } // начальные три обязательных пункта
            ],
            currentNote: null,
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
        },
        canCreateNote() {
            const filledItems = this.newNoteItems.filter(item => item.text.trim() !== '');
            return this.newNoteTitle.trim() !== '' && filledItems.length >= this.minItems;
        }
    },
    methods: {
        openModal() {
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.resetForm();
        },
        resetForm() {
            this.newNoteTitle = '';
            this.newNoteItems = [
                { text: '', completed: false },
                { text: '', completed: false },
                { text: '', completed: false }
            ];
        },
        addItem() {
            if (this.newNoteItems.length < this.maxItems) {
                this.newNoteItems.push({ text: '', completed: false });
            }
        },
        removeItem(index) {
            if (this.newNoteItems.length > this.minItems) {
                this.newNoteItems.splice(index, 1);
            }
        },
        createNote() {
            if (!this.canCreateNote) return;
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
            
            if (completedItems === totalItems && totalItems > 0) {
                note.completedDate = new Date().toLocaleString();
                this.$nextTick(() => {
                    this.moveCurrentNote(3);
                });
            } 
            else if (completedItems > totalItems / 2 && note.column === 1) {
                this.$nextTick(() => {
                    this.moveCurrentNote(2);
                });
            }
            else if (note.column === 2 && completedItems === totalItems && totalItems > 0) {
                note.completedDate = new Date().toLocaleString();
                this.$nextTick(() => {
                    this.moveCurrentNote(3);
                });
            }
        },
        saveNotes() {
            localStorage.setItem('notes', JSON.stringify(this.notes));
        }
    }
});

let app = new Vue({
    el: '#app',
    template: '<App/>',
    components: {
        App
    }
});