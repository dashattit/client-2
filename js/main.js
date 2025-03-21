// компонент column
Vue.component('column', {
    props: ['title', 'notes', 'maxNotes', 'isLocked'],
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
            <button 
                v-if="title === 'Столбец 1 (до 3 карточек)'" 
                @click="$emit('add-note')" 
                :disabled="notes.length >= maxNotes || isLocked"
            >Добавить карточку</button>
        </div>
    `
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
                @move-note="moveNote"
                @add-note="openModal"
            ></column>
            <column 
                title="Столбец 2 (до 5 карточек)" 
                :notes="secondColumnNotes" 
                :maxNotes="5" 
                :isLocked="false"
                @update-note="updateNote"
                @move-note="moveNote"
            ></column>
            <column 
                title="Столбец 3 (без ограничений)" 
                :notes="thirdColumnNotes" 
                :maxNotes="Infinity" 
                :isLocked="false"
                @update-note="updateNote"
                @move-note="moveNote"
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
                    </div>
                    <button @click="addNewItem">Добавить пункт</button>
                    <button @click="createNote">Создать карточку</button>
                    <button @click="closeModal">Отмена</button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            // notes: JSON.parse(localStorage.getItem('notes')) || [],
            notes: [],
            isFirstColumnLocked: false,
            isModalOpen: false,
            newNoteTitle: '',
            newNoteItems: [{ text: '', completed: false }]
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
            this.newNoteItems.push({ text: '', completed: false });
        },
        createNote() {
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
        updateNote(index, updatedNote) {
            this.notes[index] = updatedNote;
            this.checkNoteCompletion(index);
            this.saveNotes();
        },
        moveNote(index, newColumn) {
            this.notes[index].column = newColumn;
            this.saveNotes();
        },
        checkNoteCompletion(index) {
            const note = this.notes[index];
            const completedItems = note.items.filter(item => item.completed).length;
            const totalItems = note.items.length;

            if (completedItems === totalItems) {
                // Перемещение в третий столбец
                this.moveNote(index, 3);
            } else if (completedItems > totalItems / 2 && note.column === 1) {
                if (this.secondColumnNotes.length < 5) {
                    this.moveNote(index, 2);
                } else {
                    this.isFirstColumnLocked = true; // Блокировка первой колонки
                }
            } else if (note.column === 2 && completedItems === totalItems) {
                this.moveNote(index, 3);
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