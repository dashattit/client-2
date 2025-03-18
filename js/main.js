// компонент column
Vue.component('column', {
    // данные
    props: ['title', 'notes', 'maxNotes', 'isLocked', 'allowAdd'],
    // шаблон
    template: `
    <div class="column" :class="{ 'locked': isLocked }">
        <h2>{{ title }}</h2>
        <note-card v-for="(note, index) in notes"
                :note="note"
                :key="note.id"
                @update-note="$emit('update-note', index)"
                @move-note="$emit('move-note', index)"
        </note-card>
        <button @click="$emit('add-note')" v-if="allowAdd" :disabled="notes.length >= maxNotes || isLocked">Добавить карточку</button>
    </div>
    `,
});

// компонент node-card
Vue.component('node-card', {
    props: ['note'],
    // шаблон
    template: `
    <div class="node-card">
        <h3>{{ note.title }}</h3>
        <ul>
            <li v-for="(item, index) in note.items" :key="index">
                <label>
                    <input type="checkbox" v-model="item.completed" @change="updateCompletion">
                    {{ item.text }}
                </label>
            </li>
        </ul>
        <p v-if="note.completedDate">Завершено: </p>
    </div>  
    `,
    //метод для обработки изменения пункта
    methods: {
        updateCompletion() {
            //генерация события и передача карточки
            this.$emit('update-note', this.note);
        }
    }
});

let App = ({
    template: `
    <div class="columns">
        <column
            title="Столбец 1"
            :notes="firstColumnNotes"
            :maxNotes="maxNotes"
            :isLocked="isFirstColumnLocked"
            :allowAdd="true"
            @update-note="updateNote"
            @move-note="moveNote"
            @add-note="addNote"
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
    </div>
    `,
    data() {
        return {
            notes: null,
            isFirstColumnLocked: false,
        }
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
    }
})

let vue = new Vue({
    el: '#app',
    template: `</app>`,
    components: {
        App
    }
})