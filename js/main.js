Vue.component('node-card', {
    props: ['note'],
    template: `
    <div class="node-card">
        <h3>{{ note.title }}</h3>
        <ul>
            <li v-for="note in notes">
                <label>
                    <input type="checkbox" v-model="item.completed" @change="updateCompletion">
                    {{ item.text }}
                </label>
            </li>
        </ul>
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

Vue.component('column', {
    // данные
    props: ['title', 'notes', 'maxNotes', 'isLocked', 'allowAdd'],
    // шаблон
    template: `
    <div class="column" :class="{ 'locked': isLocked }">
        <h2>{{ title }}</h2>
        <note-card v-for="note in notes"
                :note="note"
                :key="note.id"
                @update-note="$emit('update-note', index)"
                @move-note="$emit('move-note', index)"
        </note-card>
    </div>
    `,
});




let vue = new Vue({
    el: '#app',
    template: `</app>`,
    components: {
        App
    }
})